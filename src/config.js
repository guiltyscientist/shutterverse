const isProduction = import.meta.env.PROD;
export const API_BASE_URL = isProduction
    ? ''  // Empty for same origin in production
    : 'http://localhost:3000';