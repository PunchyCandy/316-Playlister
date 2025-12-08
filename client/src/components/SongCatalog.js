// src/components/SongCatalogScreen.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Stack,
  Button,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem as MuiMenuItem,
  ListSubheader
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { fetchSongs, createSong, updateSong, deleteSong } from "../api/songApi";
import { fetchPlaylists, addSongToPlaylist } from "../api/playlistApi";

export default function SongCatalogScreen({ onBackToPlaylists, user, token }) {
  const [filters, setFilters] = useState({
    title: "",
    artist: "",
    year: ""
  });
  const [sortBy, setSortBy] = useState("listens-desc");
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuSong, setMenuSong] = useState(null);
  const [playlistMenuOpen, setPlaylistMenuOpen] = useState(false);
  const [playlistAnchor, setPlaylistAnchor] = useState(null);
  const [editSongOpen, setEditSongOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [editSongData, setEditSongData] = useState({
    title: "",
    artist: "",
    year: "",
    youtubeId: ""
  });
  const [deleteSongOpen, setDeleteSongOpen] = useState(false);
  const [newSongOpen, setNewSongOpen] = useState(false);
  const [newSong, setNewSong] = useState({
    title: "",
    artist: "",
    year: "",
    youtubeId: ""
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchSongs();
        setSongs(data || []);
        setSelectedSong((data || [])[0] || null);

        // fetch playlists for add-to-playlist menu (sort handled in render)
        const pls = await fetchPlaylists();
        setPlaylists(pls || []);
      } catch (err) {
        setError(err.message || "Failed to load songs");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleFilterChange = (field) => (e) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const clearFilters = () => {
    setFilters({
      title: "",
      artist: "",
      year: ""
    });
    setAppliedFilters(null);
  };

  // base list: if any filter text is set, search all songs; otherwise show only user's songs
  const active = appliedFilters || null;
  const hasFilter =
    !!active &&
    (active.title.trim() || active.artist.trim() || active.year.trim());
  const baseSongs =
    hasFilter || !user?.email
      ? songs
      : songs.filter((s) => s.ownerEmail === user.email);

  // basic filter by title/artist/year text
  const filtered = baseSongs.filter((song) => {
    const title = active?.title || "";
    const artist = active?.artist || "";
    const year = active?.year || "";

    const titleMatch = song.title.toLowerCase().includes(title.toLowerCase());
    const artistMatch = song.artist.toLowerCase().includes(artist.toLowerCase());
    const yearMatch = year
      ? String(song.year).toLowerCase().includes(year.toLowerCase())
      : true;
    return titleMatch && artistMatch && yearMatch;
  });

  const sorted = [...filtered].sort((a, b) => {
    const listensA = a.listens || 0;
    const listensB = b.listens || 0;
    const playlistsA = a.playlists || 0;
    const playlistsB = b.playlists || 0;
    const yearA = Number(a.year) || 0;
    const yearB = Number(b.year) || 0;

    switch (sortBy) {
      case "listens-desc":
        return listensB - listensA;
      case "listens-asc":
        return listensA - listensB;
      case "playlists-desc":
        return playlistsB - playlistsA;
      case "playlists-asc":
        return playlistsA - playlistsB;
      case "year-desc":
        return yearB - yearA;
      case "year-asc":
        return yearA - yearB;
      case "artist-asc":
        return (a.artist || "").localeCompare(b.artist || "");
      case "artist-desc":
        return (b.artist || "").localeCompare(a.artist || "");
      case "title-asc":
        return (a.title || "").localeCompare(b.title || "");
      case "title-desc":
        return (b.title || "").localeCompare(a.title || "");
      default:
        return 0;
    }
  });

  return (
    <Box
      sx={{
        mt: 2,
        px: 2,
        pb: 4,
        height: "calc(100vh - 64px)",
        display: "flex",
        gap: 3
      }}
    >
      {/* LEFT SIDE – search + video */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", mb: 2, color: "#d100d1" }}
          >
            Songs Catalog
          </Typography>

          <Stack spacing={2}>
            <TextField
              fullWidth
              label="by Title"
              value={filters.title}
              onChange={handleFilterChange("title")}
            />
            <TextField
              fullWidth
              label="by Artist"
              value={filters.artist}
              onChange={handleFilterChange("artist")}
            />
            <TextField
              fullWidth
              label="by Year"
              value={filters.year}
              onChange={handleFilterChange("year")}
            />

            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
              <Button
                variant="contained"
                fullWidth
                sx={{ textTransform: "none" }}
                onClick={() => setAppliedFilters({ ...filters })}
              >
                <SearchIcon sx={{ mr: 1 }} />
                Search
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{ textTransform: "none" }}
                onClick={clearFilters}
              >
                Clear
              </Button>
            </Box>

            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            {loading && (
              <Typography variant="body2">Loading songs...</Typography>
            )}
          </Stack>
        </Paper>

        {/* Video player / preview */}
        <Paper sx={{ p: 1, flex: 1, minHeight: 220 }}>
          {selectedSong ? (
            <Box
              sx={{
                position: "relative",
                paddingTop: "56.25%" // 16:9 ratio
              }}
            >
              <iframe
                title={selectedSong.title}
                src={
                  selectedSong.youtubeId
                    ? `https://www.youtube.com/embed/${selectedSong.youtubeId}`
                    : "about:blank"
                }
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: 0
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </Box>
          ) : (
            <Typography variant="body2">
              Select a song on the right to preview the video.
            </Typography>
          )}
        </Paper>
      </Box>

      {/* RIGHT SIDE – songs list */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 2
        }}
      >
        <Paper sx={{ p: 2, flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2
            }}
          >
            <Box>
              <Typography variant="subtitle1" component="span">
                Sort:{" "}
              </Typography>
              <TextField
                select
                size="small"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ minWidth: 170 }}
              >
                <MenuItem value="listens-desc">Listens (Hi–Lo)</MenuItem>
                <MenuItem value="listens-asc">Listens (Lo–Hi)</MenuItem>
                <MenuItem value="playlists-desc">Playlists (Hi–Lo)</MenuItem>
                <MenuItem value="playlists-asc">Playlists (Lo–Hi)</MenuItem>
                <MenuItem value="title-asc">Title (A–Z)</MenuItem>
                <MenuItem value="title-desc">Title (Z–A)</MenuItem>
                <MenuItem value="artist-asc">Artist (A–Z)</MenuItem>
                <MenuItem value="artist-desc">Artist (Z–A)</MenuItem>
                <MenuItem value="year-desc">Year (Hi–Lo)</MenuItem>
                <MenuItem value="year-asc">Year (Lo–Hi)</MenuItem>
              </TextField>
            </Box>

            <Typography variant="subtitle1">
              {sorted.length} Song{sorted.length !== 1 && "s"}
            </Typography>
          </Box>

          {/* Song cards */}
          <Stack spacing={2}>
            {sorted.map((song) => (
              <Paper
                key={song._id || song.id}
                sx={{
                  borderLeft: "4px solid #ff9800",
                  p: 1.5,
                  cursor: "pointer",
                  "&:hover": { boxShadow: 3 }
                }}
                onClick={() => setSelectedSong(song)}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "bold" }}
                    >
                      {song.title} ({song.year})
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {song.artist}
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={(e) => {
                      setMenuAnchor(e.currentTarget);
                      setMenuSong(song);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1
                  }}
                >
                  <Typography variant="caption">
                    Listens: {song.listens.toLocaleString()}
                  </Typography>
                  <Typography variant="caption">
                    Playlists: {song.playlists || 0}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Stack>

          {/* New Song button */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ textTransform: "none" }}
              onClick={() => {
                if (!user?.email) {
                  alert("Login to add songs");
                  return;
                }
                setNewSong({
                  title: "",
                  artist: "",
                  year: "",
                  youtubeId: ""
                });
                setNewSongOpen(true);
              }}
            >
              New Song
            </Button>
          </Box>
        </Paper>

        {/* Back to playlists link (optional) */}
        {onBackToPlaylists && (
          <Box sx={{ textAlign: "right" }}>
            <Button
              variant="text"
              sx={{ textTransform: "none" }}
              onClick={onBackToPlaylists}
            >
              Back to Playlists
            </Button>
          </Box>
        )}
      </Box>

      <Dialog open={newSongOpen} onClose={() => setNewSongOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Song</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={newSong.title}
              onChange={(e) => setNewSong((p) => ({ ...p, title: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Artist"
              value={newSong.artist}
              onChange={(e) => setNewSong((p) => ({ ...p, artist: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="Year"
              value={newSong.year}
              onChange={(e) => setNewSong((p) => ({ ...p, year: e.target.value }))}
              fullWidth
            />
            <TextField
              label="YouTube ID"
              value={newSong.youtubeId}
              onChange={(e) =>
                setNewSong((p) => ({ ...p, youtubeId: e.target.value }))
              }
              helperText="The ID after v= in the YouTube URL"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewSongOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!user?.email) {
                alert("Login to add songs");
                return;
              }
              try {
                const created = await createSong({
                  ownerEmail: user.email,
                  title: newSong.title,
                  artist: newSong.artist,
                  year: newSong.year,
                  youtubeId: newSong.youtubeId
                });
                setSongs((prev) => [...prev, created]);
                setSelectedSong(created);
                setNewSongOpen(false);
              } catch (err) {
                alert(err.message || "Failed to create song");
              }
            }}
          >
            Complete
          </Button>
        </DialogActions>
      </Dialog>

      {Boolean(menuAnchor) && (
        <>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => {
              setMenuAnchor(null);
              setMenuSong(null);
              setPlaylistMenuOpen(false);
              setPlaylistAnchor(null);
            }}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            MenuListProps={{ dense: true }}
          >
            <MuiMenuItem
              disabled={!user?.email}
              onClick={(e) => {
                e.stopPropagation();
                setPlaylistAnchor(menuAnchor || e.currentTarget);
                setPlaylistMenuOpen(true);
              }}
            >
              Add to Playlist
            </MuiMenuItem>
            <MuiMenuItem
              disabled={!user?.email || menuSong?.ownerEmail !== user?.email}
              onClick={() => {
                setEditingSong(menuSong);
                setEditSongData({
                  title: menuSong?.title || "",
                  artist: menuSong?.artist || "",
                  year: menuSong?.year || "",
                  youtubeId: menuSong?.youtubeId || ""
                });
                setEditSongOpen(true);
                setMenuAnchor(null);
                setPlaylistMenuOpen(false);
                setPlaylistAnchor(null);
              }}
            >
              Edit Song
            </MuiMenuItem>
            <MuiMenuItem
              disabled={!user?.email || menuSong?.ownerEmail !== user?.email}
              onClick={() => {
                setEditingSong(menuSong);
                setDeleteSongOpen(true);
                setMenuAnchor(null);
                setPlaylistMenuOpen(false);
                setPlaylistAnchor(null);
              }}
            >
              Remove from Catalog
            </MuiMenuItem>
          </Menu>

          <Menu
            anchorEl={playlistAnchor}
            open={playlistMenuOpen}
            onClose={() => {
              setPlaylistMenuOpen(false);
              setPlaylistAnchor(null);
              setMenuAnchor(null);
              setMenuSong(null);
            }}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            MenuListProps={{ dense: true, sx: { maxHeight: 260 } }}
            disableAutoFocusItem
          >
            <ListSubheader>Add to Playlist</ListSubheader>
            {playlists
              .filter((p) => p.ownerEmail === user?.email)
              .sort(
                (a, b) =>
                  new Date(b.updatedAt || b.createdAt || 0) -
                  new Date(a.updatedAt || a.createdAt || 0)
              )
              .map((pl) => (
                <MuiMenuItem
                  key={pl._id || pl.id}
                  onClick={async () => {
                    if (!menuSong) return;
                    if (!user?.email) {
                      alert("Login to add songs to a playlist");
                      return;
                    }
                    try {
                      const updatedPl = await addSongToPlaylist({
                        playlistId: pl._id || pl.id,
                        songId: menuSong._id || menuSong.id
                      });
                      // bump local playlists state so counts stay accurate
                      setPlaylists((prev) =>
                        prev.map((p) =>
                          (p._id || p.id) === (updatedPl._id || updatedPl.id)
                            ? updatedPl
                            : p
                        )
                      );
                      // bump song's playlists count locally for immediate feedback
                      setSongs((prev) =>
                        prev.map((s) =>
                          (s._id || s.id) === (menuSong._id || menuSong.id)
                            ? { ...s, playlists: (s.playlists || 0) + 1 }
                            : s
                        )
                      );
                      alert(`Added to ${pl.name}`);
                    } catch (err) {
                      alert(err.message || "Failed to add to playlist");
                    } finally {
                      setPlaylistMenuOpen(false);
                      setPlaylistAnchor(null);
                      setMenuSong(null);
                    }
                  }}
                >
                  {pl.name}
                </MuiMenuItem>
              ))}
            {playlists.filter((p) => p.ownerEmail === user?.email).length === 0 && (
              <MuiMenuItem disabled>No playlists found</MuiMenuItem>
            )}
          </Menu>
        </>
      )}

      <Dialog open={editSongOpen} onClose={() => setEditSongOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Song</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={editSongData.title}
              onChange={(e) =>
                setEditSongData((p) => ({ ...p, title: e.target.value }))
              }
              required
              fullWidth
            />
            <TextField
              label="Artist"
              value={editSongData.artist}
              onChange={(e) =>
                setEditSongData((p) => ({ ...p, artist: e.target.value }))
              }
              required
              fullWidth
            />
            <TextField
              label="Year"
              value={editSongData.year}
              onChange={(e) =>
                setEditSongData((p) => ({ ...p, year: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="YouTube ID"
              value={editSongData.youtubeId}
              onChange={(e) =>
                setEditSongData((p) => ({ ...p, youtubeId: e.target.value }))
              }
              helperText="The ID after v= in the YouTube URL"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditSongOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!editingSong?._id && !editingSong?.id) {
                setEditSongOpen(false);
                return;
              }
              try {
                const updated = await updateSong({
                  id: editingSong._id || editingSong.id,
                  title: editSongData.title,
                  artist: editSongData.artist,
                  year: editSongData.year,
                  youtubeId: editSongData.youtubeId,
                  token
                });
                setSongs((prev) =>
                  prev.map((s) =>
                    (s._id || s.id) === (updated._id || updated.id) ? updated : s
                  )
                );
                // if the updated song is selected, refresh it
                setSelectedSong((sel) =>
                  sel && (sel._id || sel.id) === (updated._id || updated.id)
                    ? updated
                    : sel
                );
                setEditSongOpen(false);
                setEditingSong(null);
              } catch (err) {
                alert(err.message || "Failed to update song");
              }
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteSongOpen}
        onClose={() => setDeleteSongOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Remove Song</DialogTitle>
        <DialogContent>
          <Typography>
            Remove "{editingSong?.title || "this song"}" from the catalog? This also removes it from all playlists.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteSongOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (!editingSong?._id && !editingSong?.id) {
                setDeleteSongOpen(false);
                return;
              }
              try {
                await deleteSong(editingSong._id || editingSong.id, token);
                setSongs((prev) =>
                  prev.filter((s) => (s._id || s.id) !== (editingSong._id || editingSong.id))
                );
                setSelectedSong((sel) =>
                  sel && (sel._id || sel.id) === (editingSong._id || editingSong.id)
                    ? null
                    : sel
                );
                // also remove from playlists state locally
                setPlaylists((prev) =>
                  prev.map((p) => ({
                    ...p,
                    songs: Array.isArray(p.songs)
                      ? p.songs.filter(
                          (song) =>
                            (song._id || song.id || song.toString?.()) !==
                            (editingSong._id || editingSong.id)
                        )
                      : p.songs
                  }))
                );
              } catch (err) {
                alert(err.message || "Failed to delete song");
              } finally {
                setDeleteSongOpen(false);
                setEditingSong(null);
              }
            }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
