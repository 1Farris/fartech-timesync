import React, { useState, useEffect } from "react";
import {
  Clock,
  DollarSign,
  FileText,
  Upload,
  Check,
  X,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/useAuth";
import EarningsChart from "../components/common/EarningsChart";

/**
 * Dashboard Page
 * ----------------
 * Main landing page after user login.
 *
 * Displays:
 * - User summary
 * - Analytics charts
 * - Recent activity
 *
 * Access to dashboard features depends on user role
 * (Admin, Manager, Employee).
 */


// Define the Dashboard component that renders the main dashboard page for authenticated users.
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role?.toLowerCase().replace("-", "_");

  const [timeEntries, setTimeEntries] = useState([]);
  const [stats, setStats] = useState({
    totalHours: 0,
    totalEarnings: 0,
    pendingApprovals: 0,
  });

  /* ================= FETCH DATA ================= */

  const fetchTimeEntries = async () => {
  try {
    const response = await api.get("/time-entries"); // get all
    setTimeEntries(response.data.timeEntries || []);
  } catch (error) {
    console.error("Error fetching time entries:", error);
  }
};

  const fetchStats = () => {
  try {
    // Only approved entries
    const approvedEntries = timeEntries.filter(
      (entry) => entry.status === "approved"
    );

    // TOTAL APPROVED HOURS (ALL TIME)
    const totalApprovedHours = approvedEntries.reduce(
      (sum, entry) => sum + entry.totalHours,
      0
    );

    // TOTAL EARNINGS (ALL APPROVED HOURS)
    const payRate = user?.payRate || 0;
    const totalEarnings = totalApprovedHours * payRate;

    // Pending count
    const pendingCount = timeEntries.filter(
      (e) => e.status === "pending"
    ).length;

    setStats({
      totalHours: totalApprovedHours,
      totalEarnings,
      pendingApprovals: pendingCount,
    });

  } catch (error) {
    console.error("Error calculating stats:", error);
  }
};

  useEffect(() => {
    fetchTimeEntries();
  }, []);

  useEffect(() => {
  if (timeEntries.length > 0) {
    fetchStats();
  }
}, [timeEntries]);

  /* ================= APPROVAL and REJECTION HANDLER ================= */

 const updateStatus = async (id, status) => {
  try {
    if (status === "approved") {
      await api.patch(`/time-entries/${id}/approve`);
    } else if (status === "rejected") {
      const reason = prompt("Enter rejection reason (optional):");
      await api.patch(`/time-entries/${id}/reject`, { reason });
    }

    fetchTimeEntries();
  } catch (error) {
    console.error("Error updating status:", error);
  }
};

  /* ================= PDF DOWNLOAD ================= */

  const downloadPDF = async () => {
  try {
    const startDate = prompt("Enter start date (YYYY-MM-DD)");
    const endDate = prompt("Enter end date (YYYY-MM-DD)");

    if (!startDate || !endDate) {
      alert("Date range required");
      return;
    }

    const response = await api.get("/payments/pdf", {
      params: { startDate, endDate },
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: "application/pdf",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payslip-${startDate}-${endDate}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();

  } catch (error) {
    console.error("PDF Download Error:", error);
    alert("Failed to download PDF");
  }
};

  /* ================= TRIAL CALC ================= */

  const trialDaysLeft = user?.subscription?.trialEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(user.subscription.trialEndsAt) - new Date()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <StatCard
            title="Total Approved Hours So Far"
            value={stats.totalHours}
            icon={<Clock className="text-blue-500" size={32} />}
            border="border-blue-500"
          />

          <StatCard
            title="Total Earnings"
            value={`$${stats.totalEarnings}`}
            icon={<DollarSign className="text-green-500" size={32} />}
            border="border-green-500"
          />

          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={<FileText className="text-orange-500" size={32} />}
            border="border-orange-500"
          />

          <StatCard
            title="Trial Days Left"
            value={trialDaysLeft}
            icon={<Clock className="text-purple-500" size={32} />}
            border="border-purple-500"
            onClick={() => navigate("/subscription")}
          />  

        </div>

              {/* ================= EARNINGS CHART ================= */}
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-200">
          Monthly Earnings Overview
        </h3>

        <div className="bg-gray-900 rounded-lg p-4">
          <EarningsChart />
        </div>
      </div>
        

        {/* ================= QUICK ACTIONS ================= */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6 transition hover:shadow-2xl">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Worker Actions */}
            {role === "worker" && (
              <>
                <ActionButton
                  icon={<Clock size={24} />}
                  label="Time Entry"
                  onClick={() => navigate("/time-entry")}
                />

                <ActionButton
                  icon={<Download size={24} />}
                  label="Download Payment PDF"
                  onClick={downloadPDF}
                />
              </>
            )}

            {/* Team Leader */}
            {role === "team_leader" && (
              <ActionButton
                icon={<FileText size={24} />}
                label="Approve Time Entries"
                onClick={() => navigate("/approvals")}
              />
            )}

            {/* Admin */}
            {role === "admin" && (
              <>
                <ActionButton
                  icon={<Download size={24} />}
                  label="Generate Payment Report"
                  onClick={downloadPDF}
                />
                <ActionButton
                  icon={<FileText size={24} />}
                  label="Manage Teams"
                  onClick={() => navigate("/manage-teams")}
                />
              </>
            )}

          </div>
        </div>
        

        {/* ================= RECENT ENTRIES ================= */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Recent Time Entries</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <TableHead label="Week Range" />
                  <TableHead label="Company" />
                  <TableHead label="Total Hours" />
                  <TableHead label="Status" />
                  <TableHead label="Proof" />
                  {(role === "team_leader" || role === "admin") && (
                    <TableHead label="Actions" />
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-700">
                {timeEntries.slice(0, 10).map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-750 transition duration-200">

                    {/* Week Rang */}
                   
                    <td className="px-4 py-3 text-sm">
                      {entry.weekStart && entry.weekEnd ? (
                        <>
                          {new Date(entry.weekStart).toLocaleDateString("en-GB")} -{" "}
                          {new Date(entry.weekEnd).toLocaleDateString("en-GB")}
                        </>
                      ) : (
                          "—"
                        )}
                    </td>

                    
                    {/* Company Type */}
                    <td className="px-4 py-3 text-sm">
                      {entry.companyType}
                    </td>

                    {/* Total Hours */}
                    <td className="px-4 py-3 text-sm">
                      {entry.totalHours} hrs
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={entry.status} />
                    </td>

                               
                    {/* Proof */}
                    <td className="px-4 py-3">
                      {entry.proofUrl ? (
                        <a
                          href={entry.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Check className="text-green-500" size={18} />
                        </a>
                      ) : (
                        <X className="text-red-500" size={18} />
                      )}
                    </td>

                    {/* Approve/Reject Buttons */}

                    {(role === "team_leader" || role === "admin") && 
                    entry.status === "pending" && (
                      <td className="px-4 py-3 space-x-3">
                        <button
                          onClick={() => updateStatus(entry._id, "approved")}
                          className="text-green-600 text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(entry._id, "rejected")}
                          className="text-red-600 text-sm"
                        >
                          Reject
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    
  );
}

/* ================= SMALL COMPONENTS ================= */

function StatCard({ title, value, icon, border, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 ${border} 
      cursor-pointer transition-all duration-300 
      hover:scale-105 hover:shadow-2xl`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
      p-4 rounded-xl 
      border border-gray-700
      bg-gray-900
      hover:bg-gray-700
      hover:scale-105
      hover:shadow-xl
      transition-all duration-300
      flex flex-col items-center"
    >
      {icon}
      <p className="font-semibold mt-2">{label}</p>
    </button>
  );
}

function TableHead({ label }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
      {label}
    </th>
  );
}

function StatusBadge({ status }) {
  const styles =
    status === "approved"
      ? "bg-green-500/20 text-green-400"
      : status === "rejected"
      ? "bg-red-500/20 text-red-400"
      : "bg-yellow-500/20 text-yellow-400";

  return (
    <span className={`px-3 py-1 text-xs rounded-full font-medium ${styles}`}>
      {status}
    </span>
  );
}
