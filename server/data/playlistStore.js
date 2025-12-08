let nextPlaylistId = 1;
let nextSongId = 1;

const playlists = [
  {
    id: String(nextPlaylistId++),
    name: "Chill Vibes",
    ownerEmail: "guest@example.com",
    songs: [],
    listeners: 0
  }
];

// -------- Playlist Helpers -------- //
function findPlaylist(id) {
  return playlists.find((p) => p.id === id);
}

exports.getAllPlaylists = () => playlists;

exports.getPlaylistById = (id) => findPlaylist(id);

exports.createPlaylist = ({ name, ownerEmail }) => {
  if (!name) throw new Error("Playlist name required");

  const playlist = {
    id: String(nextPlaylistId++),
    name,
    ownerEmail: ownerEmail || "guest@example.com",
    songs: [],
    listeners: 0
  };

  playlists.push(playlist);
  return playlist;
};

exports.updatePlaylist = (id, body) => {
  const playlist = findPlaylist(id);
  if (!playlist) return null;

  Object.assign(playlist, body);
  return playlist;
};

exports.deletePlaylist = (id) => {
  const idx = playlists.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  return playlists.splice(idx, 1)[0];
};

// -------- Song Management -------- //
exports.addSongToPlaylist = (playlistId, data) => {
  const playlist = findPlaylist(playlistId);
  if (!playlist) return null;

  const { title, artist, year } = data;
  if (!title) throw new Error("Song title required");

  const song = {
    id: String(nextSongId++),
    title,
    artist: artist || "",
    year: year || "",
  };

  playlist.songs.push(song);
  return song;
};

exports.removeSongFromPlaylist = (playlistId, songId) => {
  const playlist = findPlaylist(playlistId);
  if (!playlist) return null;

  const idx = playlist.songs.findIndex((s) => s.id === songId);
  if (idx === -1) return null;

  return playlist.songs.splice(idx, 1)[0];
};
