import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useParams } from "react-router-dom";

/**
 * AdminPayrollAdjustment.jsx
 * -----------------------
 * This component allows admin users to adjust payroll entries for a specific employee. 
 * It fetches the payroll data for the given ID from the backend API and displays the current 
 * base pay and total pay. Admins can apply adjustments by selecting a type (bonus or penalty), 
 * entering a title, reason, and amount. The adjustment history is also displayed below the form.
 * The component uses React's useEffect hook to fetch payroll data when the component mounts and 
 * useState to manage the payroll data and form state. It also utilizes Tailwind CSS for styling the 
 * layout and form elements.
 */

// Define the AdminPayrollAdjustment component that renders the payroll adjustment page for admin users.
export default function AdminPayrollAdjustment() {
  const { id } = useParams();
  const [payroll, setPayroll] = useState(null);
  const [form, setForm] = useState({
    type: "bonus",
    title: "",
    reason: "",
    amount: ""
  });

// Fetch payroll data when the component mounts
  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    const res = await api.get(`/payroll/${id}`);
    setPayroll(res.data);
  };

// Handle form submission to apply payroll adjustments and refresh the payroll data.
  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post(`/payroll/${id}/adjustment`, form);
    fetchPayroll();
    setForm({ type: "bonus", title: "", reason: "", amount: "" });
  };

  if (!payroll) return <div>Loading...</div>;

  // Render the payroll adjustment form and adjustment history for the selected payroll entry.
  return (
    <div className="space-y-6">

      <h2 className="text-xl font-bold">
        Adjust Payroll - {payroll.user.name}
      </h2>

      <div className="bg-gray-800 border border-gray-700 p-4 rounded-xl">
        <p><strong>Base Pay:</strong> ${payroll.basePay}</p>
        <p><strong>Final Pay:</strong> ${payroll.totalPay}</p>
      </div>

   {/* Form to apply payroll adjustments and display adjustment history for the selected payroll entry.*/}
      <form onSubmit={handleSubmit} className="space-y-3">

        <select
          value={form.type}
          onChange={(e) =>
            setForm({ ...form, type: e.target.value })
          }
          className="bg-gray-900 border border-gray-700 p-2 w-full rounded text-white"
        >
          <option value="bonus">Bonus (Add)</option>
          <option value="penalty">Penalty (Subtract)</option>
        </select>

        <input
          type="text"
          placeholder="Short Title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
          className="bg-gray-900 border border-gray-700 p-2 w-full rounded text-white"
        />
{/* Textarea for entering the reason or description of the payroll adjustment, and an input field for 
      the adjustment amount. Both fields update the form state on change. */}
        <textarea
          placeholder="Reason / Description"
          value={form.reason}
          onChange={(e) =>
            setForm({ ...form, reason: e.target.value })
          }
          className="bg-gray-900 border border-gray-700 p-2 w-full rounded text-white"
        />

        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) =>
            setForm({ ...form, amount: e.target.value })
          }
          className="bg-gray-900 border border-gray-700 p-2 w-full rounded text-white"
        />
// Submit button to apply the payroll adjustment based on the form inputs.
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Apply Adjustment
        </button>
      </form>

      <div>
        <h3 className="font-semibold mt-6 mb-2">
          Adjustment History
        </h3>

        {payroll.adjustments.map((adj, index) => (
          <div
            key={index}
            className="border p-3 rounded mb-2"
          >
            <p>
              <strong>{adj.type.toUpperCase()}</strong> - {adj.title}
            </p>
            <p>{adj.reason}</p>
            <p>
              Amount: {adj.type === "bonus" ? "+" : "-"}$
              {adj.amount}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}