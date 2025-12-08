const mongoose = require("mongoose");
const Playlist = require("../models/playlist");

// ---- PLAYLIST CRUD (Mongo) ---- //
exports.getAllPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "ownerEmail",
          foreignField: "email",
          as: "owner"
        }
      },
      {
        $addFields: {
          ownerUsername: { $arrayElemAt: ["$owner.userName", 0] },
          ownerAvatar: { $arrayElemAt: ["$owner.avatar", 0] }
        }
      },
      {
        $lookup: {
          from: "songs",
          localField: "songs",
          foreignField: "_id",
          as: "songDocs"
        }
      },
      {
        // preserve original song order
        $addFields: {
          songs: {
            $map: {
              input: "$songs",
              as: "sid",
              in: {
                $arrayElemAt: [
                  "$songDocs",
                  { $indexOfArray: ["$songDocs._id", "$$sid"] }
                ]
              }
            }
          }
        }
      },
      { $project: { owner: 0, songDocs: 0 } }
    ]);
    res.json(playlists);
  } catch (err) {
    console.error("getAllPlaylists error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getPlaylistById = async (req, res) => {
  try {
    const [playlist] = await Playlist.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: "users",
          localField: "ownerEmail",
          foreignField: "email",
          as: "owner"
        }
      },
      {
        $addFields: {
          ownerUsername: { $arrayElemAt: ["$owner.userName", 0] },
          ownerAvatar: { $arrayElemAt: ["$owner.avatar", 0] }
        }
      },
      {
        $lookup: {
          from: "songs",
          localField: "songs",
          foreignField: "_id",
          as: "songDocs"
        }
      },
      {
        $addFields: {
          songs: {
            $map: {
              input: "$songs",
              as: "sid",
              in: {
                $arrayElemAt: [
                  "$songDocs",
                  { $indexOfArray: ["$songDocs._id", "$$sid"] }
                ]
              }
            }
          }
        }
      },
      { $project: { owner: 0, songDocs: 0 } }
    ]);

    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    res.json(playlist);
  } catch (err) {
    console.error("getPlaylistById error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.createPlaylist = async (req, res) => {
  try {
    const { name, ownerEmail, songs = [], listeners = [] } = req.body;
    if (!name) return res.status(400).json({ error: "Playlist name required" });

    const playlist = await Playlist.create({
      name,
      ownerEmail: ownerEmail || "guest@example.com",
      songs,
      listeners
    });

    res.status(201).json(playlist);
  } catch (err) {
    console.error("createPlaylist error:", err);
    res.status(400).json({ error: err.message || "Failed to create playlist" });
  }
};

exports.updatePlaylist = async (req, res) => {
  try {
    const { name, songs, listeners } = req.body;

    const update = {};
    if (name !== undefined) update.name = name;
    if (Array.isArray(songs)) {
      update.songs = songs
        .map((s) => (typeof s === "string" ? s : s?._id))
        .filter(Boolean)
        .map((id) => new mongoose.Types.ObjectId(id));
    }
    if (Array.isArray(listeners)) update.listeners = listeners;

    const playlist = await Playlist.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).lean();
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    res.json(playlist);
  } catch (err) {
    console.error("updatePlaylist error:", err);
    res.status(400).json({ error: err.message || "Failed to update playlist" });
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    const deleted = await Playlist.findByIdAndDelete(req.params.id).lean();
    if (!deleted) return res.status(404).json({ error: "Playlist not found" });
    res.json(deleted);
  } catch (err) {
    console.error("deletePlaylist error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ---- PLAYLIST SONG OPERATIONS ---- //
exports.addSongToPlaylist = async (req, res) => {
  try {
    const { songId } = req.body;
    if (!songId) return res.status(400).json({ error: "songId required" });

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    if (!playlist.songs.find((id) => id.toString() === songId.toString())) {
      playlist.songs.push(songId);
      await playlist.save();
    }

    res.status(201).json(playlist);
  } catch (err) {
    console.error("addSongToPlaylist error:", err);
    res.status(400).json({ error: err.message || "Failed to add song" });
  }
};

exports.removeSongFromPlaylist = async (req, res) => {
  try {
    const { id, songId } = { id: req.params.id, songId: req.params.songId };
    const playlist = await Playlist.findById(id);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    playlist.songs = playlist.songs.filter(
      (s) => s.toString() !== songId.toString()
    );
    await playlist.save();

    res.json(playlist);
  } catch (err) {
    console.error("removeSongFromPlaylist error:", err);
    res.status(400).json({ error: err.message || "Failed to remove song" });
  }
};
