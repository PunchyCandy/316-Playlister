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

    const titleVal = title.trim();
    const artistVal = artist.trim();
    const yearVal = (year ?? "").toString().trim();

    const existing = await Song.findOne({
      title: titleVal,
      artist: artistVal,
      year: yearVal
    });
    if (existing) {
      return res
        .status(409)
        .json({ error: "Song with this title, artist, and year already exists" });
    }

    const song = await Song.create({
      ownerEmail,
      title: titleVal,
      artist: artistVal,
      year: yearVal,
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
    const nextTitle = title !== undefined ? title.trim() : song.title;
    const nextArtist = artist !== undefined ? artist.trim() : song.artist;
    const nextYear =
      year !== undefined ? (year ?? "").toString().trim() : song.year;
    const nextYoutube = youtubeId !== undefined ? youtubeId : song.youtubeId;

    // check duplicate combination
    const dupe = await Song.findOne({
      _id: { $ne: song._id },
      title: nextTitle,
      artist: nextArtist,
      year: nextYear
    });
    if (dupe) {
      return res
        .status(409)
        .json({ error: "Song with this title, artist, and year already exists" });
    }

    const update = {
      title: nextTitle,
      artist: nextArtist,
      year: nextYear,
      youtubeId: nextYoutube
    };

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
