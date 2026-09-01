import { createTheme, responsiveFontSizes } from "@mui/material/styles";

let theme = createTheme({
  palette: {
    primary: {
      main: "#1FAE85",
      light: "#4FC79E",
      dark: "#158066",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#3FCB7A",
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        size: "large",
      },
      styleOverrides: {
        root: {
          paddingTop: 12,
          paddingBottom: 12,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        margin: "normal",
      },
    },

    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: 16,
          paddingRight: 16,
        },
      },
    },

    MuiToggleButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: "rgba(31, 174, 133, 0.12)",
            color: "#158066",
            "&:hover": {
              backgroundColor: "rgba(31, 174, 133, 0.18)",
            },
          },
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
