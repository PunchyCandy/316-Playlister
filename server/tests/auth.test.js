import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import request from "supertest";
import app from "../app";
import { setupTestDB, teardownTestDB, resetDB } from "./setup";

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await resetDB();
});

describe("Auth API", () => {
  it("registers a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "alice",
      email: "alice@example.com",
      password: "pass1234"
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("alice@example.com");
  });

  it("prevents duplicate email registration", async () => {
    await request(app).post("/api/auth/register").send({
      username: "alice",
      email: "alice@example.com",
      password: "pass1234"
    });

    const res = await request(app).post("/api/auth/register").send({
      username: "alice2",
      email: "alice@example.com",
      password: "pass5678"
    });

    expect(res.status).toBe(409);
  });

  it("logs in an existing user", async () => {
    await request(app).post("/api/auth/register").send({
      username: "alice",
      email: "alice@example.com",
      password: "pass1234"
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "alice@example.com",
      password: "pass1234"
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("alice@example.com");
  });

  it("rejects invalid credentials", async () => {
    await request(app).post("/api/auth/register").send({
      username: "alice",
      email: "alice@example.com",
      password: "pass1234"
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "alice@example.com",
      password: "wrong"
    });

    expect(res.status).toBe(401);
  });
});
