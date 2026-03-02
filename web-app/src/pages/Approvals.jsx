import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Approvals() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await api.get("/time-entries/pending");
      setEntries(res.data.timeEntries || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const approveEntry = async (id) => {
    try {
      await api.patch(`/time-entries/${id}/approve`);
      fetchEntries();
    } catch (error) {
      console.error(error);
    }
  };

  const rejectEntry = async (id) => {
    const reason = prompt("Enter rejection reason (optional):");

    try {
      await api.patch(`/time-entries/${id}/reject`, {
        reason,
      });

      fetchEntries();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        Pending Weekly Time Entries
      </h2>

      {loading && <p>Loading...</p>}

      {!loading && entries.length === 0 && (
        <p>No pending entries.</p>
      )}

      {entries.map((entry) => (
        <div
          key={entry._id}
          className="border p-5 rounded-lg mb-4 shadow-sm bg-white"
        >
          <div className="mb-3">
            <p className="font-semibold text-lg">
              {entry.userId.firstName} {entry.userId.lastName}
            </p>
            <p className="text-sm text-gray-600">
              {entry.userId.email}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <p>
              <strong>Week Start:</strong>{" "}
              {new Date(entry.weekStart).toLocaleDateString("en-GB")}
            </p>
            <p>
              <strong>Week End:</strong>{" "}
              {new Date(entry.weekEnd).toLocaleDateString("en-GB")}
            </p>
            <p>
              <strong>Company:</strong> {entry.companyType}
            </p>
            <p>
              <strong>Total Hours:</strong> {entry.totalHours} hrs
            </p>
          </div>

          {entry.dailyHours && (
            <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
              <p className="font-semibold mb-2">
                Daily Breakdown:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(entry.dailyHours).map(
                  ([day, hours]) => (
                    <p key={day}>
                      {day}: {hours} hrs
                    </p>
                  )
                )}
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => approveEntry(entry._id)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Approve
            </button>

            <button
              onClick={() => rejectEntry(entry._id)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}