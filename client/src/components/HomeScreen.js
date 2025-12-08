// src/components/HomeScreen.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  Stack,
  MenuItem,
  IconButton,
  Collapse,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Avatar } from "@mui/material";
import { fetchPlaylists, createPlaylist, updatePlaylist, deletePlaylist } from "../api/playlistApi";
import EditPlaylistModal from "./EditPlaylistModal";
import PlayPlaylistModal from "./PlayPlaylistModal";

export default function HomeScreen({
  user,
  onOpenSongCatalog,
  selectedPlaylist,
  setSelectedPlaylist
}) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // search + sort state
  const [searchText, setSearchText] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [songTitleFilter, setSongTitleFilter] = useState("");
  const [songArtistFilter, setSongArtistFilter] = useState("");
  const [songYearFilter, setSongYearFilter] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");

  // ⭐ load playlists from backend once on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchPlaylists();
        setPlaylists(data || []);
      } catch (err) {
        console.error("Failed to load playlists", err);
        setError(err.message || "Failed to load playlists");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // helpers: counts and owner
  const getSongCount = (pl) =>
    Array.isArray(pl.songs) ? pl.songs.length : pl.songCount || 0;
  const getListenerCount = (pl) =>
    Array.isArray(pl.listeners) ? pl.listeners.length : 0;
  const getOwnerName = (pl) =>
    (pl.ownerUsername || pl.ownerEmail || "").toLowerCase();

  const active = appliedFilters || null;
  const hasAnyFilter =
    !!active &&
    (active.searchText?.trim() ||
      active.userFilter?.trim() ||
      active.songTitleFilter?.trim() ||
      active.songArtistFilter?.trim() ||
      active.songYearFilter?.trim());

  // base list: if any applied filter is present, search across all playlists; otherwise show only user's
  const baseList = hasAnyFilter
    ? playlists
    : user?.email
      ? playlists.filter((p) => p.ownerEmail === user.email)
      : [];

  // apply filters
  const filtered = baseList.filter((p) => {
    const searchTextVal = active?.searchText?.toLowerCase() || "";
    const userFilterVal = active?.userFilter?.toLowerCase() || "";
    const songTitleVal = active?.songTitleFilter?.toLowerCase() || "";
    const songArtistVal = active?.songArtistFilter?.toLowerCase() || "";
    const songYearVal = active?.songYearFilter?.toLowerCase() || "";

    const nameMatch = p.name?.toLowerCase().includes(searchTextVal);

    const ownerText = `${p.ownerUsername || ""} ${p.ownerEmail || ""}`.toLowerCase();
    const ownerMatch = ownerText.includes(userFilterVal);

    const songs = Array.isArray(p.songs) ? p.songs : [];
    const songTitleMatch = songTitleVal
      ? songs.some((s) =>
          (s?.title || "").toLowerCase().includes(songTitleVal)
        )
      : true;
    const songArtistMatch = songArtistVal
      ? songs.some((s) =>
          (s?.artist || "").toLowerCase().includes(songArtistVal)
        )
      : true;
    const songYearMatch = songYearVal
      ? songs.some((s) =>
          (String(s?.year || "")).toLowerCase().includes(songYearVal)
        )
      : true;

    return (
      nameMatch &&
      ownerMatch &&
      songTitleMatch &&
      songArtistMatch &&
      songYearMatch
    );
  });

  // apply sort
  const sorted = [...filtered].sort((a, b) => {
    const countA = getSongCount(a);
    const countB = getSongCount(b);
    const listenersA = getListenerCount(a);
    const listenersB = getListenerCount(b);
    const ownerA = getOwnerName(a);
    const ownerB = getOwnerName(b);

    switch (sortBy) {
      case "name-asc":
        return (a.name || "").localeCompare(b.name || "");
      case "name-desc":
        return (b.name || "").localeCompare(a.name || "");
      case "owner-asc":
        return ownerA.localeCompare(ownerB);
      case "owner-desc":
        return ownerB.localeCompare(ownerA);
      case "listeners-desc":
        return listenersB - listenersA;
      case "listeners-asc":
        return listenersA - listenersB;
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
      {/* LEFT HALF – search options */}
      <Box sx={{ flex: 1, display: "flex" }}>
        <Paper sx={{ p: 2, width: "100%" }}>
          <Typography variant="h6" gutterBottom>
            Search Playlists
          </Typography>

          <Stack spacing={2}>
            <TextField
              fullWidth
              label="By Playlist Name"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            <TextField
              fullWidth
              label="By User Name"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            />

            <TextField
              fullWidth
              label="By Song Title"
              value={songTitleFilter}
              onChange={(e) => setSongTitleFilter(e.target.value)}
            />

            <TextField
              fullWidth
              label="By Song Artist"
              value={songArtistFilter}
              onChange={(e) => setSongArtistFilter(e.target.value)}
            />

            <TextField
              fullWidth
              label="By Song Year"
              value={songYearFilter}
              onChange={(e) => setSongYearFilter(e.target.value)}
            />

            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
              <Button
                variant="contained"
                fullWidth
                sx={{ textTransform: "none" }}
                onClick={() =>
                  setAppliedFilters({
                    searchText,
                    userFilter,
                    songTitleFilter,
                    songArtistFilter,
                    songYearFilter
                  })
                }
              >
                <SearchIcon sx={{ mr: 1 }} />
                Search
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{ textTransform: "none" }}
                onClick={() => {
                  setSearchText("");
                  setUserFilter("");
                  setSongTitleFilter("");
                  setSongArtistFilter("");
                  setSongYearFilter("");
                  setAppliedFilters(null);
                }}
              >
                Clear
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Box>

      {/* RIGHT HALF – playlists list */}
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
              mb: 1,
              alignItems: "center"
            }}
          >
            <Typography variant="h6">Playlists</Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* Sort dropdown */}
              <TextField
                select
                size="small"
                label="Sort by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="name-asc">Playlist Name (A–Z)</MenuItem>
                <MenuItem value="name-desc">Playlist Name (Z–A)</MenuItem>
                <MenuItem value="owner-asc">User Name (A–Z)</MenuItem>
                <MenuItem value="owner-desc">User Name (Z–A)</MenuItem>
                <MenuItem value="listeners-desc">Listeners (Hi–Lo)</MenuItem>
                <MenuItem value="listeners-asc">Listeners (Lo–Hi)</MenuItem>
              </TextField>

              <Typography variant="body2">
                {sorted.length} playlist{sorted.length !== 1 && "s"}
              </Typography>
            </Box>
          </Box>

          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}
          {!user && !loading && !error && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              Login to see your playlists.
            </Typography>
          )}
          {loading && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              Loading playlists...
            </Typography>
          )}

          <Stack spacing={1.5}>
            {sorted.map((playlist) => {
              const id = playlist._id || playlist.id;
              const isSelected =
                selectedPlaylist?._id === playlist._id ||
                selectedPlaylist?.id === playlist.id;
              const isOwner = user?.email && playlist.ownerEmail === user.email;
              const owner =
                playlist.ownerUsername ||
                (playlist.ownerEmail || "").split("@")[0] ||
                "Unknown";
              const listeners = Array.isArray(playlist.listeners)
                ? playlist.listeners.length
                : 0;
              const ownerAvatar =
                playlist.ownerAvatar ||
                (user?.email === playlist.ownerEmail ? user.avatar : "");
              const initials = owner
                ? owner[0].toUpperCase()
                : playlist.name
                  ? playlist.name[0].toUpperCase()
                  : "🎵";

              const songs = Array.isArray(playlist.songs) ? playlist.songs : [];

              return (
                <Paper
                  key={id}
                  elevation={isSelected ? 4 : 1}
                  sx={{
                    borderRadius: 3,
                    p: 1.5,
                    bgcolor: "#fffef5",
                    border: isSelected ? "2px solid #1976d2" : "1px solid #eee",
                    transition: "all 0.2s ease"
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar
                      sx={{
                        width: 52,
                        height: 52,
                        bgcolor: "#ffcc33",
                        color: "#000",
                        fontWeight: 700
                      }}
                      src={ownerAvatar || undefined}
                    >
                      {initials}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>
                        {playlist.name || "Untitled"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {owner}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        sx={{ bgcolor: isOwner ? "#e53935" : "#f0a9a9" }}
                        startIcon={<DeleteIcon fontSize="small" />}
                        disabled={!isOwner}
                        onClick={() => isOwner && setDeleteTarget(playlist)}
                      >
                        Delete
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        sx={{ bgcolor: isOwner ? "#1e88e5" : "#a9c7eb" }}
                        startIcon={<EditIcon fontSize="small" />}
                        disabled={!isOwner}
                        onClick={() => isOwner && setEditing(playlist)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        sx={{ bgcolor: "#2e7d32" }}
                        startIcon={<ContentCopyIcon fontSize="small" />}
                        disabled={!user?.email}
                        onClick={async () => {
                          if (!user?.email) {
                            alert("Login to copy playlists");
                            return;
                          }
                          // Generate a unique copy name for this user
                          const userLists = playlists.filter(
                            (p) => p.ownerEmail === user.email
                          );
                          let n = 0;
                          const names = new Set(userLists.map((p) => p.name));
                          let newName;
                          do {
                            newName = `${playlist.name || "Untitled"} Copy ${n}`;
                            n += 1;
                          } while (names.has(newName));

                          try {
                            const created = await createPlaylist({
                              name: newName,
                              ownerEmail: user.email,
                        songs: songs.map((s) => s._id || s.id || s),
                        listeners: []
                      });
                      const withOwner = {
                        ...created,
                        ownerUsername: user.username || user.userName || user.email,
                        ownerAvatar: user.avatar,
                        ownerEmail: user.email
                      };
                      setPlaylists((prev) => [...prev, withOwner]);
                      setEditing(withOwner);
                    } catch (err) {
                      alert(err.message || "Failed to copy playlist");
                    }
                  }}
                >
                        Copy
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        sx={{ bgcolor: "#d81b60" }}
                        startIcon={<PlayArrowIcon fontSize="small" />}
                        onClick={() => setPlaying(playlist)}
                      >
                        Play
                      </Button>
                    </Stack>

                    <IconButton
                      size="small"
                      onClick={() =>
                        setExpandedId(expandedId === id ? null : id)
                      }
                    >
                      <ExpandMoreIcon
                        sx={{
                          transform:
                            expandedId === id ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease"
                        }}
                      />
                    </IconButton>
                  </Stack>

                  <Typography
                    variant="body2"
                    sx={{ mt: 1, color: "#1976d2", ml: 0.5 }}
                  >
                    {listeners} Listener{listeners === 1 ? "" : "s"}
                  </Typography>

                  <Collapse in={expandedId === id} timeout="auto" unmountOnExit>
                    <Divider sx={{ my: 1 }} />
                    {songs.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
                        No songs in this playlist.
                      </Typography>
                    ) : (
                      <Stack spacing={1}>
                        {songs.map((song, idx) => (
                          <Box
                            key={song._id || `${id}-song-${idx}`}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              px: 1
                            }}
                          >
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={600} noWrap>
                                {song.title || "Untitled"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                noWrap
                              >
                                {song.artist || "Unknown"}{" "}
                                {song.year ? `• ${song.year}` : ""}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              #{idx + 1}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Collapse>
                </Paper>
              );
            })}

            {!loading && !error && sorted.length === 0 && (
              <Typography variant="body2" sx={{ p: 2 }}>
                No playlists yet.
              </Typography>
            )}
          </Stack>

          {/* Create New Playlist button */}
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<AddIcon />}
              sx={{ textTransform: "none" }}
              onClick={async () => {
                if (!user?.email) {
                  alert("Login to create playlists");
                  return;
                }

                // find next unique "Untitled N" for this user
                const userLists = playlists.filter(
                  (p) => p.ownerEmail === user.email
                );
                let n = 0;
                const names = new Set(userLists.map((p) => p.name));
                while (names.has(`Untitled ${n}`)) n += 1;
                const newName = `Untitled ${n}`;

                try {
                  const created = await createPlaylist({
                    name: newName,
                    ownerEmail: user.email,
                    songs: [],
                    listeners: []
                  });
                  const withOwner = {
                    ...created,
                    ownerUsername: user.username || user.userName || user.email,
                    ownerAvatar: user.avatar,
                    ownerEmail: user.email
                  };
                  setPlaylists((prev) => [...prev, withOwner]);
                  setEditing(withOwner);
                } catch (err) {
                  alert(err.message || "Failed to create playlist");
                }
              }}
            >
              Create New Playlist
            </Button>
          </Box>
        </Paper>
      </Box>

      <EditPlaylistModal
        open={Boolean(editing)}
        playlist={editing}
        onClose={() => setEditing(null)}
        onSave={async (updated) => {
          try {
            const updatedPayload = await updatePlaylist({
              id: updated._id || updated.id,
              name: updated.name,
              songs: Array.isArray(updated.songs)
                ? updated.songs
                    .map((s) => (s && (s._id || s.id)))
                    .filter(Boolean)
                : [],
              listeners: updated.listeners || []
            });

            const merged = { ...updatedPayload, songs: updated.songs || [] };

            setPlaylists((prev) =>
              prev.map((p) =>
                (p._id || p.id) === (merged._id || merged.id) ? merged : p
              )
            );
          } catch (err) {
            alert(err.message || "Failed to save playlist");
            return;
          }
          setEditing(null);
        }}
        onAddSongFromCatalog={() => {
          setEditing(null);
          onOpenSongCatalog && onOpenSongCatalog();
        }}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      >
        <DialogTitle>Delete Playlist</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteTarget?.name || "this playlist"}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (!deleteTarget) return;
              try {
                await deletePlaylist(deleteTarget._id || deleteTarget.id);
                setPlaylists((prev) =>
                  prev.filter(
                    (p) => (p._id || p.id) !== (deleteTarget._id || deleteTarget.id)
                  )
                );
              } catch (err) {
                alert(err.message || "Failed to delete playlist");
              } finally {
                setDeleteTarget(null);
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <PlayPlaylistModal
        open={Boolean(playing)}
        playlist={playing}
        onClose={() => setPlaying(null)}
      />
    </Box>
  );
}
