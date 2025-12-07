import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Grid,
  Menu,
  MenuItem,
  Button,
  List,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const dummySongs = [
  { id: 1, title: "Song A", artist: "Artist 1" },
  { id: 2, title: "Song B", artist: "Artist 2" },
  { id: 3, title: "Song C", artist: "Artist 3" }
];

export default function SongCatalog({ onBack, playlist }) {
  const [searchText, setSearchText] = useState("");
  const [sortAnchor, setSortAnchor] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);

  const filtered = dummySongs.filter((s) =>
    s.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const openSortMenu = Boolean(sortAnchor);

  return (
    <Box sx={{ px: 2, pb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">
          Song Catalog{" "}
          {playlist ? `– Add to "${playlist.name}"` : ""}
        </Typography>
        <Button onClick={onBack}>Back to Playlists</Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          {/* SearchSong + SortSongs */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Search Songs
            </Typography>

            <TextField
              fullWidth
              placeholder="Search by title or artist..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={(e2) => setSortAnchor(e2.currentTarget)}>
                      <SortIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Menu
              anchorEl={sortAnchor}
              open={openSortMenu}
              onClose={() => setSortAnchor(null)}
            >
              <MenuItem onClick={() => setSortAnchor(null)}>
                Title (A–Z)
              </MenuItem>
              <MenuItem onClick={() => setSortAnchor(null)}>
                Artist (A–Z)
              </MenuItem>
            </Menu>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Results
            </Typography>

            <List dense>
              {filtered.map((song) => (
                <ListItemButton
                  key={song.id}
                  onClick={() => setSelectedSong(song)}
                  selected={selectedSong?.id === song.id}
                >
                  <ListItemText
                    primary={song.title}
                    secondary={song.artist}
                  />
                  {playlist && (
                    <ListItemSecondaryAction>
                      <IconButton edge="end">
                        <AddIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          {/* SongPage: EditSong + RemoveSong area */}
          <Paper sx={{ p: 2, minHeight: 300 }}>
            <Typography variant="h6" gutterBottom>
              Song Details
            </Typography>

            {selectedSong ? (
              <SongDetail song={selectedSong} />
            ) : (
              <Typography variant="body2">
                Select a song from the catalog to view or edit details.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function SongDetail({ song }) {
  const [values, setValues] = useState({
    title: song.title,
    artist: song.artist
  });

  const handleChange = (e) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = () => {
    // TODO: implement edit song API
    console.log("Save song", values);
  };

  const handleRemove = () => {
    // TODO: implement remove song API
    console.log("Remove song", song.id);
  };

  return (
    <>
      <TextField
        fullWidth
        margin="normal"
        name="title"
        label="Title"
        value={values.title}
        onChange={handleChange}
      />
      <TextField
        fullWidth
        margin="normal"
        name="artist"
        label="Artist"
        value={values.artist}
        onChange={handleChange}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleSave}
        >
          Save Changes
        </Button>
        <Button
          color="error"
          variant="outlined"
          startIcon={<DeleteIcon />}
          onClick={handleRemove}
        >
          Remove Song
        </Button>
      </Box>
    </>
  );
}
