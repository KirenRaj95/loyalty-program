import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Button,
  TextField,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  InputAdornment,
} from "@mui/material";
import { loginUser } from "../../utils/api_auth";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import { useSnackbar } from "notistack";

const Login = () => {
  const [identifierType, setIdentifierType] = useState("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleIdentifierTypeChange = (e, newType) => {
    if (newType !== null) {
      setIdentifierType(newType);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        password,
        ...(identifierType === "email" ? { email } : { phone }),
      };

      const data = await loginUser(payload);
      login(data.user, data.token);
      enqueueSnackbar(`Welcome back, ${data.user.name}!`, {
        variant: "success",
      });
      navigate(data.user.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Login failed. Please try again.";
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Login to continue"
      footer={
        <>
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </>
      }
    >
      {error && <Alert severity="error">{error}</Alert>}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}
      >
        <ToggleButtonGroup
          value={identifierType}
          exclusive
          onChange={handleIdentifierTypeChange}
          fullWidth
          size="small"
        >
          <ToggleButton value="email">Use Email</ToggleButton>
          <ToggleButton value="phone">Use Phone Number</ToggleButton>
        </ToggleButtonGroup>

        {identifierType === "email" ? (
          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
        ) : (
          <TextField
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
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
        )}

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </Box>
    </AuthLayout>
  );
};

export default Login;
