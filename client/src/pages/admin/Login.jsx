import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

const MotionBox = motion(Box);

export default function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = event => {
    const { name, value } = event.target;

    setForm(previous => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await adminLogin({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (response?.user?.role !== "admin") {
        throw new Error(
          "This account does not have admin access."
        );
      }

      navigate("/admin/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to sign in as admin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 140px)",
        display: "flex",
        alignItems: "center",
        py: { xs: 5, md: 8 },
        background:
          "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(99,102,241,0.04))",
      }}
    >
      <Container maxWidth="sm">
        <MotionBox
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 4, md: 5 },
              borderRadius: 5,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box
                sx={{
                  width: 68,
                  height: 68,
                  mx: "auto",
                  mb: 2,
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #2563eb, #4f46e5)",
                  color: "#fff",
                }}
              >
                <AdminPanelSettingsOutlinedIcon
                  sx={{ fontSize: 36 }}
                />
              </Box>

              <Typography
                component="h1"
                variant="h4"
                fontWeight={800}
              >
                Super Admin Login
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Sign in to manage TapReview.
              </Typography>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{ mb: 3, borderRadius: 2 }}
              >
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
            >
              <TextField
                fullWidth
                required
                label="Admin Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                autoComplete="email"
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                required
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="current-password"
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            previous => !previous
                          )
                        }
                        sx={{
                          minWidth: 0,
                          p: 1,
                        }}
                      >
                        {showPassword ? (
                          <VisibilityOffOutlinedIcon />
                        ) : (
                          <VisibilityOutlinedIcon />
                        )}
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 700,
                  textTransform: "none",
                }}
              >
                {loading
                  ? "Signing in..."
                  : "Sign In as Admin"}
              </Button>
            </Box>
          </Paper>
        </MotionBox>
      </Container>
    </Box>
  );
}