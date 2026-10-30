import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SinoFlow API Documentation',
      version: '1.0.0',
      description: 'API documentation for the SinoFlow Chinese Language Learning Platform',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'authjs.session-token',
        },
      },
    },
  },
  apis: ['./src/app/api/**/*.ts'], // Path to the API docs
};

export const getApiDocs = () => {
  const spec = swaggerJsdoc(options);
  return spec;
};
