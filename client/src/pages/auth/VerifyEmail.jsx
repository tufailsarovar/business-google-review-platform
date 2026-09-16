import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Typography,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import { motion } from "framer-motion";

import authService from "../../services/authService";

const MotionBox = motion(Box);

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState(
    "Verifying your email address..."
  );

  useEffect(() => {
    let mounted = true;

    const verify = async () => {
      if (!token) {
        if (!mounted) return;

        setStatus("error");
        setMessage(
          "The email verification link is missing or invalid."
        );
        return;
      }

      try {
        await authService.verifyEmail(token);

        if (!mounted) return;

        setStatus("success");
        setMessage(
          "Your email address has been verified successfully."
        );
      } catch (error) {
        if (!mounted) return;

        setStatus("error");
        setMessage(
          error?.response?.data?.message ||
            "Email verification failed. The link may have expired or already been used."
        );
      }
    };

    verify();

    return () => {
      mounted = false;
    };
  }, [token]);

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 140px)",
        display: "flex",
        alignItems: "center",
        py: { xs: 5, md: 8 },
        background:
          "linear-gradient(135deg, rgba(37,99,235,0.05), rgba(99,102,241,0.03))",
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
              p: { xs: 3, sm: 5 },
              borderRadius: 5,
              border: "1px solid",
              borderColor: "divider",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 70,
                height: 70,
                mx: "auto",
                mb: 3,
                display: "grid",
                placeItems: "center",
                borderRadius: "50%",
                backgroundColor: isLoading
                  ? "action.hover"
                  : isSuccess
                    ? "success.light"
                    : "error.light",
                color: isLoading
                  ? "primary.main"
                  : isSuccess
                    ? "success.main"
                    : "error.main",
              }}
            >
              {isLoading ? (
                <CircularProgress size={32} />
              ) : isSuccess ? (
                <CheckCircleRoundedIcon sx={{ fontSize: 38 }} />
              ) : (
                <ErrorOutlineRoundedIcon
                  sx={{ fontSize: 38 }}
                />
              )}
            </Box>

            <Typography
              component="h1"
              variant="h4"
              fontWeight={800}
              sx={{
                fontSize: {
                  xs: "1.8rem",
                  sm: "2.2rem",
                },
              }}
            >
              {isLoading
                ? "Verifying Email"
                : isSuccess
                  ? "Email Verified"
                  : "Verification Failed"}
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 1.5,
                lineHeight: 1.8,
              }}
            >
              {message}
            </Typography>

            {!isLoading && (
              <Button
                component={Link}
                to={isSuccess ? "/login" : "/"}
                variant="contained"
                size="large"
                sx={{
                  mt: 3,
                  minHeight: 48,
                  px: 3,
                  borderRadius: 2.5,
                }}
              >
                {isSuccess ? "Continue to Login" : "Go to Home"}
              </Button>
            )}

            {isSuccess && (
              <Alert
                severity="success"
                icon={<MarkEmailReadRoundedIcon />}
                sx={{
                  mt: 3,
                  textAlign: "left",
                  borderRadius: 2.5,
                }}
              >
                You can now sign in using your verified
                account.
              </Alert>
            )}
          </Paper>
        </MotionBox>
      </Container>
    </Box>
  );
}