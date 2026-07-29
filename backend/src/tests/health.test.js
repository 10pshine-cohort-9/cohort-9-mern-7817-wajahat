const request = require("supertest");
const app = require("../app");

describe("Health API", () => {
    test("GET /health should return 200", async () => {
        try {
            const res = await request(app).get("/health");
            expect(res.body).toEqual({
            status: "UP",
            message: "Server is healthy"
        });
        } catch (error) {
            throw new Error(`GET /health endpoint request failed: ${error.message}`);
        }
    });
});