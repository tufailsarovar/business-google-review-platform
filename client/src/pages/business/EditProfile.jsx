import { Box, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

import BusinessProfileForm from "../../components/business/BusinessProfileForm";

const MotionBox = motion(Box);

export default function EditProfile() {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: "easeOut",
      }}
      sx={{
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: {
            xs: 1.8,
            sm: 2.5,
          },
        }}
      >
        <Stack
          direction="row"
          spacing={0.7}
          alignItems="center"
          sx={{ mb: 0.5 }}
        >
          <EditRoundedIcon
            color="primary"
            sx={{
              fontSize: {
                xs: 18,
                sm: 21,
              },
            }}
          />

          <Typography
            color="primary"
            fontWeight={800}
            sx={{
              fontSize: {
                xs: "0.7rem",
                sm: "0.78rem",
              },
              letterSpacing: "0.04em",
            }}
          >
            EDIT PROFILE
          </Typography>
        </Stack>

        <Typography
          component="h1"
          fontWeight={900}
          sx={{
            fontSize: {
              xs: "1.45rem",
              sm: "2rem",
              md: "2.3rem",
            },
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
          }}
        >
          Edit Business Profile
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 0.5,
            maxWidth: 650,
            fontSize: {
              xs: "0.78rem",
              sm: "0.9rem",
            },
            lineHeight: 1.55,
          }}
        >
          Update your business information, contact details, description, and
          logo.
        </Typography>
      </Box>

      {/* Form */}
      <BusinessProfileForm />
    </MotionBox>
  );
}
