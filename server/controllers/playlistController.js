const store = require("../data/playlistStore");

// ---- PLAYLIST CRUD ---- //
exports.getAllPlaylists = (req, res) => {
  res.json(store.getAllPlaylists());
};

exports.getPlaylistById = (req, res) => {
  const playlist = store.getPlaylistById(req.params.id);
  if (!playlist) return res.status(404).json({ error: "Playlist not found" });
  res.json(playlist);
};

exports.createPlaylist = (req, res) => {
  try {
    const playlist = store.createPlaylist(req.body);
    res.status(201).json(playlist);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updatePlaylist = (req, res) => {
  const playlist = store.updatePlaylist(req.params.id, req.body);
  if (!playlist) return res.status(404).json({ error: "Playlist not found" });
  res.json(playlist);
};

exports.deletePlaylist = (req, res) => {
  const deleted = store.deletePlaylist(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Playlist not found" });
  res.json(deleted);
};

// ---- PLAYLIST SONG OPERATIONS ---- //
exports.addSongToPlaylist = (req, res) => {
  try {
    const song = store.addSongToPlaylist(req.params.id, req.body);
    if (!song) return res.status(404).json({ error: "Playlist not found" });
    res.status(201).json(song);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.removeSongFromPlaylist = (req, res) => {
  const removed = store.removeSongFromPlaylist(req.params.id, req.params.songId);
  if (!removed) return res.status(404).json({ error: "Song or playlist not found" });
  res.json(removed);
};
