// Environment configuration for the application
export const environment = {
  // Backend API configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  
  // iTunes API configuration
  itunesApiBase: import.meta.env.VITE_ITUNES_API_BASE || 'https://itunes.apple.com/search',
  itunesLookupBase: import.meta.env.VITE_ITUNES_LOOKUP_BASE || 'https://itunes.apple.com/lookup',
  
  // Apple Music configuration
  appleMusicBase: import.meta.env.VITE_APPLE_MUSIC_BASE || 'https://music.apple.com',
  
  // Development mode
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // App configuration
  appName: 'Apple Music Downloader',
  version: '1.0.0',
} as const;

// Export individual values for convenience
export const API_BASE_URL = environment.apiBaseUrl;
export const ITUNES_API_BASE = environment.itunesApiBase;
export const ITUNES_LOOKUP_BASE = environment.itunesLookupBase;
export const APPLE_MUSIC_BASE = environment.appleMusicBase;
export const IS_DEVELOPMENT = environment.isDevelopment;
export const IS_PRODUCTION = environment.isProduction;
