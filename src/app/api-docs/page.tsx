"use client";

import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const ApiDocsPage = () => {
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <SwaggerUI url="/api/docs" />
    </div>
  );
};

export default ApiDocsPage;
