import React, { useState, useEffect } from "react";
import {
  Clock,
  Users,
  DollarSign,
  FileText,
  Upload,
  Check,
  X,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../contexts/useAuth";
import Navbar from "../components/common/Navbar";

export default function Dashboard() {
  const { user } = useAuth();
  const [timeEntries, setTimeEntries] = useState([]);
  const [stats, setStats] = useState({
    totalHours: 0,
    totalEarnings: 0,
    pendingApprovals: 0,
  });
  const [isClocked, setIsClocked] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [activeClockEntry, setActiveClockEntry] = useState(null);

  

  const fetchTimeEntries = async () => {
    try {
      const response = await api.get("/time-entries");
      setTimeEntries(response.data.timeEntries);
    } catch (error) {
      console.error("Error fetching time entries:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

      const endOfWeek = new Date();
      endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));

      const response = await api.get("/payments/calculate", {
        params: {
          startDate: startOfWeek.toISOString(),
          endDate: endOfWeek.toISOString(),
        },
      });

      setStats({
        totalHours: response.data.breakdown.totalHours,
        totalEarnings: response.data.breakdown.totalPay,
        pendingApprovals: timeEntries.filter((e) => e.status === "pending")
          .length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleClockIn = async () => {
    try {
      const response = await api.post("/time-entries/clock-in", {
        taskType: "AI Training",
      });
      setIsClocked(true);
      setActiveClockEntry(response.data.timeEntry);
    } catch (error) {
      console.error("Error clocking in:", error);
      alert("Failed to clock in");
    }
  };

  const handleClockOut = async () => {
    try {
      await api.post("/time-entries/clock-out", {
        timeEntryId: activeClockEntry._id,
      });
      setIsClocked(false);
      setActiveClockEntry(null);
      fetchTimeEntries();
      fetchStats();
    } catch (error) {
      console.error("Error clocking out:", error);
      alert("Failed to clock out");
    }
  };

  useEffect(() => {
    async function fetchData() {
      await fetchTimeEntries();
      fetchStats();
    }
    fetchData();
  }, []);
  
  useEffect(() => {
    let interval;
    if (isClocked) {
      interval = setInterval(() => {
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isClocked]);

  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hours This Week</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalHours}
                </p>
              </div>
              <Clock className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-800">
                  ${stats.totalEarnings}
                </p>
              </div>
              <DollarSign className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.pendingApprovals}
                </p>
              </div>
              <FileText className="text-orange-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trial Days Left</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.max(
                    0,
                    Math.ceil(
                      (new Date(user.subscription.trialEndsAt) - new Date()) /
                        (1000 * 60 * 60 * 24),
                    ),
                  )}
                </p>
              </div>
              <Clock className="text-purple-500" size={32} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={isClocked ? handleClockOut : handleClockIn}
              className={`p-4 rounded-lg border-2 ${isClocked ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"} hover:shadow-md transition`}
            >
              <Clock
                className={isClocked ? "text-red-500" : "text-green-500"}
                size={24}
              />
              <p className="font-semibold mt-2">
                {isClocked ? "Clock Out" : "Clock In"}
              </p>
              {isClocked && (
                <p className="text-sm text-gray-600">{currentTime}</p>
              )}
            </button>

            <button className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50 hover:shadow-md transition">
              <Upload className="text-blue-500" size={24} />
              <p className="font-semibold mt-2">Upload Proof</p>
            </button>
          </div>
        </div>

        {/* Recent Time Entries */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Time Entries</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Task
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hours
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Proof
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {timeEntries.slice(0, 10).map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">{entry.taskType}</td>
                    <td className="px-4 py-3 text-sm">
                      {entry.hours}h {entry.minutes}m
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          entry.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : entry.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {entry.proofUrl ? (
                        <Check className="text-green-500" size={18} />
                      ) : (
                        <X className="text-red-500" size={18} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
