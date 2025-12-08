const mongoose = require("mongoose");

const { Schema } = mongoose;

const PlaylistSchema = new Schema(
  {
    // _id is automatic (ObjectId), equivalent to your _id : String conceptually
    name: { type: String, required: true },
    ownerEmail: { type: String, required: true },

    // array of Song IDs
    songs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Song"
      }
    ],

    // array of listener e-mails
    listeners: [
      {
        type: String
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Playlist", PlaylistSchema);
