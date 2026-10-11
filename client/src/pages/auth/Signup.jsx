import { Box, Container } from "@mui/material";
import { motion } from "framer-motion";
import SignupForm from "../../components/auth/SignupForm";

const MotionBox = motion(Box);

export default function Signup() {
  return (
    <Box
      sx={{
        minHeight: { xs: "auto", md: "calc(100vh - 140px)" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 1.5, sm: 3, md: 5 },
        background:
          "linear-gradient(135deg, rgba(37,99,235,0.05), rgba(99,102,241,0.03))",
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          px: { xs: 1.5, sm: 3 },
        }}
      >
        <MotionBox
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <SignupForm />
        </MotionBox>
      </Container>
    </Box>
  );
}
