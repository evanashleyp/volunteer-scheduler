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

export interface DropdownOption {
  value: string | number;
  label: string;
}

export interface Column {
  key: string;
  label: string;
  type?: "text" | "number" | "checkbox" | "select" | "combobox";
  width?: string;
  options?: DropdownOption[];
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
      // For text/number/select/combobox, open edit mode
      setEditingCell({ rowIndex, key: columnKey });
      setEditValue(value);
    }
  };

  const handleCellChange = (newValue: any) => {
    setEditValue(newValue);
  };
  // Centralized commit helper used by blur, Enter, and select onChange
  const commitEdit = (value?: any) => {
    if (!editingCell) return false;
    const newData = [...data];
    const column = columns.find((c) => c.key === editingCell.key);

    // Use passed value if provided, otherwise current editValue
    let finalValue = value !== undefined ? value : editValue;
    // Type conversion based on column type
    if (column?.type === "number") {
      finalValue = finalValue === "" ? 0 : parseInt(finalValue, 10);
      // Validate bonus column (0-50 range)
      if (column.key === "bonus") {
        finalValue = Math.max(0, Math.min(50, finalValue));
      }
    } else if (column?.type === "checkbox") {
      finalValue = finalValue ? 1 : 0;
    }

    newData[editingCell.rowIndex] = {
      ...newData[editingCell.rowIndex],
      [editingCell.key]: finalValue,
    };
    onDataChange(newData);
    // exit edit mode
    setEditingCell(null);
    setEditValue("");
    return true;
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

  const renderSelectCell = (col: Column) => (
    <select
      autoFocus
      value={editValue}
      onChange={(e) => {
        const v = e.target.value;
        handleCellChange(v);
        // commit immediately when a selection is made so keyboard selection works
        // pass v to avoid relying on state update timing
        commitEdit(v);
      }}
      onBlur={() => commitEdit()}
      style={{
        width: "100%",
        padding: "4px",
        fontSize: "14px",
        border: "1px solid #ccc",
        borderRadius: "4px",
      }}
    >
      <option value="">-- Select --</option>
      {col.options?.map((opt) => (
        <option key={opt.value} value={String(opt.value)}>
          {opt.label}
        </option>
      ))}
    </select>
  );

  const renderComboboxCell = (col: Column, rowIndex: number) => (
    <>
      <input
        autoFocus
        type="text"
        list={`datalist-${col.key}-${rowIndex}`}
        value={editValue}
        onChange={(e) => handleCellChange(e.target.value)}
        onBlur={() => commitEdit()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            commitEdit();
          } else if (e.key === "Escape") {
            setEditingCell(null);
            setEditValue("");
          }
        }}
        onFocus={(e) => {
          e.currentTarget.select();
        }}
        style={{
          width: "100%",
          padding: "4px",
          fontSize: "14px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      <datalist id={`datalist-${col.key}-${rowIndex}`}>
        {col.options?.map((opt) => (
          <option key={opt.value} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </datalist>
    </>
  );

  const renderEditingCell = (col: Column, rowIndex: number) => {
    if (col.type === "select") {
      return renderSelectCell(col);
    }
    if (col.type === "combobox") {
      return renderComboboxCell(col, rowIndex);
    }
    return (
      <TextField
        autoFocus
        type={col.type === "number" ? "number" : "text"}
        value={editValue}
        onChange={(e) => handleCellChange(e.target.value)}
        onBlur={() => commitEdit()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            commitEdit();
          } else if (e.key === "Escape") {
            setEditingCell(null);
            setEditValue("");
          }
        }}
        size="small"
        variant="standard"
        sx={{ width: "100%" }}
        inputProps={col.key === "bonus" ? { min: 0, max: 50 } : {}}
      />
    );
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
                    editingCell?.key === col.key && col.type !== "checkbox"
                      ? renderEditingCell(col, rowIndex)
                      : col.type === "checkbox"
                      ? (
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
                      )
                      : (
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
