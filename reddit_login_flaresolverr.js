const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const axios = require('axios'); // You may need to install this: npm install axios

// Function to read credentials from file
function getCredentials() {
  try {
    const credentialsPath = path.join(__dirname, 'reddit_credentials.json');
    const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');
    return JSON.parse(credentialsContent);
  } catch (error) {
    console.error('Error reading credentials:', error);
    process.exit(1);
  }
}

// Function to get cookies from FlareSolverr
async function getFlareSolverrCookies() {
  console.log('Using FlareSolverr to bypass Cloudflare protection...');
  
  try {
    const response = await axios.post('http://localhost:8191/v1', {
      cmd: 'request.get',
      url: 'https://www.reddit.com/login',
      maxTimeout: 60000
    });
    
    if (response.data.status === 'ok') {
      console.log('Successfully bypassed Cloudflare!');
      return response.data.solution.cookies;
    } else {
      throw new Error(`FlareSolverr error: ${response.data.message}`);
    }
  } catch (error) {
    console.error('FlareSolverr request failed:', error.message);
    throw error;
  }
}

async function loginToReddit() {
  // Get credentials from file
  const credentials = getCredentials();
  
  console.log(`Attempting to login with username: ${credentials.username}`);
  
  // Get cookies from FlareSolverr
  const cookies = await getFlareSolverrCookies();
  console.log(`Got ${cookies.length} cookies from FlareSolverr`);
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  try {
    const page = await browser.newPage();
    
    // Set cookies from FlareSolverr
    for (const cookie of cookies) {
      await page.setCookie(cookie);
    }
    
    // Navigate to Reddit login page
    console.log('Navigating to Reddit login page...');
    await page.goto('https://www.reddit.com/login/', { waitUntil: 'networkidle2' });
    
    // Take a screenshot to verify we bypassed Cloudflare
    await page.screenshot({ path: 'reddit_pre_login.png', fullPage: true });
    
    // Check if we're on the login page
    console.log('Checking if we reached the login page...');
    
    // Wait for login form to be visible
    await page.waitForSelector('input[name="username"]', { timeout: 10000 })
      .catch(async (error) => {
        console.log('Login form not immediately found, trying alternative selectors...');
        
        // Try other possible selectors
        const altSelectors = [
          'input[id="loginUsername"]',
          'input[autocomplete="username"]',
          'form[action*="login"] input[type="text"]'
        ];
        
        for (const selector of altSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 5000 });
            console.log(`Found alternative login form using selector: ${selector}`);
            return; // If we find a selector, continue with the script
          } catch (err) {
            console.log(`Selector ${selector} not found`);
          }
        }
        
        // If we get here, none of the selectors worked
        throw new Error('Login form not found even after trying alternative selectors');
      });
    
    // Fill in the username and password
    console.log('Filling login credentials...');
    
    // Try different selectors for username and password
    try {
      await page.type('input[name="username"]', credentials.username);
      await page.type('input[name="password"]', credentials.password);
    } catch (error) {
      console.log('Standard selectors failed, trying alternative selectors');
      
      // Try alternative selectors
      await page.type('input[id="loginUsername"]', credentials.username);
      await page.type('input[id="loginPassword"]', credentials.password);
    }
    
    // Click the login button
    console.log('Submitting login form...');
    try {
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2' })
      ]);
    } catch (error) {
      console.log('Standard submit button not found or navigation failed, trying alternatives');
      
      // Try to find the button by text content
      const loginButtons = await page.$$('button');
      let clicked = false;
      
      for (const button of loginButtons) {
        const buttonText = await page.evaluate(el => el.textContent, button);
        if (buttonText.toLowerCase().includes('log in') || buttonText.toLowerCase().includes('login')) {
          await button.click();
          clicked = true;
          await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {
            console.log('Navigation did not complete, but continuing anyway');
          });
          break;
        }
      }
      
      if (!clicked) {
        console.log('Could not find login button, taking screenshot for debugging');
        await page.screenshot({ path: 'reddit_login_form.png', fullPage: true });
      }
    }
    
    // Check if login was successful
    const isLoggedIn = await page.evaluate(() => {
      // Look for elements that would indicate successful login
      return document.querySelector('button[aria-label="Open user menu"]') !== null || 
             document.querySelector('*[data-testid="user-menu-toggle"]') !== null ||
             document.querySelector('a[href^="/user/"]') !== null;
    });
    
    if (isLoggedIn) {
      console.log('Successfully logged in to Reddit!');
      await page.screenshot({ path: 'reddit_logged_in.png', fullPage: true });
    } else {
      console.log('Login might have failed. Taking screenshot for debugging...');
      await page.screenshot({ path: 'reddit_login_attempt.png', fullPage: true });
    }
    
    // Keep the browser open for inspection
    console.log('Login process completed. Browser will remain open for inspection.');
    console.log('Press Ctrl+C to exit when done.');
    
  } catch (error) {
    console.error('Error during login process:', error);
    await browser.screenshot({ path: 'reddit_error.png', fullPage: true });
    // Don't close the browser to allow manual inspection
    console.log('Error occurred, but browser remains open for debugging');
  }
}

// Execute the login function
loginToReddit().catch(console.error);
