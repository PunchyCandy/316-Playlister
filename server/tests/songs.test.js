import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import request from "supertest";
import app from "../app";
import { setupTestDB, teardownTestDB, resetDB } from "./setup";

let ownerToken;
let ownerEmail = "owner@example.com";
let otherToken;
let otherEmail = "other@example.com";

async function registerAndLogin(email) {
  await request(app).post("/api/auth/register").send({
    username: email.split("@")[0],
    email,
    password: "pass1234"
  });
  const res = await request(app).post("/api/auth/login").send({
    email,
    password: "pass1234"
  });
  return res.body.token;
}

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await resetDB();
  ownerToken = await registerAndLogin(ownerEmail);
  otherToken = await registerAndLogin(otherEmail);
});

describe("Songs API", () => {
  it("creates a song and prevents duplicates by title/artist/year", async () => {
    const first = await request(app).post("/api/songs").send({
      ownerEmail,
      title: "Track",
      artist: "Artist",
      year: "2024",
      youtubeId: "abc"
    });
    expect(first.status).toBe(201);

    const dup = await request(app).post("/api/songs").send({
      ownerEmail,
      title: "Track",
      artist: "Artist",
      year: "2024",
      youtubeId: "def"
    });
    expect(dup.status).toBe(409);
  });

  it("allows owner to update a song, blocks others", async () => {
    const createRes = await request(app).post("/api/songs").send({
      ownerEmail,
      title: "Track",
      artist: "Artist",
      year: "2024",
      youtubeId: "abc"
    });
    const songId = createRes.body._id;

    const updateOwner = await request(app)
      .put(`/api/songs/${songId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ title: "Updated Title" });
    expect(updateOwner.status).toBe(200);
    expect(updateOwner.body.title).toBe("Updated Title");

    const updateOther = await request(app)
      .put(`/api/songs/${songId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ title: "Hacked Title" });
    expect(updateOther.status).toBe(403);
  });

  it("allows owner to delete a song", async () => {
    const createRes = await request(app).post("/api/songs").send({
      ownerEmail,
      title: "Track",
      artist: "Artist",
      year: "2024",
      youtubeId: "abc"
    });
    const songId = createRes.body._id;

    const delRes = await request(app)
      .delete(`/api/songs/${songId}`)
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(delRes.status).toBe(200);

    const list = await request(app).get("/api/songs");
    expect(list.body.length).toBe(0);
  });
});
