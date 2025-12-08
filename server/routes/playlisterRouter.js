const express = require("express");
const router = express.Router();
const controller = require("../controllers/playlistController");
const songController = require("../controllers/songController");
const { authRequired } = require("../middleware/authMiddleware");

// ---- PLAYLISTS ---- //
router.get("/playlists", controller.getAllPlaylists);
router.post("/playlists", controller.createPlaylist);

router.get("/playlists/:id", controller.getPlaylistById);
router.put("/playlists/:id", controller.updatePlaylist);
router.delete("/playlists/:id", controller.deletePlaylist);

// ---- PLAYLIST SONGS ---- //
router.post("/playlists/:id/songs", controller.addSongToPlaylist);
router.delete("/playlists/:id/songs/:songId", controller.removeSongFromPlaylist);

// ---- SONGS ---- //
router.get("/songs", songController.getAllSongs);
router.post("/songs", songController.createSong);
router.put("/songs/:id", authRequired, songController.updateSong);
router.delete("/songs/:id", authRequired, songController.deleteSong);

module.exports = router;
