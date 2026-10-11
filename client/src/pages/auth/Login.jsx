import { Box, Container, Paper, Typography } from "@mui/material";
import { motion } from "framer-motion";
import LoginForm from "../../components/auth/LoginForm";

const MotionBox = motion(Box);

export default function Login() {
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
          <Paper elevation={0}>
            <LoginForm />
          </Paper>
        </MotionBox>
      </Container>
    </Box>
  );
}
