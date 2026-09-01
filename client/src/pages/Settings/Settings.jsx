import { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Box,
  Avatar,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { getProfile, updateProfile, uploadAvatar } from "../../utils/api_user";
import { useAuth } from "../../context/AuthContext";
import PageLayout from "../../components/PageLayout/PageLayout";
import { API_BASE_URL } from "../../utils/config";
import { useSnackbar } from "notistack";

const toLocalPhone = (storedPhone) => {
  if (!storedPhone) return "";
  return storedPhone.replace(/^\+?60/, "");
};

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MB

const Settings = () => {
  const { user, login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        setName(profile.name || "");
        setEmail(profile.email || "");
        setPhone(toLocalPhone(profile.phone));
        setAddress(profile.address || "");
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const result = await updateProfile({ name, email, phone, address });
      const token = localStorage.getItem("token");
      login(result.user, token);
      setPhone(toLocalPhone(result.user.phone));
      setSuccess("Profile updated successfully!");
      enqueueSnackbar("Profile updated successfully!", { variant: "success" });
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to update profile";
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Reject files that are 5 MB or larger
    if (file.size >= MAX_AVATAR_SIZE) {
      const errorMessage = "Please upload an avatar image smaller than 5 MB.";

      setError(errorMessage);

      enqueueSnackbar(errorMessage, {
        variant: "error",
      });

      e.target.value = "";
      return;
    }

    setError("");
    setSuccess("");
    setUploadingAvatar(true);

    try {
      const result = await uploadAvatar(file);

      const token = localStorage.getItem("token");

      login(
        {
          ...user,
          avatar: result.avatar,
        },
        token,
      );

      setSuccess("Avatar updated successfully!");

      enqueueSnackbar("Avatar updated successfully!", {
        variant: "success",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to upload avatar";

      setError(errorMessage);

      enqueueSnackbar(errorMessage, {
        variant: "error",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <CircularProgress />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          px: { xs: 1, sm: 0 },
        }}
      >
        <Typography variant="h4" mb={1} textAlign="center">
          Settings
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          mb={5}
          textAlign="center"
          maxWidth={420}
        >
          Update your profile information and avatar.
        </Typography>

        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, sm: 4 },
            width: "100%",
            maxWidth: 480,
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              mb: 4,
            }}
          >
            <Avatar
              src={user?.avatar ? `${API_BASE_URL}${user.avatar}` : undefined}
              sx={{
                width: 96,
                height: 96,
                mb: 2,
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>

            <Button
              component="label"
              variant="outlined"
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? "Uploading..." : "Change Avatar"}

              <input
                type="file"
                hidden
                accept="image/jpeg,image/png"
                onChange={handleAvatarChange}
              />
            </Button>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                mt: 0.75,
                textAlign: "center",
              }}
            >
              Accepted formats: JPEG, JPG or PNG. Maximum file size: 5 MB.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSave}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
            <TextField
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
              placeholder="12-345 6789"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">🇲🇾 +60</InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              multiline
              rows={2}
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </PageLayout>
  );
};

export default Settings;
