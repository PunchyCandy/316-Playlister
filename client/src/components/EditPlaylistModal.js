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
  Paper,
  Divider
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import { removeSongFromPlaylist } from "../api/playlistApi";

export default function EditPlaylistModal({
  open,
  playlist,
  onClose,
  onSave,
  onAddSongFromCatalog
}) {
  const [name, setName] = useState("");
  const [songs, setSongs] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);

  useEffect(() => {
    if (playlist) {
      setName(playlist.name || "");
      setSongs(Array.isArray(playlist.songs) ? playlist.songs : []);
      setUndoStack([]);
      setRedoStack([]);
    }
  }, [playlist]);

  const pushHistory = (prevSongs) => {
    setUndoStack((stack) => [...stack, prevSongs]);
    setRedoStack([]);
  };

  const handleRemove = async (idx) => {
    const songToRemove = songs[idx];
    pushHistory(songs);
    setSongs((prev) => prev.filter((_, i) => i !== idx));

    // sync removal to backend for counts if playlist/song exist
    if (playlist?._id && (songToRemove?._id || songToRemove?.id)) {
      try {
        await removeSongFromPlaylist({
          playlistId: playlist._id || playlist.id,
          songId: songToRemove._id || songToRemove.id
        });
      } catch (err) {
        console.error("Failed to remove song from playlist", err);
      }
    }
  };

  const handleDuplicate = (idx) => {
    pushHistory(songs);
    setSongs((prev) => {
      const copy = [...prev];
      copy.splice(idx + 1, 0, { ...prev[idx] });
      return copy;
    });
  };

  const handleUndo = () => {
    setUndoStack((stack) => {
      if (stack.length === 0) return stack;
      const prev = stack[stack.length - 1];
      setRedoStack((r) => [...r, songs]);
      setSongs(prev);
      return stack.slice(0, -1);
    });
  };

  const handleRedo = () => {
    setRedoStack((stack) => {
      if (stack.length === 0) return stack;
      const next = stack[stack.length - 1];
      setUndoStack((u) => [...u, songs]);
      setSongs(next);
      return stack.slice(0, -1);
    });
  };

  const handleDrop = (targetIdx) => {
    if (dragIndex === null || dragIndex === targetIdx) return;
    pushHistory(songs);
    setSongs((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
    setDragIndex(null);
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
    if (onAddSongFromCatalog) {
      onAddSongFromCatalog();
      return;
    }
    pushHistory(songs);
    setSongs((prev) => [
      ...prev,
      { title: "New Song", artist: "Unknown", year: "" }
    ]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: "#ffffff",
          color: "#0f172a",
          fontWeight: 800,
          letterSpacing: 0.5,
          borderBottom: "1px solid #e5e7eb"
        }}
      >
        Edit Playlist
      </DialogTitle>
      <DialogContent
        sx={{
          bgcolor: "#f7f7f9",
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
              sx: { bgcolor: "#ffffff", fontSize: 20, fontWeight: 700 }
            }}
          />
          <IconButton
            color="primary"
            sx={{
              bgcolor: "#0f766e",
              color: "#fff",
              "&:hover": { bgcolor: "#0d5f59" },
              boxShadow: "0 6px 18px rgba(15,118,110,0.25)"
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
            p: 1.5,
            bgcolor: "#ffffff",
            borderColor: "#e5e7eb",
            borderRadius: 3,
            boxShadow: "0 6px 20px rgba(15, 118, 110, 0.08)"
          }}
        >
          <Stack spacing={1.2}>
            {songs.map((song, idx) => (
              <Paper
                key={`${song._id || idx}-${idx}`}
                sx={{
                  p: 1.25,
                  bgcolor: "#f9fafb",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  cursor: "grab",
                  border: "1px solid #e5e7eb",
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(15,118,110,0.08)"
                }}
                draggable
                onDragStart={() => setDragIndex(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(idx)}
              >
                <Typography
                  sx={{ fontWeight: 800, minWidth: 28, color: "#0f172a" }}
                >{`${idx + 1}.`}</Typography>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontWeight={700} noWrap color="#0f172a">
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
      <DialogActions
        sx={{ bgcolor: "#f7f7f9", pb: 2, pr: 3, borderTop: "1px solid #e0e7ef" }}
      >
        <Stack direction="row" spacing={2} sx={{ width: "100%", alignItems: "center" }}>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<UndoIcon />}
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              sx={{ borderColor: "#d1d5db", color: "#1f2933" }}
            >
              Undo
            </Button>
            <Button
              variant="outlined"
              startIcon={<RedoIcon />}
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              sx={{ borderColor: "#d1d5db", color: "#1f2933" }}
            >
              Redo
            </Button>
          </Stack>
          <Divider flexItem sx={{ mx: 1, borderColor: "#e5e7eb" }} />
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" color="inherit" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              sx={{ bgcolor: "#0f766e", "&:hover": { bgcolor: "#0d5f59" } }}
            >
              Save
            </Button>
          </Stack>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
