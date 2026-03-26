import { defineConfig } from "cypress";

/**
 * cypress.config.js
 * -----------------------
 * This file contains the configuration for Cypress end-to-end testing in the TimeSync application. It defines the base URL for the application under test and sets up the development server for component testing. The configuration ensures that Cypress can properly interact with the application during testing, allowing for efficient and effective test execution. By centralizing the configuration in this file, we can easily manage and update testing settings as needed, ensuring that our tests remain reliable and maintainable over time.
 * 
 * The e2e section specifies the base URL for end-to-end tests, while the component section configures the development server for component testing using React and Vite. This setup allows us to run both types of tests seamlessly within the Cypress framework.
 * 
 * For more information on Cypress configuration options, refer to the official documentation: https://docs.cypress.io/guides/references/configuration
 * 
 * Note: Ensure that the backend server is running at http://localhost:5000 when executing end-to-end tests, as the base URL is set to http://localhost:5173 for the frontend application.
 * 
 * To run end-to-end tests, use the command: npx cypress open --e2e
 * To run component tests, use the command: npx cypress open --component
 */

// Export the Cypress configuration using defineConfig to set up the testing environment for both end-to-end and component tests.
export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});
