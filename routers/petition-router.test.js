const supertest = require("supertest");
const { app } = require("../server.js");
const cookieSess = require("cookie-session");

test("GET /petition redirects to /register if appropriate (not registered)", () => {
    const fakeSess = {};
    cookieSess.mockSessionOnce(fakeSess);
    return supertest(app)
        .get("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location.endsWith("/register")).toBe(true);
        });
});

test("GET /petition redirects to /thanks if appropriate(logged in + signed)", () => {
    const fakeSess = { userId: 2, signature: true };
    cookieSess.mockSessionOnce(fakeSess);
    return supertest(app)
        .get("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location.endsWith("/thanks")).toBe(true);
        });
});

test("GET /thanks redirects to /petition if appropriate (logged in + note signed", () => {
    const fakeSess = { userId: 2 };
    cookieSess.mockSessionOnce(fakeSess);
    return supertest(app)
        .get("/thanks")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location.endsWith("/petition")).toBe(true);
        });
});

test("GET /signatories redirects to /petition if appropriate (logged in + note signed", () => {
    const fakeSess = { userId: 2 };
    cookieSess.mockSessionOnce(fakeSess);
    return supertest(app)
        .get("/signatories")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location.endsWith("/petition")).toBe(true);
        });
});
