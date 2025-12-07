import React, { useState } from "react";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Stack,
  Typography,
  Link as MuiLink,
  Avatar
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

export default function AccountScreen({ initialTab = 0, onLogin }) {
  const [tab, setTab] = useState(initialTab ?? 0);
  const handleChange = (_, newValue) => setTab(newValue);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 4, px: 2 }}>
      <Paper sx={{ maxWidth: 600, width: "100%", p: 3 }}>
        <Tabs value={tab} onChange={handleChange} centered>
          <Tab label="Create Account" />
          <Tab label="Login" />
        </Tabs>

        {tab === 0 && (
          <CreateAccountForm onRegistered={onLogin} setTab={setTab} />
        )}
        {tab === 1 && <LoginAccount onLogin={onLogin} />}
      </Paper>
    </Box>
  );
}

function CreateAccountForm({ onRegistered, setTab }) {
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirm: ""
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const handleChange = (e) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setAvatarFile(file);

    // simple preview
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: include avatarFile when you send data to your backend
    if (onRegistered) {
      onRegistered({
        name: values.username,
        email: values.email,
        avatar: avatarFile
      });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      {/* Avatar + fields row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 3,
          mb: 2
        }}
      >
        {/* Left: Avatar + Select button */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <Avatar
            src={avatarPreview || undefined}
            sx={{ width: 72, height: 72, mb: 1 }}
          />
          <Button
            variant="outlined"
            size="small"
            component="label"
            sx={{
              textTransform: "none",
              px: 2
            }}
          >
            Select
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </Button>
        </Box>

        <Stack spacing={2} sx={{ flex: 1 }}>
          <TextField
            fullWidth
            required
            name="username"
            label="Username"
            value={values.username}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            required
            name="email"
            label="Email"
            type="email"
            value={values.email}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            required
            name="password"
            label="Password"
            type="password"
            value={values.password}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            required
            name="confirm"
            label="Password Confirm"
            type="password"
            value={values.confirm}
            onChange={handleChange}
          />
        </Stack>
      </Box>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{ mt: 1 }}
      >
        Create Account
      </Button>

      <Typography
        variant="body2"
        sx={{ mt: 2, textAlign: "center", color: "red" }}
      >
        Already have an account?{" "}
        <MuiLink
          underline="hover"
          sx={{ cursor: "pointer" }}
          onClick={() => setTab(1)}
        >
          Sign In
        </MuiLink>
      </Typography>
    </Box>
  );
}

function LoginAccount({ onLogin }) {
  const [values, setValues] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: call login API
    if (onLogin) onLogin({ name: values.username });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 2
        }}
      >
        <LockOutlinedIcon fontSize="large" />
      </Box>

      <TextField
        fullWidth
        required
        margin="normal"
        name="username"
        label="Username"
        value={values.username}
        onChange={handleChange}
      />
      <TextField
        fullWidth
        required
        margin="normal"
        name="password"
        label="Password"
        type="password"
        value={values.password}
        onChange={handleChange}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
      >
        Login
      </Button>

      <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
        Forgot your password?{" "}
        <MuiLink href="#" underline="hover">
          Reset it here
        </MuiLink>
      </Typography>
    </Box>
  );
}
