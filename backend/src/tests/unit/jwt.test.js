require("dotenv").config();
const { expect } = require("chai");
const { generateToken, verifyToken } = require("../../utils/jwt");
describe("checking jwt utility", () => {
    it("should generate a token", () => {
        const token = generateToken({
            id: "123",
            email: "test@gmail.com"
        });
        expect(token).to.be.a("string");
    });
    it("should verify generated token", () => {
        const token = generateToken({
            id: "123",
            email: "test@gmail.com"
        });
        const decoded = verifyToken(token);

        expect(decoded.id).to.equal("123");
        expect(decoded.email).to.equal("test@gmail.com");
    });
});