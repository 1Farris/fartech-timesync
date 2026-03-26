import React from "react";
import EarningsChart from "../components/common/EarningsChart";
import CompanyBreakdownChart from "../components/common/CompanyBreakdownChart";

/**
 * AdminAnalytics.jsx
 * -----------------------
 * This component serves as the main dashboard for admin users to view payroll analytics. 
 * It includes an earnings chart and a company breakdown chart, and also provides a button 
 * to export payroll data to Excel.
 */

// Define the AdminAnalytics component that renders the analytics dashboard for admin users.
export default function AdminAnalytics() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Admin Payroll Analytics Dashboard
        </h1>

        <button
          onClick={() =>
            window.open("/api/payroll/export/excel", "_blank")
          }
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Export Payroll to Excel
        </button>
      </div>

      {/* Monthly Earnings Chart (FULL WIDTH) */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <EarningsChart />
      </div>

      {/* Other Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CompanyBreakdownChart />
      </div>

    </div>
  );
}