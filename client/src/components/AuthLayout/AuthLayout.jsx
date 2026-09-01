import { Box, Paper, Stack, Typography } from "@mui/material";
import logo from "../../assets/logo.png";

/**
 Shared shell for the Login and Register pages.
 */
const AuthLayout = ({ title, subtitle, children, footer }) => {
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 4,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          zIndex: -1,
          backgroundImage:
            "radial-gradient(ellipse at 50% 20%, hsl(160, 65%, 95%), hsl(0, 0%, 100%) 60%)",
        },
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 2.5,
          width: "100%",
          maxWidth: 420,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          borderColor: "rgba(31, 174, 133, 0.15)",
          boxShadow:
            "hsla(160, 40%, 15%, 0.06) 0px 5px 15px 0px, hsla(160, 35%, 15%, 0.05) 0px 15px 35px -5px",
        }}
      >
        <Stack alignItems="center" spacing={0.5} sx={{ width: "100%" }}>
          <Box
            sx={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <Box
              component="img"
              src={logo}
              alt="Loyalty Program"
              sx={{ width: 88, height: "auto", display: "block" }}
            />
          </Box>
          <Typography
            component="h1"
            variant="h5"
            fontWeight={700}
            textAlign="center"
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              {subtitle}
            </Typography>
          )}
        </Stack>

        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {children}
        </Box>

        {footer && (
          <Typography textAlign="center" variant="body2" sx={{ width: "100%" }}>
            {footer}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default AuthLayout;
