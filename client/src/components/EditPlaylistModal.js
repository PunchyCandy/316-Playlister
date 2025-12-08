import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Stack,
  TextField,
  Typography,
  IconButton,
  Button,
  Paper
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export default function EditPlaylistModal({ open, playlist, onClose, onSave }) {
  const [name, setName] = useState("");
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    if (playlist) {
      setName(playlist.name || "");
      setSongs(Array.isArray(playlist.songs) ? playlist.songs : []);
    }
  }, [playlist]);

  const handleRemove = (idx) => {
    setSongs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDuplicate = (idx) => {
    setSongs((prev) => {
      const copy = [...prev];
      copy.splice(idx + 1, 0, { ...prev[idx] });
      return copy;
    });
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave({
        ...playlist,
        name,
        songs
      });
    }
  };

  const handleAddSong = () => {
    setSongs((prev) => [
      ...prev,
      { title: "New Song", artist: "Unknown", year: "" }
    ]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{ bgcolor: "#2e7d32", color: "#fff", fontWeight: 700, pb: 1 }}
      >
        Edit Playlist
      </DialogTitle>
      <DialogContent
        sx={{
          bgcolor: "#cff9d5",
          pt: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            fullWidth
            label="Playlist Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            InputProps={{
              sx: { bgcolor: "#e8e8e8", fontSize: 20, fontWeight: 600 }
            }}
          />
          <IconButton
            color="primary"
            sx={{
              bgcolor: "#7c4dff",
              color: "#fff",
              "&:hover": { bgcolor: "#5e35b1" }
            }}
            onClick={handleAddSong}
          >
            <AddIcon />
          </IconButton>
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            minHeight: 260,
            maxHeight: 360,
            overflow: "auto",
            p: 1,
            bgcolor: "#fffef5"
          }}
        >
          <Stack spacing={1.2}>
            {songs.map((song, idx) => (
              <Paper
                key={`${song._id || idx}-${idx}`}
                sx={{
                  p: 1,
                  bgcolor: "#fdf0a8",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <Typography
                  sx={{ fontWeight: 700, minWidth: 28 }}
                >{`${idx + 1}.`}</Typography>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontWeight={700} noWrap>
                    {song.title || "Untitled"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {song.artist || "Unknown"}
                    {song.year ? ` (${song.year})` : ""}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={() => handleDuplicate(idx)}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleRemove(idx)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Paper>
            ))}
            {songs.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ px: 1, py: 2 }}
              >
                No songs yet. Click + to add one.
              </Typography>
            )}
          </Stack>
        </Paper>
      </DialogContent>
      <DialogActions sx={{ bgcolor: "#cff9d5", pb: 2, pr: 3 }}>
        <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
          <Button variant="outlined" color="inherit" onClick={onClose} fullWidth>
            Close
          </Button>
          <Button variant="contained" color="success" onClick={handleSave} fullWidth>
            Save
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
