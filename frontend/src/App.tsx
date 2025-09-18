import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Box } from "@chakra-ui/react";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import FilesPage from "./pages/FilesPage";

function App() {
  return (
    <Router>
      <Box>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/files" element={<FilesPage />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" />
      </Box>
    </Router>
  );
}

export default App;
