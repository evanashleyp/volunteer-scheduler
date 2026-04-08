import { useState } from "react";
import React from "react";
import {
  Box,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Chip,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { TableData, Assignment } from "../types";
import { schedulerApi } from "../services/api";

interface SchedulePageProps {
  data: TableData;
}

const SchedulePage: React.FC<SchedulePageProps> = ({ data }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const [weeks, setWeeks] = useState(4);
  const [editingCell, setEditingCell] = useState<{ role: string; week: number; volunteerIndex: number } | null>(null);
  const [editValue, setEditValue] = useState("");

  const roles: Array<"hot" | "order" | "cold"> = ["hot", "order", "cold"];

  const handleRunScheduler = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (!data.volunteers || data.volunteers.length === 0) throw new Error("No volunteers defined");
      if (!data.availability || data.availability.length === 0) throw new Error("No availability data defined");
      console.log("[SCHEDULER] Running scheduler with data:");
      console.log("  Volunteers:", data.volunteers.length);
      const response = await schedulerApi.schedule(data, weeks);
      console.log("[SCHEDULER] Response from API:", response);
      setAssignments(response.assignments);
      setHasRun(true);
      setSuccess("Schedule generated successfully!");
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to generate schedule");
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const getGridData = () => {
    const grid: Record<string, Record<number, Array<{ name: string; is_fixed: boolean; index: number }>>> = {};
    roles.forEach((role) => {
      grid[role] = {};
      for (let w = 1; w <= weeks; w++) {
        grid[role][w] = [];
      }
    });
    assignments.forEach((a, idx) => {
      if (grid[a.role]?.[a.week]) {
        grid[a.role][a.week].push({ name: a.name, is_fixed: a.is_fixed || false, index: idx });
      }
    });
    return grid;
  };

  const handleNameEdit = (role: string, week: number, volunteerIndex: number, newName: string) => {
    const gridData = getGridData();
    const volunteer = gridData[role]?.[week]?.[volunteerIndex];
    if (volunteer) {
      const oldName = volunteer.name;
      setAssignments(assignments.map((a) => (a.role === role && a.week === week && a.name === oldName ? { ...a, name: newName } : a)));
    }
  };

  const handleDeleteVolunteer = (role: string, week: number, volunteerIndex: number) => {
    const gridData = getGridData();
    const volunteer = gridData[role]?.[week]?.[volunteerIndex];
    if (volunteer) {
      setAssignments(assignments.filter((a) => !(a.role === role && a.week === week && a.name === volunteer.name)));
    }
  };

  const handleExportCSV = () => {
    const weekList = Array.from({ length: weeks }, (_, i) => i + 1);
    const csvRows: string[] = [];
    const weekHeaders = weekList.map((w) => `week${w}`).join(",");
    csvRows.push(`role,${weekHeaders}`);
    const gridData = getGridData();
    roles.forEach((role) => {
      const row: string[] = [role];
      weekList.forEach((week) => {
        const names = gridData[role][week].map((v) => v.name).join(";");
        row.push(names || "");
      });
      csvRows.push(row.join(","));
    });
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "schedule.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const gridData = getGridData();

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        <TextField label="Number of Weeks" type="number" value={weeks} onChange={(e) => setWeeks(Math.max(1, parseInt(e.target.value) || 1))} inputProps={{ min: 1, max: 52 }} sx={{ width: 150 }} />
        <Button variant="contained" size="large" onClick={handleRunScheduler} disabled={loading}>{loading ? "▶ Running..." : "▶ Run Scheduler"}</Button>
        {hasRun && <Button variant="outlined" onClick={handleExportCSV}>⬇ Export CSV</Button>}
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      {hasRun && (
        <TableContainer component={Paper} sx={{ overflow: "auto", mt: 3 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#2c3e50" }}>
                <TableCell sx={{ fontWeight: 700, width: 90, minWidth: 90 }}>Role</TableCell>
                {Array.from({ length: weeks }, (_, i) => i + 1).map((week) => (
                  <TableCell key={`header-week-${week}`} align="center" sx={{ fontWeight: 700, minWidth: 140 }}>Week {week}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <React.Fragment key={role}>
                  <TableRow sx={{ height: 80 }}>
                    <TableCell rowSpan={2} sx={{ fontWeight: 700, textTransform: "capitalize", backgroundColor: "#2c3e50", color: "#fff", verticalAlign: "top", padding: 2, fontSize: "1rem" }}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </TableCell>
                    {Array.from({ length: weeks }, (_, i) => i + 1).map((week) => (
                      <TableCell key={`${role}-${week}-1`} sx={{ padding: 1.5, verticalAlign: "top", borderRight: "1px solid #e0e0e0" }}>
                        {gridData[role][week].length > 0 && <VolunteerCell volunteer={gridData[role][week][0]} isEditing={editingCell?.role === role && editingCell?.week === week && editingCell?.volunteerIndex === 0} editValue={editValue} onEditClick={() => { setEditingCell({ role, week, volunteerIndex: 0 }); setEditValue(gridData[role][week][0].name); }} onEditChange={(val) => setEditValue(val)} onEditBlur={() => { if (editValue.trim()) handleNameEdit(role, week, 0, editValue); setEditingCell(null); }} onDelete={() => handleDeleteVolunteer(role, week, 0)} />}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow sx={{ height: 80 }}>
                    {Array.from({ length: weeks }, (_, i) => i + 1).map((week) => (
                      <TableCell key={`${role}-${week}-2`} sx={{ padding: 1.5, verticalAlign: "top", borderRight: "1px solid #e0e0e0" }}>
                        {gridData[role][week].length > 1 && <VolunteerCell volunteer={gridData[role][week][1]} isEditing={editingCell?.role === role && editingCell?.week === week && editingCell?.volunteerIndex === 1} editValue={editValue} onEditClick={() => { setEditingCell({ role, week, volunteerIndex: 1 }); setEditValue(gridData[role][week][1].name); }} onEditChange={(val) => setEditValue(val)} onEditBlur={() => { if (editValue.trim()) handleNameEdit(role, week, 1, editValue); setEditingCell(null); }} onDelete={() => handleDeleteVolunteer(role, week, 1)} />}
                      </TableCell>
                    ))}
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {!hasRun && <Paper sx={{ p: 4, textAlign: "center", mt: 3 }}><Box sx={{ color: "#999", fontSize: "1.1rem" }}>Click "Run Scheduler" to generate the schedule</Box></Paper>}
    </Box>
  );
};

interface VolunteerCellProps {
  volunteer: { name: string; is_fixed: boolean; index: number };
  isEditing: boolean;
  editValue: string;
  onEditClick: () => void;
  onEditChange: (value: string) => void;
  onEditBlur: () => void;
  onDelete: () => void;
}

const VolunteerCell: React.FC<VolunteerCellProps> = ({ volunteer, isEditing, editValue, onEditClick, onEditChange, onEditBlur, onDelete }) => {
  return (
    <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", backgroundColor: volunteer.is_fixed ? "rgba(255, 193, 7, 0.15)" : "transparent", padding: "6px", borderRadius: "4px", cursor: "text", transition: "background-color 0.2s", "&:hover": { backgroundColor: volunteer.is_fixed ? "rgba(255, 193, 7, 0.25)" : "rgba(0, 0, 0, 0.05)" } }}>
      {isEditing ? (
        <TextField autoFocus value={editValue} onChange={(e) => onEditChange(e.target.value)} onBlur={onEditBlur} onKeyDown={(e) => { if (e.key === "Enter") onEditBlur(); }} size="small" variant="standard" sx={{ flex: 1, "& .MuiInput-root": { fontSize: "0.95rem" } }} />
      ) : (
        <span onClick={onEditClick} style={{ flex: 1, cursor: "pointer", fontWeight: volunteer.is_fixed ? 600 : 400 }}>{volunteer.name}</span>
      )}
      <IconButton size="small" onClick={onDelete} sx={{ padding: "4px", color: "error.main" }}><DeleteIcon fontSize="small" /></IconButton>
      {volunteer.is_fixed && <Chip label="F" size="small" color="warning" sx={{ height: "20px", fontSize: "0.7rem", fontWeight: 700 }} />}
    </Box>
  );
};

export default SchedulePage;
