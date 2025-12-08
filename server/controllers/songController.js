const Song = require("../models/song");
const Playlist = require("../models/playlist");

exports.getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find().lean();
    res.json(songs);
  } catch (err) {
    console.error("getAllSongs error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.createSong = async (req, res) => {
  try {
    const { ownerEmail, title, artist, year, youtubeId } = req.body;
    if (!ownerEmail || !title || !artist) {
      return res
        .status(400)
        .json({ error: "ownerEmail, title, and artist are required" });
    }

    const song = await Song.create({
      ownerEmail,
      title,
      artist,
      year: year || "",
      youtubeId: youtubeId || ""
    });

    res.status(201).json(song);
  } catch (err) {
    console.error("createSong error:", err);
    res.status(400).json({ error: err.message || "Failed to create song" });
  }
};

exports.updateSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ error: "Song not found" });

    if (!req.user || req.user.email !== song.ownerEmail) {
      return res.status(403).json({ error: "Not authorized to edit this song" });
    }

    const { title, artist, year, youtubeId } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (artist !== undefined) update.artist = artist;
    if (year !== undefined) update.year = year;
    if (youtubeId !== undefined) update.youtubeId = youtubeId;

    const updated = await Song.findByIdAndUpdate(req.params.id, update, {
      new: true
    }).lean();

    res.json(updated);
  } catch (err) {
    console.error("updateSong error:", err);
    res.status(400).json({ error: err.message || "Failed to update song" });
  }
};

exports.deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).lean();
    if (!song) return res.status(404).json({ error: "Song not found" });

    if (!req.user || req.user.email !== song.ownerEmail) {
      return res.status(403).json({ error: "Not authorized to delete this song" });
    }

    await Song.findByIdAndDelete(req.params.id);

    // remove song from all playlists and decrement playlist counts
    await Playlist.updateMany(
      { songs: song._id },
      { $pull: { songs: song._id } }
    );

    res.json(song);
  } catch (err) {
    console.error("deleteSong error:", err);
    res.status(500).json({ error: "Failed to delete song" });
  }
};
