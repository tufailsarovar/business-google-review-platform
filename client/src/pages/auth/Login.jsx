
import { Box, Container, Paper } from "@mui/material";
import { motion } from "framer-motion";
import LoginForm from "../../components/auth/LoginForm";

const MotionBox = motion(Box);

export default function Login() {
  return (
    <Box
      sx={{
        minHeight: { xs: "auto", md: "calc(100vh - 140px)" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 3, sm: 5, md: 7 },
        background:
          "linear-gradient(135deg, #eaf0ff 0%, #f5f7ff 50%, #eef2ff 100%)",
      }}
    >
      <Container maxWidth="sm" sx={{ px: { xs: 1.5, sm: 3 } }}>
        <MotionBox
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 4 },
              border: "1px solid #dbe4f0",
              borderRadius: 2,
              backgroundColor: "#ffffff",
              boxShadow: "0 12px 40px rgba(30, 64, 175, 0.10)",
            }}
          >
            <LoginForm />
          </Paper>
        </MotionBox>
      </Container>
    </Box>
  );
}
