import { useSearchParams } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";

const MotionBox = motion(Box);

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

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
              p: { xs: 2.5, sm: 4, md: 5 },
              borderRadius: 5,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
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
                Reset Password
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 1,
                  lineHeight: 1.7,
                }}
              >
                Create a new password for your TapReview
                account.
              </Typography>
            </Box>

            <ResetPasswordForm token={token} />
          </Paper>
        </MotionBox>
      </Container>
    </Box>
  );
}