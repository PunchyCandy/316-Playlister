import React from "react";
import { Box, Typography, Button, Paper, Stack } from "@mui/material";

export default function WelcomeScreen({
  onContinueAsGuest,
  onLogin,
  onCreateAccount
}) {
  const buttonSx = {
    backgroundColor: "#333",
    color: "white",
    px: 3,
    py: 1,
    borderRadius: "999px",
    textTransform: "none",
    "&:hover": {
      backgroundColor: "#000"
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        mt: 6,
        px: 2
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 600,
          p: 4,
          textAlign: "center"
        }}
      >
        <Typography variant="h4" gutterBottom>
          Welcome to Playlister
        </Typography>

        <Box
          component="img"
          src="/bingbong.webp"
          alt="Welcome Image"
          sx={{
            width: "100%",
            maxWidth: 400,
            height: "auto",
            mt: 1,
            mb: 3,
            borderRadius: 2,
            boxShadow: 1,
            mx: "auto",
            display: "block"
          }}
        />

        <Stack direction="row" spacing={3} justifyContent="center" mt={2}>
          <Button sx={buttonSx} onClick={onContinueAsGuest}>
            Continue as Guest
          </Button>

          <Button sx={buttonSx} onClick={onLogin}>
            Login
          </Button>

          <Button sx={buttonSx} onClick={onCreateAccount}>
            Create Account
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
