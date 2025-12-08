// src/components/SongCatalogScreen.js
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Stack,
  Button,
  MenuItem,
  IconButton
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const dummySongs = [
  {
    id: 1,
    title: "Fast Train",
    artist: "Solomon Burke",
    year: 1985,
    listens: 1234567,
    playlists: 123,
    videoUrl: "https://www.youtube.com/embed/b7ZBz6m5i9w"
  },
  {
    id: 2,
    title: "I Wish I Knew",
    artist: "Solomon Burke",
    year: 1968,
    listens: 4567,
    playlists: 3,
    videoUrl: "https://www.youtube.com/embed/b7ZBz6m5i9w"
  }
];

export default function SongCatalogScreen({ onBackToPlaylists }) {
  const [filters, setFilters] = useState({
    title: "",
    artist: "",
    year: ""
  });
  const [sortBy, setSortBy] = useState("listens-desc");
  const [selectedSong, setSelectedSong] = useState(dummySongs[0] || null);

  const handleFilterChange = (field) => (e) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const clearFilters = () =>
    setFilters({
      title: "",
      artist: "",
      year: ""
    });

  // basic filter by title/artist/year text
  const filtered = dummySongs.filter((song) => {
    const titleMatch = song.title
      .toLowerCase()
      .includes(filters.title.toLowerCase());
    const artistMatch = song.artist
      .toLowerCase()
      .includes(filters.artist.toLowerCase());
    const yearMatch = filters.year
      ? String(song.year).includes(filters.year)
      : true;
    return titleMatch && artistMatch && yearMatch;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "listens-desc":
        return b.listens - a.listens;
      case "listens-asc":
        return a.listens - b.listens;
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
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
                src={selectedSong.videoUrl}
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
                <MenuItem value="title-asc">Title (A–Z)</MenuItem>
                <MenuItem value="title-desc">Title (Z–A)</MenuItem>
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
                key={song.id}
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
                  <IconButton>
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
                    Playlists: {song.playlists}
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
              // later: onClick={onNewSong}
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
    </Box>
  );
}
