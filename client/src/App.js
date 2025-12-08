import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, Box } from "@mui/material";

import AppBanner from "./components/AppBanner";
import WelcomeScreen from "./components/WelcomeScreen";
import AccountScreen from "./components/AccountScreen";
import EditAccountScreen from "./components/EditAccountScreen";
import HomeScreen from "./components/HomeScreen";
import SongCatalog from "./components/SongCatalog";
import { fetchCurrentUser } from "./api/authApi";

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
  const [accountTab, setAccountTab] = useState(0);

  const TOKEN_KEY = "playlisterToken";

  const [authToken, setAuthToken] = useState(
    () => window.localStorage.getItem(TOKEN_KEY) || ""
  );

  useEffect(() => {
    async function loadUser() {
      if (!authToken) return;
      try {
        const user = await fetchCurrentUser(authToken);
        setCurrentUser(user);
        setCurrentScreen("home");   // or whatever your "logged-in" screen is
      } catch (err) {
        console.error("Failed to load current user", err);
        setAuthToken("");
        window.localStorage.removeItem(TOKEN_KEY);
      }
    }
    loadUser();
  }, [authToken]);

  function handleAuthSuccess({ user, token }) {
    setCurrentUser(user);
    setAuthToken(token);
    window.localStorage.setItem(TOKEN_KEY, token);
    setCurrentScreen("home");
  }

  const handleLogin = (user) => {
    setCurrentUser(user);
    setCurrentScreen("home");
  };

  const handleNavigate = (screen) => {
    if (screen === "home") {
      setCurrentScreen(currentUser ? "home" : "welcome");
      return;
    }
    setCurrentScreen(screen);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken("");
    window.localStorage.removeItem(TOKEN_KEY);
    setCurrentScreen("welcome");
  };

  const goToLogin = () => {
    setAccountTab(1);                 // login tab
    setCurrentScreen("account");      // go to account screen
  };

  const goToCreateAccount = () => {
    setAccountTab(0);                 // create account tab
    setCurrentScreen("account");
  };

  const goToEditAccount = () => {
    setCurrentScreen("edit-account"); // or whatever screen you create later
  };


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "#f2f5f9" }}>
        <AppBanner
          user={currentUser}
          onLoginClick={goToLogin}
          onCreateAccountClick={goToCreateAccount}
          onEditAccountClick={goToEditAccount}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />


        {currentScreen === "welcome" && (
          <WelcomeScreen
            onContinueAsGuest={() => setCurrentScreen("home")}
            onLogin={() => {
              setAccountTab(1);
              setCurrentScreen("account");
            }}
            onCreateAccount={() => {
              setAccountTab(0);
              setCurrentScreen("account");
            }}
          />
        )}


        {currentScreen === "account" && (
          <AccountScreen
            initialTab={accountTab}
            onAuthSuccess={handleAuthSuccess}
          />
        )}

        {currentScreen === "home" && (
          <HomeScreen
            user={currentUser}
            onOpenSongCatalog={() => setCurrentScreen("catalog")}
            selectedPlaylist={selectedPlaylist}
            setSelectedPlaylist={setSelectedPlaylist}
          />
        )}

        {currentScreen === "edit-account" && (
          <EditAccountScreen
            user={currentUser}
            token={authToken}
            onAuthSuccess={handleAuthSuccess}
            onCancel={() => setCurrentScreen("home")}
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
