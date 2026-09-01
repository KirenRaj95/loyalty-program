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
import { registerUser } from "../../utils/api_auth";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import { useSnackbar } from "notistack";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register = () => {
  const [name, setName] = useState("");
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

  const validateIdentifier = () => {
    if (identifierType === "email" && !EMAIL_REGEX.test(email)) {
      return "Please enter a valid email address";
    }
    if (identifierType === "phone" && phone.trim().length === 0) {
      return "Please enter a phone number";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateIdentifier();
    if (validationError) {
      setError(validationError);
      enqueueSnackbar(validationError, { variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        password,
        ...(identifierType === "email" ? { email } : { phone }),
      };

      const data = await registerUser(payload);
      login(data.user, data.token);
      enqueueSnackbar("Account created successfully!", { variant: "success" });
      navigate("/dashboard");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Registration failed. Please try again.";
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Get started with your loyalty rewards"
      footer={
        <>
          Already have an account? <Link to="/login">Login</Link>
        </>
      }
    >
      {error && <Alert severity="error">{error}</Alert>}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
        />

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
          {loading ? "Creating account..." : "Register"}
        </Button>
      </Box>
    </AuthLayout>
  );
};

export default Register;
