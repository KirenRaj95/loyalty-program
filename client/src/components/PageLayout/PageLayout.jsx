import { Container, Box } from "@mui/material";
import Navbar from "../Navbar/Navbar";

const PageLayout = ({ children }) => {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa" }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 4 } }}>
        {children}
      </Container>
    </Box>
  );
};

export default PageLayout;
