import axios from "axios";
import type { TableData, ScheduleResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const schedulerApi = {
  /**
   * Run the scheduler with the provided data
   */
  async schedule(data: TableData, numWeeks: number = 4): Promise<ScheduleResponse> {
    const response = await apiClient.post<ScheduleResponse>("/api/schedule", {
      volunteers: data.volunteers,
      availability: data.availability,
      fixed_assignments: data.fixed_assignments,
      special_rules: data.special_rules,
      weeks: numWeeks,
    });
    return response.data;
  },

  /**
   * Save data to CSV files on the server
   */
  async saveData(data: TableData): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>("/api/save-data", {
      volunteers: data.volunteers,
      availability: data.availability,
      fixed_assignments: data.fixed_assignments,
      special_rules: data.special_rules,
    });
    return response.data;
  },

  /**
   * Get current data (volunteers, availability, etc.)
   * Optional - for pre-loading existing data
   */
  async getData(): Promise<TableData> {
    const response = await apiClient.get<TableData>("/api/data");
    return response.data;
  },
};

export default apiClient;
