const supertest = require("supertest");
const { app } = require("../server.js");
const cookieSess = require("cookie-session");

test("GET /login redirects to /petition if user's logged in", () => {
    const fakeSess = { userId: 2 };
    cookieSess.mockSessionOnce(fakeSess);
    return supertest(app)
        .get("/login")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location.endsWith("/petition")).toBe(true);
        });
});

test("GET /register redirects to /petition if they're logged in", () => {
    const fakeSess = { userId: 2 };
    cookieSess.mockSessionOnce(fakeSess);
    return supertest(app)
        .get("/register")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location.endsWith("/petition")).toBe(true);
        });
});

test("GET /login redirects to /thanks if appropriate(logged in + signed)", () => {
    const fakeSess = { userId: 2, signature: true };
    cookieSess.mockSession(fakeSess);

    return Promise.all([
        supertest(app).get("/login"),
        supertest(app).get("/petition"),
    ]).then((res) => {
        expect(res[0].statusCode).toBe(302);
        expect(res[0].headers.location.endsWith("/petition")).toBe(true);
        expect(res[1].statusCode).toBe(302);
        expect(res[1].headers.location.endsWith("/thanks")).toBe(true);
    });
    // return supertest(app)
    //     .get("/login")
    //     .then((res) => {
    //         expect(res.statusCode).toBe(302);
    //         expect(res.headers.location.endsWith("/petition")).toBe(true);
    //     })
    //     .get("/petition")
    //     .then((res) => {
    //         expect(res.statusCode).toBe(302);
    //         expect(res.headers.location.endsWith("/thanks")).toBe(true);
    //     });
});
