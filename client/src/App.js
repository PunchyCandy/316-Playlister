import React, { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, Box } from "@mui/material";

import AppBanner from "./components/AppBanner";
import WelcomeScreen from "./components/WelcomeScreen";
import AccountScreen from "./components/AccountScreen";
import HomeScreen from "./components/HomeScreen";
import SongCatalog from "./components/SongCatalog";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    secondary: { main: "#ff9800" }
  }
});

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("welcome");
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setCurrentScreen("home");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen("welcome");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "#f2f5f9" }}>
        <AppBanner
          user={currentUser}
          onLogout={handleLogout}
          onNavigate={setCurrentScreen}
        />

        {currentScreen === "welcome" && (
          <WelcomeScreen
            onContinueAsGuest={() => setCurrentScreen("home")}
            onLogin={() => setCurrentScreen("account")}
            onCreateAccount={() => setCurrentScreen("account")}
          />
        )}


        {currentScreen === "account" && (
          <AccountScreen onLogin={handleLogin} />
        )}

        {currentScreen === "home" && (
          <HomeScreen
            onOpenSongCatalog={() => setCurrentScreen("catalog")}
            selectedPlaylist={selectedPlaylist}
            setSelectedPlaylist={setSelectedPlaylist}
          />
        )}

        {currentScreen === "catalog" && (
          <SongCatalog
            onBack={() => setCurrentScreen("home")}
            playlist={selectedPlaylist}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}
