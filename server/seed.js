require("dotenv").config();
const path = require("path");
const fs = require("fs");

const { connectToDatabase } = require("./db");
const User = require("./models/user");
const Song = require("./models/song");
const Playlist = require("./models/playlist");

async function seed() {
  await connectToDatabase();

  // 1. Load JSON
  const filePath = path.join(__dirname, "data", "PlaylisterData.json");
  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);

  const usersJson = data.users || [];
  const playlistsJson = data.playlists || [];
  const bcrypt = require("bcryptjs");

  console.log(
    `Loaded ${usersJson.length} users and ${playlistsJson.length} playlists from JSON`
  );

  // 2. Clear existing collections (so you can re-seed easily while developing)
  await User.deleteMany({});
  await Song.deleteMany({});
  await Playlist.deleteMany({});
  console.log("Cleared existing users, songs, and playlists");


const defaultPassword = "aaaaaaaa";
const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

const userDocs = await User.insertMany(
  usersJson.map((u) => {
    return {
      userName: u.name,
      email: u.email,
      passwordHash: hashedPassword,  // hashed, not plaintext
      avatar: ""                     // no avatar in seed data
    };
  })
);
  const userByEmail = new Map(userDocs.map((u) => [u.email, u]));
  console.log(`Inserted ${userDocs.length} users`);

  // 4. Build unique Songs from all playlists
  const songMap = new Map(); // key -> songData

  function songKey(song) {
    return `${song.title}||${song.artist}||${song.year}||${song.youTubeId}`;
  }

  for (const pl of playlistsJson) {
    const ownerEmail = pl.ownerEmail;

    for (const s of pl.songs || []) {
      const key = songKey(s);

      if (!songMap.has(key)) {
        songMap.set(key, {
          title: s.title,
          artist: s.artist,
          year: String(s.year ?? ""),
          youtubeId: s.youTubeId,
          ownerEmail: ownerEmail, // first owner
          listens: 0,
          playlists: 0
        });
      }

      // increment "how many playlists contain this song"
      const entry = songMap.get(key);
      entry.playlists += 1;
    }
  }

  const allSongs = Array.from(songMap.values());
  const songDocs = await Song.insertMany(allSongs);
  console.log(`Inserted ${songDocs.length} unique songs`);

  // Build map from key -> Song _id
  const keyToSongId = new Map();
  for (const doc of songDocs) {
    const key = songKey({
      title: doc.title,
      artist: doc.artist,
      year: doc.year,
      youTubeId: doc.youtubeId
    });
    keyToSongId.set(key, doc._id);
  }

  // 5. Insert Playlists, wiring song ObjectIds
  const playlistDocs = await Playlist.insertMany(
    playlistsJson.map((pl) => ({
      name: pl.name,
      ownerEmail: pl.ownerEmail,
      songs: (pl.songs || []).map((s) =>
        keyToSongId.get(
          songKey({
            title: s.title,
            artist: s.artist,
            year: s.year,
            youTubeId: s.youTubeId
          })
        )
      ),
      listeners: [] // empty for now
    }))
  );

  console.log(`Inserted ${playlistDocs.length} playlists`);

  // 6. Attach playlist ids to Users.playlists based on ownerEmail
  const emailToPlaylistIds = new Map();

  for (const pl of playlistDocs) {
    const arr = emailToPlaylistIds.get(pl.ownerEmail) || [];
    arr.push(pl._id);
    emailToPlaylistIds.set(pl.ownerEmail, arr);
  }

  for (const user of userDocs) {
    user.playlists = emailToPlaylistIds.get(user.email) || [];
    await user.save();
  }

  console.log("Linked users to their playlists");

  console.log("✅ Seeding complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
