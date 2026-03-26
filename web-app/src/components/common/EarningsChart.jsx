import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

import api from "../../services/api";


/** * EarningsChart.jsx
 * -----------------------
 * A React component that displays a bar chart of monthly earnings. 
 * Fetches data from the backend API based on the selected year and uses Recharts to render the chart.
 */

// Define the EarningsChart component
export default function EarningsChart() {

  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [data, setData] = useState([]);

  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchMonthlyData(selectedYear);
  }, [selectedYear]);


  // Fetches the monthly earnings data from the backend API and updates the component state.
  const fetchMonthlyData = async (year) => {
    try {

      const res = await api.get(`/payroll/monthly-summary?year=${year}`);

      const formatted = res.data.map((item) => ({
        month: item.month,
        earnings: item.totalPay,
        hours: item.totalHours
      }));

      setData(formatted);

    } catch (error) {
      console.error("Error fetching monthly summary:", error);
    }
  };

  // Render the bar chart with the fetched data
  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">

      {/* Header + Year Selector */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-200">
          Monthly Earnings Overview
        </h3>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="
            bg-gray-800
            text-gray-200
            border border-gray-700
            rounded-md
            px-3 py-1
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

      </div>


      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>

          <CartesianGrid stroke="#374151" strokeDasharray="3 3" />

          <XAxis
            dataKey="month"
            stroke="#9CA3AF"
            tick={{ fill: "#9CA3AF" }}
          />

          <YAxis
            stroke="#9CA3AF"
            tick={{ fill: "#9CA3AF" }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#E5E7EB"
            }}
          />

          <Bar
            dataKey="earnings"
            fill="#3B82F6"
            radius={[6, 6, 0, 0]}
          />

        </BarChart>
      </ResponsiveContainer>

    </div>
  );
}