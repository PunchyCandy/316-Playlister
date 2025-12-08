import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Stack,
  Typography,
  Button,
  Paper,
  Checkbox,
  FormControlLabel
} from "@mui/material";

export default function PlayPlaylistModal({ open, playlist, onClose }) {
  const songs = useMemo(
    () => (Array.isArray(playlist?.songs) ? playlist.songs : []),
    [playlist]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeat, setRepeat] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
  }, [playlist]);

  // naive auto-advance timer (doesn't sync with YouTube playback, but preserves flow)
  useEffect(() => {
    if (!isPlaying || songs.length === 0) return;
    const timer = setTimeout(() => {
      handleNext();
    }, 30000); // advance every 30s as a simple stand-in
    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, repeat, songs.length]);

  const handleNext = () => {
    if (songs.length === 0) return;
    if (currentIndex < songs.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else if (repeat) {
      setCurrentIndex(0);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (songs.length === 0) return;
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    } else if (repeat) {
      setCurrentIndex(songs.length - 1);
    }
  };

  const currentSong = songs[currentIndex] || {};
  const youTubeId = currentSong.youtubeId || currentSong.youTubeId || "";
  const embedUrl = youTubeId
    ? `https://www.youtube.com/embed/${youTubeId}?autoplay=${isPlaying ? 1 : 0}`
    : "";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: "#1b5e20", color: "#fff", fontWeight: 800 }}>
        Play Playlist
      </DialogTitle>
      <DialogContent sx={{ bgcolor: "#b6f1bf" }}>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          {/* Left: song list */}
          <Paper
            variant="outlined"
            sx={{ flex: 1, minHeight: 360, p: 1, bgcolor: "#faf0ff" }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              {playlist?.name || "Untitled Playlist"}
            </Typography>
            <Stack spacing={1}>
              {songs.map((song, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <Paper
                    key={song._id || song.id || idx}
                    sx={{
                      p: 1,
                      bgcolor: isActive ? "#fdf0a8" : "#fffef5",
                      border: isActive ? "2px solid #ba68c8" : "1px solid #ddd",
                      cursor: "pointer"
                    }}
                    onClick={() => setCurrentIndex(idx)}
                  >
                    <Typography fontWeight={700}>
                      {idx + 1}. {song.title || "Untitled"}{" "}
                      {song.artist ? `by ${song.artist}` : ""}{" "}
                      {song.year ? `(${song.year})` : ""}
                    </Typography>
                  </Paper>
                );
              })}
              {songs.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No songs in this playlist.
                </Typography>
              )}
            </Stack>
          </Paper>

          {/* Right: player and controls */}
          <Stack sx={{ flex: 1 }} spacing={2}>
            <Box
              sx={{
                height: 220,
                bgcolor: "#fff",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: 1
              }}
            >
              {embedUrl ? (
                <iframe
                  title="YouTube player"
                  width="100%"
                  height="100%"
                  src={embedUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ display: "block" }}
                />
              ) : (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "text.secondary"
                  }}
                >
                  No video available
                </Box>
              )}
            </Box>

            <Stack direction="row" spacing={1} justifyContent="center">
              <Button
                variant="contained"
                onClick={() => setIsPlaying((p) => !p)}
                sx={{ minWidth: 100 }}
              >
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <Button variant="outlined" onClick={handlePrev}>
                Prev
              </Button>
              <Button variant="outlined" onClick={handleNext}>
                Next
              </Button>
            </Stack>

            <FormControlLabel
              control={
                <Checkbox
                  checked={repeat}
                  onChange={(e) => setRepeat(e.target.checked)}
                  color="success"
                />
              }
              label="Repeat playlist"
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ bgcolor: "#b6f1bf" }}>
        <Button onClick={onClose} variant="contained" color="success">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
