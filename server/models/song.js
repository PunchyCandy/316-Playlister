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

// No duplicate songs by (title, artist, year)
SongSchema.index({ title: 1, artist: 1, year: 1 }, { unique: true });

module.exports = mongoose.models.Song || mongoose.model("Song", SongSchema);
