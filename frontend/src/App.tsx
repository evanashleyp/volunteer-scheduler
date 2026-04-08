import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import type { TableData } from "./types";
import InputDataPage from "./pages/InputDataPage";
import SchedulePage from "./pages/SchedulePage";
import { schedulerApi } from "./services/api";

function App() {
  const [tabIndex, setTabIndex] = useState(0);
  const [data, setData] = useState<TableData>({
    volunteers: [],
    availability: [],
    fixed_assignments: [],
    special_rules: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load initial data from CSV files on app mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log("[APP] Loading initial data from CSV files...");
        const initialData = await schedulerApi.getData();
        console.log("[APP] Loaded data:", initialData);
        setData(initialData);
        setLoadError(null);
        setLoading(false);
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || err.message || "Failed to load data from server";
        console.error("[APP] Error loading initial data:", errorMsg);
        setLoadError(errorMsg);
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#121212",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header */}
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 700 }}>
            ☕ Barista Scheduler
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Error Alert */}
      {loadError && (
        <Alert severity="error" sx={{ m: 2 }}>
          <strong>Error loading data:</strong> {loadError}. Check browser console and server logs for details.
        </Alert>
      )}

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
          {/* Navigation Tabs */}
          <Tabs
            value={tabIndex}
            onChange={(_, newValue) => setTabIndex(newValue)}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              backgroundColor: "#2c3e50",
            }}
          >
            <Tab label="📋 Input Data" id="tab-input" />
            <Tab label="📅 Generate Schedule" id="tab-schedule" />
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ p: 4 }}>
            {tabIndex === 0 && <InputDataPage data={data} onDataChange={setData} />}
            {tabIndex === 1 && <SchedulePage data={data} />}
          </Box>
        </Paper>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          backgroundColor: "#2c3e50",
          color: "#b0bec5",
          textAlign: "center",
          py: 2,
          mt: "auto",
        }}
      >
        <Typography variant="body2">
          Built with React + Material-UI | Powered by Python Scheduler
        </Typography>
      </Box>
    </Box>
  );
}

export default App;

