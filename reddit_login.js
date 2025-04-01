const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

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

async function loginToReddit() {
  // Get credentials from file
  const credentials = getCredentials();
  
  console.log(`Attempting to login with username: ${credentials.username}`);
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  try {
    const page = await browser.newPage();
    
    // Navigate to Reddit login page
    console.log('Navigating to Reddit login page...');
    await page.goto('https://www.reddit.com/login/', { waitUntil: 'networkidle2' });
    
    // Check if we're on the login page
    console.log('Checking if we reached the login page...');
    
    // Wait for login form to be visible
    await page.waitForSelector('input[name="username"]', { timeout: 10000 })
      .catch(() => {
        throw new Error('Login form not found or blocked by Cloudflare');
      });
    
    // Fill in the username and password
    console.log('Filling login credentials...');
    await page.type('input[name="username"]', credentials.username);
    await page.type('input[name="password"]', credentials.password);
    
    // Click the login button
    console.log('Submitting login form...');
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
    
    // Check if login was successful (look for user profile icon)
    const isLoggedIn = await page.evaluate(() => {
      // Look for elements that would indicate successful login
      return document.querySelector('button[aria-label="Open user menu"]') !== null || 
             document.querySelector('*[data-testid="user-menu-toggle"]') !== null;
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
    await browser.close();
    process.exit(1);
  }
}

// Execute the login function
loginToReddit().catch(console.error);
