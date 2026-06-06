import { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Alert,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import type { TableData, Volunteer, Availability, FixedAssignment, SpecialRule } from "../types";
import EditableTable from "../components/EditableTable";
import type { Column } from "../components/EditableTable";
import { schedulerApi } from "../services/api";

interface InputDataPageProps {
  data: TableData;
  onDataChange: (newData: TableData) => void;
}

const volunteerColumns: Column[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "can_hot", label: "Can Hot", type: "checkbox" },
  { key: "can_cold", label: "Can Cold", type: "checkbox" },
  { key: "can_order", label: "Can Order", type: "checkbox" },
];

const generateAvailabilityColumns = (numWeeks: number): Column[] => {
  const cols: Column[] = [
    { key: "name", label: "Name", type: "text" },
  ];
  for (let i = 1; i <= numWeeks; i++) {
    cols.push({
      key: `week${i}`,
      label: `Week ${i}`,
      type: "checkbox",
    });
  }
  return cols;
};

const generateFixedAssignmentColumns = (volunteers: Volunteer[], numWeeks: number): Column[] => {
  const volunteerNames = volunteers.map((v) => ({
    value: v.name,
    label: v.name,
  }));
  const roles = [
    { value: "hot", label: "Hot" },
    { value: "cold", label: "Cold" },
    { value: "order", label: "Order" },
  ];
  const weeks = Array.from({ length: numWeeks }, (_, i) => ({
    value: i + 1,
    label: `Week ${i + 1}`,
  }));

  return [
    { key: "week", label: "Week", type: "select", options: weeks },
    { key: "role", label: "Role", type: "select", options: roles },
    { key: "name", label: "Name", type: "combobox", options: volunteerNames },
  ];
};

const generateSpecialRulesColumns = (volunteers: Volunteer[], numWeeks: number): Column[] => {
  const volunteerNames = volunteers.map((v) => ({
    value: v.name,
    label: v.name,
  }));
  const roles = [
    { value: "hot", label: "Hot" },
    { value: "cold", label: "Cold" },
    { value: "order", label: "Order" },
  ];
  const weeks = Array.from({ length: numWeeks }, (_, i) => ({
    value: i + 1,
    label: `Week ${i + 1}`,
  }));

  return [
    { key: "name", label: "Name", type: "combobox", options: volunteerNames },
    { key: "week", label: "Week", type: "select", options: weeks },
    { key: "role", label: "Role", type: "select", options: roles },
    { key: "bonus", label: "Bonus (0 - 50)", type: "number" },
  ];
};

const InputDataPage: React.FC<InputDataPageProps> = ({ data, onDataChange }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [numWeeks, setNumWeeks] = useState(4);
  const [saveLoading, setSaveLoading] = useState(false);
  const [reloadLoading, setReloadLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: string; text: string } | null>(null);

  const availabilityColumns = generateAvailabilityColumns(numWeeks);
  const fixedAssignmentColumnsWithOptions = generateFixedAssignmentColumns(data.volunteers, numWeeks);
  const specialRulesColumnsWithOptions = generateSpecialRulesColumns(data.volunteers, numWeeks);

  const handleVolunteersChange = (newData: Record<string, any>[]) => {
    onDataChange({ ...data, volunteers: newData as Volunteer[] });
  };

  const handleAvailabilityChange = (newData: Record<string, any>[]) => {
    onDataChange({ ...data, availability: newData as Availability[] });
  };

  const handleFixedAssignmentsChange = (
    newData: Record<string, any>[]
  ) => {
    onDataChange({ ...data, fixed_assignments: newData as FixedAssignment[] });
  };

  const handleSpecialRulesChange = (newData: Record<string, any>[]) => {
    onDataChange({ ...data, special_rules: newData as SpecialRule[] });
  };

  const handleSaveData = async () => {
    setSaveLoading(true);
    setSaveMessage(null);
    
    try {
      await schedulerApi.saveData(data);
      console.log("[SAVE] Data saved successfully via API");
      setSaveMessage({ type: "success", text: "✓ Data saved successfully!" });
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      console.error("[SAVE] Error saving data:", err);
      const errorText = err.response?.data?.error || err.message || "Failed to save data";
      setSaveMessage({ type: "error", text: `✗ ${errorText}` });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleReloadData = async () => {
    setReloadLoading(true);
    setSaveMessage(null);
    
    try {
      const freshData = await schedulerApi.getData();
      onDataChange(freshData);
      console.log("[RELOAD] Data reloaded from CSV files");
      setSaveMessage({ type: "success", text: "✓ Data reloaded from files!" });
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      console.error("[RELOAD] Error reloading data:", err);
      const errorText = err.response?.data?.error || err.message || "Failed to reload data";
      setSaveMessage({ type: "error", text: `✗ ${errorText}` });
    } finally {
      setReloadLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        Edit the volunteer data below. Each table supports inline editing and row operations.
      </Alert>
      
      {saveMessage && (
        <Alert severity={saveMessage.type === "success" ? "success" : "error"} sx={{ mb: 3 }} onClose={() => setSaveMessage(null)}>
          {saveMessage.text}
        </Alert>
      )}
      
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          label="Number of Weeks"
          type="number"
          value={numWeeks}
          onChange={(e) => setNumWeeks(Math.max(1, parseInt(e.target.value) || 1))}
          inputProps={{ min: 1, max: 52 }}
          sx={{ width: 150 }}
        />
        <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleReloadData}
            disabled={reloadLoading}
            startIcon={reloadLoading ? <CircularProgress size={20} /> : undefined}
          >
            {reloadLoading ? "Reloading..." : "🔄 Reload Data"}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSaveData}
            disabled={saveLoading}
            startIcon={saveLoading ? <CircularProgress size={20} /> : undefined}
          >
            {saveLoading ? "Saving..." : "💾 Save Data"}
          </Button>
        </Box>
      </Box>
      
      <Paper sx={{ borderRadius: 2 }}>
        <Tabs
          value={tabIndex}
          onChange={(_, newValue) => setTabIndex(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Volunteers" id="tab-0" />
          <Tab label="Availability" id="tab-1" />
          <Tab label="Fixed Assignments" id="tab-2" />
          <Tab label="Special Rules" id="tab-3" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabIndex === 0 && (
            <EditableTable
              columns={volunteerColumns}
              data={data.volunteers}
              onDataChange={handleVolunteersChange}
              title="Volunteer Skills"
            />
          )}
          {tabIndex === 1 && (
            <EditableTable
              columns={availabilityColumns}
              data={data.availability}
              onDataChange={handleAvailabilityChange}
              title="Volunteer Availability (check mark = available)"
            />
          )}
          {tabIndex === 2 && (
            <EditableTable
              columns={fixedAssignmentColumnsWithOptions}
              data={data.fixed_assignments}
              onDataChange={handleFixedAssignmentsChange}
              title="Pre-assigned Roles (immutable)"
            />
          )}
          {tabIndex === 3 && (
            <EditableTable
              columns={specialRulesColumnsWithOptions}
              data={data.special_rules}
              onDataChange={handleSpecialRulesChange}
              title="Bonus Rules"
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default InputDataPage;
