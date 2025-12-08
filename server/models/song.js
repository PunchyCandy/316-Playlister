const mongoose = require("mongoose");
const { Schema } = mongoose;

const SongSchema = new Schema(
  {
    ownerEmail: { type: String, required: true },
    title:      { type: String, required: true },
    artist:     { type: String, required: true },
    youtubeId:  { type: String, default: "" },
    year:       { type: String, default: "" },
    listens:    { type: Number, default: 0 },
    playlists:  { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Song", SongSchema);
