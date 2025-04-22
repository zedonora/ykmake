export const PRODUCTION = 'production'
export const DEVELOPMENT = 'development'

export const isProduction = () => process.env.NODE_ENV === PRODUCTION
export const isDevelopment = () => process.env.NODE_ENV === DEVELOPMENT
