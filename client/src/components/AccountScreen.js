import React, { useState } from "react";
import { registerAccount, loginAccount } from "../api/authApi";
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

export default function AccountScreen({ initialTab = 0, onAuthSuccess }) {
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
          <CreateAccountForm onAuthSuccess={onAuthSuccess} setTab={setTab} />
        )}
        {tab === 1 && <LoginAccount onAuthSuccess={onAuthSuccess} />}
      </Paper>
    </Box>
  );
}

function CreateAccountForm({ onAuthSuccess, setTab }) {
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirm: ""
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarData, setAvatarData] = useState("");

  const handleChange = (e) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setAvatarData(result);
        setAvatarPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (values.password !== values.confirm) {
      alert("Passwords do not match");
      return;
    }

    try {
      const data = await registerAccount({
        username: values.username,
        email: values.email,
        password: values.password,
        avatar: avatarData
      });
      // data: { token, user }
      onAuthSuccess && onAuthSuccess(data);
    } catch (err) {
      alert(err.message || "Failed to create account");
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

function LoginAccount({ onAuthSuccess }) {
  const [values, setValues] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await loginAccount({
        email: values.email,     // or change your TextField to "email"
        password: values.password
      });
      // data: { token, user }
      onAuthSuccess && onAuthSuccess(data);
    } catch (err) {
      alert(err.message || "Failed to login");
    }
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
        name="email"
        label="Email"
        value={values.email}
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
