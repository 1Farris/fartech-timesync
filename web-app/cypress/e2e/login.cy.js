
/**
 * login.cy.js
 * -----------------------
 * End-to-end test for the login functionality of the web application. 
 * Uses Cypress to simulate user interactions with the login page, including form filling and submission. 
 * Mocks Firebase authentication responses to validate successful login and redirection to the dashboard.
 */

describe("Login Page E2E Test", () => {

  it("logs in successfully", () => {

    // Mock Firebase login
    cy.intercept("POST", "**/accounts:signInWithPassword*", {
      statusCode: 200,
      body: {
        idToken: "fake-token",
        email: "test@test.com",
        refreshToken: "fake-refresh",
        expiresIn: "3600",
        localId: "12345"
      }
    }).as("loginRequest");

    // Mock user lookup (prevents redirect back to login)
    cy.intercept("POST", "**/accounts:lookup*", {
      statusCode: 200,
      body: {
        users: [
          {
            localId: "12345",
            email: "test@test.com"
          }
        ]
      }
    }).as("lookupRequest");

    // Visit login page
    cy.visit("http://localhost:5173/login");

    // Fill login form
    cy.get('input[type="email"]').should("be.visible").type("test@test.com");
    cy.get('input[type="password"]').should("be.visible").type("password123");

    // Submit form
    cy.get('button[type="submit"]').click();

    // Wait for login API
    cy.wait("@loginRequest");

    // Navigate to dashboard
    cy.visit("http://localhost:5173/dashboard");

    // Verify dashboard page
    cy.url().should("include", "/dashboard");

  });

});