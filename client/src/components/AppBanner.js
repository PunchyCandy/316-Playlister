import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ProfileIcon from "./ProfileIcon";

export default function AppBanner({ user, onLogout, onNavigate }) {
  return (
    <AppBar position="static" color="primary" sx={{ mb: 2 }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" sx={{ mr: 2 }} onClick={() => onNavigate("home")}>
          <HomeIcon />
        </IconButton>

        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Playlister
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {user && (
            <>
              <Button
                color="inherit"
                onClick={() => onNavigate("home")}
              >
                Playlists
              </Button>
              <Button
                color="inherit"
                onClick={() => onNavigate("catalog")}
              >
                Song Catalog
              </Button>
            </>
          )}

          <ProfileIcon user={user} onLogout={onLogout} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
