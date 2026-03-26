import React, { useEffect, useState } from "react";
import api from "../services/api";

/**
 * Approvals.jsx
 * -----------------------
 * This component displays a list of pending weekly time entries that require approval. It fetches 
 * the pending entries from the backend API and allows managers to approve or reject each entry. 
 * The component uses React's useEffect hook to fetch data when the component mounts and useState to 
 * manage the entries and loading state. Tailwind CSS is used for styling the layout and buttons.
 * Each entry displays the employee's name, email, week start and end dates, company type, total hours, 
 * and a daily breakdown of hours if available. Managers can click the "Approve" button to approve an 
 * entry or the "Reject" button to reject it with an optional reason.
 */


// Define the Approvals component that renders the pending time entries for approval.
export default function Approvals() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetches the pending time entries from the backend API and updates the component state.
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

  // Handles the approval of a time entry by sending a PATCH request to the backend API and 
  // refreshing the entries list.
  const approveEntry = async (id) => {
    try {
      await api.patch(`/time-entries/${id}/approve`);
      fetchEntries();
    } catch (error) {
      console.error(error);
    }
  };

  // Handles the rejection of a time entry by sending a PATCH request to the backend API with an 
  // optional reason and refreshing the entries list.
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

  // Render the list of pending time entries with approval and rejection buttons for each entry.
  return (
    <div className="space-y-6">
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
          className="bg-gray-800 border border-gray-700 p-5 rounded-xl mb-4"
        >
          <div className="mb-3">
            <p className="font-semibold text-lg">
              {entry.userId.firstName} {entry.userId.lastName}
            </p>
            <p className="text-sm text-gray-400">
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
            <div className="mt-3 bg-gray-900 p-3 rounded text-sm">
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