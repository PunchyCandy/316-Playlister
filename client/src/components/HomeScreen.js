// src/components/HomeScreen.js
import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  Stack,
  MenuItem
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddIcon from "@mui/icons-material/Add";

const dummyPlaylists = [
  { id: 1, name: "Chill Vibes", songCount: 15 },
  { id: 2, name: "Workout", songCount: 22 },
  { id: 3, name: "Study Focus", songCount: 10 }
];

export default function HomeScreen({
  onOpenSongCatalog,
  selectedPlaylist,
  setSelectedPlaylist
}) {
  const [searchText, setSearchText] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [songTitleFilter, setSongTitleFilter] = useState("");
  const [sortBy, setSortBy] = useState("name-asc"); // NEW

  const filtered = dummyPlaylists.filter((p) =>
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // apply sorting
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "songs-desc":
        return b.songCount - a.songCount;
      case "songs-asc":
        return a.songCount - b.songCount;
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
              value={searchText}                     // fixed
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

      {/* RIGHT HALF – playlists + details */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 2
        }}
      >
        {/* Playlists list */}
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
              {/* SORT BY DROPDOWN */}
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
                  secondary={`${playlist.songCount} songs`}
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

          {/* Create New Playlist button at bottom */}
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
