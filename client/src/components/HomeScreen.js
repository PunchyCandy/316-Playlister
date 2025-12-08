// src/components/HomeScreen.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  Stack,
  MenuItem,
  IconButton
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddIcon from "@mui/icons-material/Add";

export default function HomeScreen({
  onOpenSongCatalog,
  selectedPlaylist,
  setSelectedPlaylist
}) {
  // playlists from backend
  const [playlists, setPlaylists] = useState([]);

  // search + sort state
  const [searchText, setSearchText] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [songTitleFilter, setSongTitleFilter] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");

  // ⭐ load playlists from backend ONCE when component mounts
  useEffect(() => {
    fetch("http://localhost:4000/api/playlists")
      .then((res) => res.json())
      .then((data) => {
        setPlaylists(data || []);
      })
      .catch((err) => {
        console.error("Failed to load playlists", err);
      });
  }, []);

  // helper: get song count whether backend sends songs[] or songCount
  const getSongCount = (pl) =>
    Array.isArray(pl.songs) ? pl.songs.length : pl.songCount || 0;

  // simple filter (right now only by name; you can expand later)
  const filtered = playlists.filter((p) =>
    p.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  // apply sort
  const sorted = [...filtered].sort((a, b) => {
    const countA = getSongCount(a);
    const countB = getSongCount(b);

    switch (sortBy) {
      case "name-asc":
        return (a.name || "").localeCompare(b.name || "");
      case "name-desc":
        return (b.name || "").localeCompare(a.name || "");
      case "songs-desc":
        return countB - countA;
      case "songs-asc":
        return countA - countB;
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
              value={songTitleFilter}
              onChange={(e) => setSongTitleFilter(e.target.value)}
            />

            <TextField
              fullWidth
              label="By Song Year"
              value={songTitleFilter}
              onChange={(e) => setSongTitleFilter(e.target.value)}
            />

            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
              <Button
                variant="contained"
                fullWidth
                sx={{ textTransform: "none" }}
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
                <MenuItem value="name-asc">Name (A–Z)</MenuItem>
                <MenuItem value="name-desc">Name (Z–A)</MenuItem>
                <MenuItem value="songs-desc">Songs (Hi–Lo)</MenuItem>
                <MenuItem value="songs-asc">Songs (Lo–Hi)</MenuItem>
              </TextField>

              <Typography variant="body2">
                {sorted.length} playlist{sorted.length !== 1 && "s"}
              </Typography>
            </Box>
          </Box>

          <List dense>
            {sorted.map((playlist) => (
              <ListItemButton
                key={playlist.id}
                selected={selectedPlaylist?.id === playlist.id}
                onClick={() =>
                  setSelectedPlaylist && setSelectedPlaylist(playlist)
                }
              >
                <ListItemText
                  primary={playlist.name}
                  secondary={`${getSongCount(playlist)} songs`}
                />
                <ListItemSecondaryAction>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" aria-label="edit playlist">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" aria-label="copy playlist">
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" aria-label="play playlist">
                      <PlayArrowIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" aria-label="delete playlist">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </ListItemSecondaryAction>
              </ListItemButton>
            ))}
          </List>

          {/* Create New Playlist button */}
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<AddIcon />}
              sx={{ textTransform: "none" }}
              onClick={onOpenSongCatalog}
            >
              Create New Playlist
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
