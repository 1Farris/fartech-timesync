const request = require("supertest");
const app = require("../src/server");

/**
 * server.test.js
 * -----------------------
 * Basic test suite to verify that the Express server is running and responding to requests. 
 * Uses Supertest to simulate HTTP requests and validate responses. 
 */

describe("Server Test", () => {

  test("Server should respond", async () => {

    const res = await request(app).get("/");

    expect(res.statusCode).toBeLessThan(500);

  });

});