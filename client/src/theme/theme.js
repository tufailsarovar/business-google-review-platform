import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#2563eb",
      dark: "#1d4ed8",
      light: "#60a5fa",
      contrastText: "#ffffff",
    },

    secondary: {
      main: "#7c3aed",
      dark: "#6d28d9",
      light: "#a78bfa",
      contrastText: "#ffffff",
    },

    background: {
      default: "#f7f9fc",
      paper: "#ffffff",
    },

    text: {
      primary: "#172033",
      secondary: "#64748b",
    },

    divider: "#e8edf5",

    success: {
      main: "#16a34a",
    },

    warning: {
      main: "#f59e0b",
    },

    error: {
      main: "#dc2626",
    },

    info: {
      main: "#0284c7",
    },
  },

  shape: {
    borderRadius: 16,
  },

  typography: {
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",

    h1: {
      fontWeight: 800,
      letterSpacing: "-0.04em",
      lineHeight: 1.1,
    },

    h2: {
      fontWeight: 800,
      letterSpacing: "-0.03em",
      lineHeight: 1.15,
    },

    h3: {
      fontWeight: 800,
      letterSpacing: "-0.025em",
      lineHeight: 1.2,
    },

    h4: {
      fontWeight: 800,
      letterSpacing: "-0.02em",
      lineHeight: 1.25,
    },

    h5: {
      fontWeight: 750,
    },

    h6: {
      fontWeight: 750,
    },

    button: {
      textTransform: "none",
      fontWeight: 700,
    },

    body1: {
      lineHeight: 1.7,
    },

    body2: {
      lineHeight: 1.6,
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollBehavior: "smooth",
        },

        body: {
          margin: 0,
          minWidth: 320,
          backgroundColor: "#f7f9fc",
        },

        "*": {
          boxSizing: "border-box",
        },

        a: {
          color: "inherit",
        },

        "::selection": {
          backgroundColor: "#bfdbfe",
          color: "#172033",
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },

      styleOverrides: {
        root: {
          borderRadius: 12,
          minHeight: 42,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        fullWidth: true,
      },

      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #e8edf5",
          boxShadow:
            "0 10px 30px rgba(15, 23, 42, 0.05)",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 600,
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export { theme };

export default theme;