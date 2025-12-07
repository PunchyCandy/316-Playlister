import React, { useState } from "react";
import {
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemText,
  Box
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function ProfileIcon({
  user,
  onLoginClick,
  onCreateAccountClick,
  onEditAccountClick,
  onLogout
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const initials = user?.name ? user.name[0].toUpperCase() : "?";

  const handleLogin = () => {
    handleClose();
    if (onLoginClick) onLoginClick();
  };

  const handleCreateAccount = () => {
    handleClose();
    if (onCreateAccountClick) onCreateAccountClick();
  };

  const handleEditAccount = () => {
    handleClose();
    if (onEditAccountClick) onEditAccountClick();
  };

  const handleLogoutClick = () => {
    handleClose();
    if (onLogout) onLogout();
  };

  return (
    <Box>
      {/* Avatar / profile icon */}
      <IconButton color="inherit" onClick={handleOpen} size="large">
        {user ? (
          <Avatar
            src={user.avatarUrl || undefined}
            sx={{ width: 36, height: 36 }}
          >
            {initials}
          </Avatar>
        ) : (
          <AccountCircleIcon sx={{ fontSize: 32 }} />
        )}
      </IconButton>

      {/* Drop-down menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            bgcolor: "#f5ecff",          // light purple background
            borderRadius: 3,
            boxShadow: 3,
            minWidth: 220
          }
        }}
      >
        {!user && (
          <>
            {/* Guest menu: Login + Create Account */}
            <MenuItem onClick={handleLogin} sx={{ py: 1.5 }}>
              <ListItemText
                primary="Login"
                primaryTypographyProps={{ fontSize: 18 }}
              />
            </MenuItem>
            <MenuItem onClick={handleCreateAccount} sx={{ py: 1.5 }}>
              <ListItemText
                primary="Create Account"
                primaryTypographyProps={{ fontSize: 18 }}
              />
            </MenuItem>
          </>
        )}

        {user && (
          <>
            {/* Logged-in menu: Edit Account + Logout */}
            <MenuItem onClick={handleEditAccount} sx={{ py: 1.5 }}>
              <ListItemText
                primary="Edit Account"
                primaryTypographyProps={{ fontSize: 18 }}
              />
            </MenuItem>
            <MenuItem onClick={handleLogoutClick} sx={{ py: 1.5 }}>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ fontSize: 18 }}
              />
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
}
