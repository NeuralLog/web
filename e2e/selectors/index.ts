/**
 * Common selectors for E2E tests
 *
 * This file contains all the selectors used in E2E tests.
 * Using a common file for selectors makes tests more maintainable.
 * If the UI changes, we only need to update the selectors in one place.
 */

// Common selectors
export const common = {
  // Navigation
  navigation: {
    homeLink: 'a:has-text("NeuralLog")',
    loginLink: 'a:has-text("Log In")',
    signUpLink: 'a:has-text("Sign Up")',
    dashboardLink: 'a:has-text("Dashboard")',
    logsLink: 'a:has-text("Logs")',
    modelsLink: 'a:has-text("Models")',
    settingsLink: 'a:has-text("Settings")',
  },

  // User menu
  userMenu: {
    button: 'button:has(.rounded-full)',
    dropdown: '.user-menu-dropdown',
    profileLink: 'a:has-text("Profile")',
    settingsLink: 'a:has-text("Settings")',
    logoutButton: 'button:has-text("Sign out")',
  },
};

// Home page selectors
export const home = {
  hero: {
    title: 'h1:has-text("NeuralLog")',
    description: 'p:has-text("The comprehensive logging")',
  },

  features: {
    container: '.grid-cols-1.md\\:grid-cols-2',
    featureCards: '.bg-white.dark\\:bg-gray-700.p-6.rounded-lg',
    featureTitles: 'h2.text-xl.font-semibold',
  },

  callToAction: {
    container: '.bg-brand-50.dark\\:bg-gray-700.p-6.rounded-lg.mb-8',
    title: 'h2:has-text("Ready to get started?")',
    signUpButton: 'a:has-text("Sign Up")',
    loginButton: 'a:has-text("Log In")',
    documentationButton: 'a:has-text("Documentation")',
  },

  footer: {
    container: 'footer',
    copyright: 'footer:has-text("NeuralLog")',
  },
};

// Login page selectors
export const login = {
  title: 'h2:has-text("Sign in to your account")',
  form: {
    container: 'form.space-y-6',
    emailInput: 'input[type="email"]',
    passwordInput: 'input[type="password"]',
    rememberMeCheckbox: 'input[type="checkbox"]#remember-me',
    submitButton: 'button:has-text("Sign in")',
    forgotPasswordLink: 'a:has-text("Forgot your password?")',
  },

  socialLogin: {
    container: '.mt-6.grid.grid-cols-2.gap-3',
    googleButton: 'button:has-text("Google")',
    githubButton: 'button:has-text("GitHub")',
  },

  signUpLink: 'a:has-text("create a new account")',
};

// Sign-up page selectors
export const signUp = {
  title: 'h2:has-text("Create a new account")',
  form: {
    container: 'form.space-y-6',
    firstNameInput: 'input#first-name',
    lastNameInput: 'input#last-name',
    emailInput: 'input[type="email"]',
    passwordInput: 'input[type="password"]',
    termsCheckbox: 'input#terms',
    submitButton: 'button:has-text("Sign up")',
  },

  socialSignUp: {
    container: '.mt-6.grid.grid-cols-2.gap-3',
    googleButton: 'button:has-text("Google")',
    githubButton: 'button:has-text("GitHub")',
  },

  loginLink: 'a:has-text("sign in to your existing account")',
};

// Dashboard page selectors
export const dashboard = {
  header: {
    title: 'h1:has-text("Dashboard")',
  },

  stats: {
    container: '.grid.grid-cols-1.gap-5.sm\\:grid-cols-2.lg\\:grid-cols-4',
    cards: '.bg-white.dark\\:bg-gray-800.overflow-hidden.shadow.rounded-lg',
    totalLogs: 'dt:has-text("Total Logs")',
    successRate: 'dt:has-text("Success Rate")',
    avgLatency: 'dt:has-text("Avg. Latency")',
    activeModels: 'dt:has-text("Active Models")',
  },

  recentLogs: {
    container: '.bg-white.dark\\:bg-gray-800.shadow.overflow-hidden.sm\\:rounded-md',
    title: 'h3:has-text("Recent Logs")',
    viewAllButton: 'button:has-text("View All")',
    logItems: 'li',
    modelNames: 'p.text-sm.font-medium.text-brand-600',
    statusBadges: 'p.px-2.inline-flex.text-xs.leading-5.font-semibold.rounded-full',
    timestamps: 'p.text-sm.text-gray-500',
    latencies: 'p:has-text("Latency:")',
    viewDetailsButtons: 'button:has-text("View Details")',
    loadingSpinner: '.animate-spin',
    emptyState: 'div:has-text("No logs found")',
    errorState: 'div:has-text("Unable to connect")',
  },
};
