const request = require("supertest");
const app = require("../src/server");

/**
 * timeEntry.test.js
 * -----------------------
 * Test suite for time entry-related API endpoints. 
 * Uses Supertest to simulate HTTP requests and validate responses. 
 */

/* ======================================================
   TIME ENTRY TESTS
====================================================== */
describe("Time Entries API", () => {

  test("Get time entries should return response", async () => {

    const res = await request(app).get("/api/timeEntries");

    expect(res.statusCode).toBeLessThan(500);

  });

});