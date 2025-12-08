import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Stack,
  Typography,
  Avatar
} from "@mui/material";
import { updateAccount } from "../api/authApi";

export default function EditAccountScreen({ user, token, onAuthSuccess, onCancel }) {
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirm: ""
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarData, setAvatarData] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setValues((prev) => ({
        ...prev,
        username: user.username || "",
        email: user.email || ""
      }));
      setAvatarPreview(user.avatar || null);
      setAvatarData(user.avatar || "");
    }
  }, [user]);

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
    setError("");

    if (values.password && values.password !== values.confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      const data = await updateAccount({
        username: values.username,
        email: values.email,
        password: values.password || undefined,
        avatar: avatarData,
        token
      });
      onAuthSuccess && onAuthSuccess(data);
    } catch (err) {
      setError(err.message || "Failed to update account");
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 4, px: 2 }}>
      <Paper sx={{ maxWidth: 600, width: "100%", p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Edit Account
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 3,
              mb: 2
            }}
          >
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
                sx={{ textTransform: "none", px: 2 }}
              >
                Change
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
                name="password"
                label="New Password (optional)"
                type="password"
                value={values.password}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                name="confirm"
                label="Confirm New Password"
                type="password"
                value={values.confirm}
                onChange={handleChange}
              />
            </Stack>
          </Box>

          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}

          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Button type="submit" variant="contained" fullWidth>
              Save Changes
            </Button>
            <Button variant="outlined" fullWidth onClick={onCancel}>
              Cancel
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
