export const validateEnv = () => {
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'PORT'
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }

  // Validate MongoDB URI format
  const mongoUriPattern = /^mongodb(\+srv)?:\/\/.+/;
  if (!mongoUriPattern.test(process.env.MONGODB_URI)) {
    throw new Error('Invalid MONGODB_URI format');
  }

  console.log('Environment variables validated successfully');
}; 