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
  FormControlLabel,
  Avatar,
  Chip
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
      <DialogTitle
        sx={{
          bgcolor: "#ffffff",
          color: "#0f172a",
          fontWeight: 800,
          letterSpacing: 0.5,
          borderBottom: "1px solid #e5e7eb"
        }}
      >
        Play Playlist
      </DialogTitle>
      <DialogContent
        sx={{
          bgcolor: "#f7f7f9",
          borderTop: "1px solid #e0e7ef"
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
          {/* Left: song list */}
          <Paper
            variant="outlined"
            sx={{
              flex: 1,
              minHeight: 380,
              p: 2,
              bgcolor: "#ffffff",
              borderRadius: 3,
              borderColor: "#e5e7eb",
              color: "#1f2933",
              boxShadow: "0 6px 20px rgba(15, 118, 110, 0.08)"
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Avatar
                src={playlist?.ownerAvatar || undefined}
                sx={{ width: 42, height: 42, bgcolor: "#e0f2f1", color: "#0f766e" }}
              >
                {(playlist?.ownerUsername || playlist?.ownerEmail || "?")[0]?.toUpperCase?.() || "?"}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ lineHeight: 1.1, fontWeight: 800, color: "#0f172a" }}>
                  {playlist?.name || "Untitled Playlist"}
                </Typography>
                <Typography
                  variant="body2"
                  color="#52606d"
                  sx={{ lineHeight: 1.1 }}
                >
                  {playlist?.ownerUsername || playlist?.ownerEmail || "Unknown owner"}
                </Typography>
              </Box>
            </Stack>
            <Stack spacing={1}>
              {songs.map((song, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <Paper
                    key={song._id || song.id || idx}
                    sx={{
                      p: 1.25,
                      bgcolor: isActive ? "#e0f2f1" : "#f9fafb",
                      border: isActive ? "2px solid #0f766e" : "1px solid #e5e7eb",
                      cursor: "pointer",
                      borderRadius: 2,
                      boxShadow: isActive ? "0 8px 20px rgba(15,118,110,0.18)" : "none",
                      color: "#1f2933"
                    }}
                    onClick={() => setCurrentIndex(idx)}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        label={idx + 1}
                        sx={{
                          fontWeight: 700,
                          bgcolor: isActive ? "#0f766e" : "#e5e7eb",
                          color: isActive ? "#fdfbf7" : "#1f2933"
                        }}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={700} noWrap color="#0f172a">
                          {song.title || "Untitled"}
                        </Typography>
                        <Typography variant="body2" color="#52606d" noWrap>
                          {song.artist || "Unknown"} {song.year ? `• ${song.year}` : ""}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
              {songs.length === 0 && (
                <Typography variant="body2" color="#52606d">
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
                bgcolor: "#f9fafb",
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0 12px 28px rgba(0,0,0,0.16)",
                border: "1px solid #e5e7eb"
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

            <Stack direction="row" spacing={1.5} justifyContent="center">
              <Button
                variant="contained"
                onClick={() => setIsPlaying((p) => !p)}
                sx={{
                  minWidth: 120,
                  bgcolor: isPlaying ? "#f97316" : "#0f766e",
                  color: "#fff",
                  "&:hover": { bgcolor: isPlaying ? "#ea580c" : "#0d5f59" }
                }}
              >
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <Button
                variant="outlined"
                onClick={handlePrev}
                sx={{ color: "#1f2933", borderColor: "#d1d5db", "&:hover": { borderColor: "#0f766e", color: "#0f766e" } }}
              >
                Prev
              </Button>
              <Button
                variant="outlined"
                onClick={handleNext}
                sx={{ color: "#1f2933", borderColor: "#d1d5db", "&:hover": { borderColor: "#0f766e", color: "#0f766e" } }}
              >
                Next
              </Button>
            </Stack>

            <FormControlLabel
              control={
                <Checkbox
                  checked={repeat}
                  onChange={(e) => setRepeat(e.target.checked)}
                  sx={{
                    color: "#94a3b8",
                    "&.Mui-checked": { color: "#f59e0b" }
                  }}
                />
              }
              label="Repeat playlist"
              sx={{ ml: 1 }}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ bgcolor: "#f7f7f9", borderTop: "1px solid #e0e7ef" }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            minWidth: 110,
            borderRadius: 999,
            bgcolor: "#0f766e",
            color: "#fff",
            "&:hover": { bgcolor: "#0d5f59" }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
