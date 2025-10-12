// Environment configuration for the application
export const environment = {
  // Backend API configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  
  // Development mode
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // App configuration
  appName: 'Apple Music Downloader',
  version: '1.0.0',
} as const;

// Export individual values for convenience
export const API_BASE_URL = environment.apiBaseUrl;
export const IS_DEVELOPMENT = environment.isDevelopment;
export const IS_PRODUCTION = environment.isProduction;
