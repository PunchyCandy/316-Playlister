const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    userName: { type: String, required: true },

    email:     { type: String, required: true, unique: true },

    passwordHash: { type: String, default: "" },

    avatar: { type: String, default: "" },

    playlists: [
      {
        type: Schema.Types.ObjectId,
        ref: "Playlist"
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
