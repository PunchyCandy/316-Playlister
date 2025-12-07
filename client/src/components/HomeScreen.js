import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Grid,
  Button,
  List,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  Modal,
  Menu,
  MenuItem
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";

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
  const [sortAnchor, setSortAnchor] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openSortMenu = Boolean(sortAnchor);

  const filtered = dummyPlaylists.filter((p) =>
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSortClick = (event) => setSortAnchor(event.currentTarget);
  const handleSortClose = () => setSortAnchor(null);

  const handleDeleteConfirm = () => {
    // TODO: delete playlist via API
    setDeleteTarget(null);
  };

  return (
    <Box sx={{ px: 2, pb: 4 }}>
      {/* SearchPlaylist */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Search Playlists
        </Typography>

        <TextField
          fullWidth
          placeholder="Search by name..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </Paper>

      {/* Playlist section */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          {/* SortPlaylist + ListCard */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1
              }}
            >
              <Typography variant="h6">Playlists</Typography>
              <IconButton onClick={handleSortClick}>
                <SortIcon />
              </IconButton>

              <Menu
                anchorEl={sortAnchor}
                open={openSortMenu}
                onClose={handleSortClose}
              >
                <MenuItem onClick={handleSortClose}>Name (A–Z)</MenuItem>
                <MenuItem onClick={handleSortClose}>
                  Song Count (High → Low)
                </MenuItem>
                <MenuItem onClick={handleSortClose}>
                  Recently Updated
                </MenuItem>
              </Menu>
            </Box>

            <List dense>
              {filtered.map((playlist) => (
                <ListCard
                  key={playlist.id}
                  playlist={playlist}
                  onSelect={() => setSelectedPlaylist(playlist)}
                  onDelete={() => setDeleteTarget(playlist)}
                />
              ))}
            </List>

            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 1 }}
              onClick={onOpenSongCatalog}
            >
              Open Song Catalog
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          {/* PlayPlaylist + EditPlaylist */}
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              {selectedPlaylist
                ? selectedPlaylist.name
                : "No Playlist Selected"}
            </Typography>

            {selectedPlaylist ? (
              <>
                <PlayPlaylist
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Songs (placeholder)
                  </Typography>
                  {/* In real app, map songs here */}
                  <SongCard title="Example Song 1" artist="Artist A" />
                  <SongCard title="Example Song 2" artist="Artist B" />
                </Box>
              </>
            ) : (
              <Typography variant="body2">
                Select a playlist from the list to see details.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* DeletePlaylist modal */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 3,
            minWidth: 320
          }}
        >
          <Typography variant="h6" gutterBottom>
            Delete Playlist
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.name}</strong>?
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1
            }}
          >
            <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

function ListCard({ playlist, onSelect, onDelete }) {
  return (
    <ListItemButton onClick={onSelect}>
      <ListItemText
        primary={playlist.name}
        secondary={`${playlist.songCount} songs`}
      />
      <ListItemSecondaryAction>
        <IconButton edge="end" onClick={onDelete}>
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItemButton>
  );
}

function PlayPlaylist({ isPlaying, setIsPlaying }) {
  const toggle = () => setIsPlaying((prev) => !prev);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        borderRadius: 1,
        border: "1px solid #ddd",
        p: 1
      }}
    >
      <IconButton>
        <SkipPreviousIcon />
      </IconButton>
      <IconButton onClick={toggle}>
        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>
      <IconButton>
        <SkipNextIcon />
      </IconButton>
      <IconButton sx={{ marginLeft: "auto" }}>
        <MoreVertIcon />
      </IconButton>
    </Box>
  );
}

function SongCard({ title, artist }) {
  return (
    <Paper sx={{ p: 1, mb: 1 }}>
      <Typography variant="subtitle2">{title}</Typography>
      <Typography variant="caption" color="text.secondary">
        {artist}
      </Typography>
    </Paper>
  );
}
