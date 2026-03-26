import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import api from "../../services/api";

/**
 * CompanyBreakdownChart.jsx
 * -----------------------
 * A React component that displays a pie chart breakdown of payroll by company. 
 * Fetches data from the backend API and uses Recharts to render the chart.
 */

// Define the CompanyBreakdownChart component
export default function CompanyBreakdownChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchBreakdown();
  }, []);
// Fetches the company breakdown data from the backend API and updates the component state.
  const fetchBreakdown = async () => {
    try {
      const res = await api.get("/payroll/stats/company-breakdown");
      setData(res.data);
    } catch (error) {
      console.error("Error fetching company breakdown:", error);
    }
  };

  // Render the pie chart with the fetched data
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">
        Company Payroll Breakdown
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="totalPaid"
            nameKey="company"
            outerRadius={100}
            label
          >
            {data.map((entry, index) => (
              <Cell key={index} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}