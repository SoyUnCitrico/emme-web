/// <reference types="react-scripts" />

declare namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      REACT_APP_EMAILJS_SERVICE_ID: string;
      REACT_APP_EMAILJS_TEMPLATE_ID: string;
      REACT_APP_EMAILJS_PUBLIC_KEY: string;
    }
  }