declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_USERNAME: string;
      DB_PASSWORD: string;
      DB_HOST: string;
      DB_PORT: string;
      DB_DATABASE: string;
      REDIS_URL: string;
      REDIS_SECRET: string;
      API_PORT: string;
      FRONTEND_ORIGIN: string;
      BACKEND_ORIGIN: string;
      DOMAIN_SUFFIX: string;
      NON_API_ERROR_PREFIX: string;
      NON_API_ERROR_SUFFIX: string;
      AWS_REGION: string;
      AWS_ACCOUNT_ID: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      S3_BUCKET: string;
      QUICKSIGHT_DASHBOARD_ID: string;
      FIREBASE_ADMIN_TYPE: string;
      FIREBASE_ADMIN_PROJECT_ID: string;
      FIREBASE_ADMIN_PRIVATE_KEY_ID: string;
      FIREBASE_ADMIN_PRIVATE_KEY: string;
      FIREBASE_ADMIN_CLIENT_EMAIL: string;
      FIREBASE_ADMIN_CLIENT_ID: string;
      FIREBASE_ADMIN_AUTH_URI: string;
      FIREBASE_TOKEN_URI: string;
      FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL: string;
      FIREBASE_ADMIN_CLIENT_X509_CERT_URL: string;
      SMTP_HOST: string;
      SMTP_PORT: string;
      SMTP_SECURE: string;
      SMTP_USER: string;
      SMTP_PASS: string;
    }
  }
}

export {}
