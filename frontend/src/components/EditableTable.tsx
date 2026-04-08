import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Box,
  Button,
  Switch,
} from "@mui/material";

export interface Column {
  key: string;
  label: string;
  type?: "text" | "number" | "checkbox";
  width?: string;
}

export interface EditableTableProps {
  columns: Column[];
  data: Record<string, any>[];
  onDataChange: (newData: Record<string, any>[]) => void;
  title?: string;
}

import type React from "react";

const EditableTable: React.FC<EditableTableProps> = ({
  columns,
  data,
  onDataChange,
  title,
}) => {
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    key: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<any>("");

  const handleCellClick = (rowIndex: number, columnKey: string, value: any, columnType?: string) => {
    // For checkboxes, toggle immediately instead of opening edit mode
    if (columnType === "checkbox") {
      const newData = [...data];
      newData[rowIndex] = {
        ...newData[rowIndex],
        [columnKey]: value ? 0 : 1,
      };
      onDataChange(newData);
    } else {
      // For text/number, open edit mode
      setEditingCell({ rowIndex, key: columnKey });
      setEditValue(value);
    }
  };

  const handleCellChange = (newValue: any) => {
    setEditValue(newValue);
  };

  const handleCellBlur = () => {
    if (editingCell) {
      const newData = [...data];
      const column = columns.find((c) => c.key === editingCell.key);

      // Type conversion based on column type
      let finalValue = editValue;
      if (column?.type === "number") {
        finalValue = editValue === "" ? 0 : parseInt(editValue, 10);
        // Validate bonus column (0-50 range)
        if (column.key === "bonus") {
          finalValue = Math.max(0, Math.min(50, finalValue));
        }
      } else if (column?.type === "checkbox") {
        finalValue = editValue ? 1 : 0;
      }

      newData[editingCell.rowIndex] = {
        ...newData[editingCell.rowIndex],
        [editingCell.key]: finalValue,
      };
      onDataChange(newData);
    }
    setEditingCell(null);
  };

  const handleAddRow = () => {
    const newRow: Record<string, any> = {};
    columns.forEach((col) => {
      if (col.type === "number") {
        newRow[col.key] = 0;
      } else if (col.type === "checkbox") {
        // Set availability columns (week1, week2, etc.) to 1 by default
        if (col.key.startsWith("week")) {
          newRow[col.key] = 1;
        } else {
          newRow[col.key] = 0;
        }
      } else {
        newRow[col.key] = "";
      }
    });
    onDataChange([...data, newRow]);
  };

  const handleDeleteRow = (rowIndex: number) => {
    onDataChange(data.filter((_, idx) => idx !== rowIndex));
  };

  return (
    <Box sx={{ width: "100%" }}>
      {title && (
        <Box sx={{ mb: 2 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
        </Box>
      )}
      <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: "auto" }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "50px" }} />
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  sx={{ width: col.width || "auto", fontWeight: 600 }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex} hover>
                <TableCell sx={{ width: "50px" }}>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteRow(rowIndex)}
                    color="error"
                  >
                    ✕
                  </IconButton>
                </TableCell>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    onClick={() =>
                      handleCellClick(rowIndex, col.key, row[col.key], col.type)
                    }
                    sx={{
                      cursor: col.type === "checkbox" ? "pointer" : "text",
                      backgroundColor:
                        editingCell?.rowIndex === rowIndex &&
                        editingCell?.key === col.key
                          ? "rgba(144, 202, 249, 0.2)"
                          : col.type === "checkbox"
                          ? "rgba(66, 165, 245, 0.05)"
                          : "transparent",
                      "&:hover": {
                        backgroundColor:
                          col.type === "checkbox"
                            ? "rgba(66, 165, 245, 0.15)"
                            : "rgba(144, 202, 249, 0.1)",
                      },
                      transition: "background-color 0.2s",
                    }}
                  >
                    {editingCell?.rowIndex === rowIndex &&
                    editingCell?.key === col.key && col.type !== "checkbox" ? (
                      <TextField
                        autoFocus
                        type={col.type === "number" ? "number" : "text"}
                        value={editValue}
                        onChange={(e) => handleCellChange(e.target.value)}
                        onBlur={handleCellBlur}
                        size="small"
                        variant="standard"
                        sx={{ width: "100%" }}
                        inputProps={col.key === "bonus" ? { min: 0, max: 50 } : {}}
                      />
                    ) : col.type === "checkbox" ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <Switch
                          checked={Boolean(row[col.key])}
                          onChange={(e) => {
                            e.stopPropagation();
                            const newData = [...data];
                            newData[rowIndex] = {
                              ...newData[rowIndex],
                              [col.key]: e.target.checked ? 1 : 0,
                            };
                            onDataChange(newData);
                          }}
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        />
                      </Box>
                    ) : (
                      <span>{row[col.key] || "-"}</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          onClick={handleAddRow}
          color="primary"
        >
          + Add Row
        </Button>
      </Box>
    </Box>
  );
};

export default EditableTable;
