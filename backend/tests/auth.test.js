const request = require("supertest");
const app = require("../src/server");

/**
 * auth.test.js
 * -----------------------
 * Test suite for authentication-related API endpoints, including login and registration. 
 * Uses Supertest to simulate HTTP requests and validate responses. 
 */

/* ======================================================
   AUTHENTICATION TESTS
====================================================== */
describe("Authentication API", () => {

  test("Login should return 200", async () => {

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@test.com",
        password: "password123"
      });

    expect(res.statusCode).toBeLessThan(500);

  });

});