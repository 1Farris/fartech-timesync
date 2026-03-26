const request = require("supertest");
const app = require("../src/server");

/**
 * health.test.js
 * -----------------------
 * Test suite for the health check API endpoint. 
 * Validates that the server is running and responding with the expected status. 
 */

/* ======================================================
   HEALTH CHECK TESTS
====================================================== */
describe("Health Check API", () => {

  test("GET /health should return server status", async () => {

    const res = await request(app).get("/health");

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("OK");

  });

});