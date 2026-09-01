import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../../context/AuthContext";
import logoStatic from "../../assets/logo-icon-static.png";
import logoAnimated from "../../assets/logo-icon-animated.webp";
import { API_BASE_URL } from "../../utils/config";
import { useSnackbar } from "notistack";

const userLinks = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Upload Receipt", path: "/receipts/upload" },
  { label: "My Receipts", path: "/receipts" },
  { label: "Vouchers", path: "/vouchers" },
  { label: "Settings", path: "/settings" },
];

const adminLinks = [
  { label: "Admin Dashboard", path: "/admin/dashboard" },
  { label: "Validate Receipts", path: "/admin/receipts" },
];

const HoverLogo = () => {
  const [hovering, setHovering] = useState(false);

  return (
    <Box
      component="img"
      src={hovering ? logoAnimated : logoStatic}
      alt="Loyalty Program"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      sx={{ height: 36, width: "auto", display: "block" }}
    />
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const links = user?.role === "admin" ? adminLinks : userLinks;
  const { enqueueSnackbar } = useSnackbar();

  const handleLogout = () => {
    logout();
    enqueueSnackbar("You have been logged out.", { variant: "error" });
    navigate("/login");
  };

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}
          >
            <MenuIcon />
          </IconButton>

          <Box
            component={Link}
            to={user?.role === "admin" ? "/admin/dashboard" : "/dashboard"}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              flexGrow: 1,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <HoverLogo />
            <Typography variant="h6" sx={{ color: "inherit", fontWeight: 700 }}>
              Loyalty Program
            </Typography>
          </Box>

          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
            {links.map((link) => (
              <Button
                key={link.path}
                color="primary"
                component={Link}
                to={link.path}
              >
                {link.label}
              </Button>
            ))}
          </Box>

          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ ml: 1 }}
          >
            <Avatar
              src={user?.avatar ? `${API_BASE_URL}${user.avatar}` : undefined}
              sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem disabled>{user?.name}</MenuItem>
            <MenuItem onClick={handleLogout}>Log Out</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box
          sx={{ width: 240 }}
          role="presentation"
          onClick={() => setDrawerOpen(false)}
        >
          <List>
            {links.map((link) => (
              <ListItemButton key={link.path} component={Link} to={link.path}>
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
