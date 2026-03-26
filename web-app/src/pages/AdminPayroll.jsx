import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

/**
 * AdminPayroll.jsx
 * -----------------------
 * This component serves as the main payroll management page for admin users. It fetches payroll 
 * data from the backend API and displays it in a table format. Each payroll entry includes the 
 * employee's name, base pay, total pay, and an action button to adjust the payroll. The adjust button 
 * links to the AdminPayrollAdjustment page where admins can make adjustments to the payroll entries.
 * The component uses React's useEffect hook to fetch payroll data when the component mounts and useState 
 * to manage the payroll data state. It also utilizes Tailwind CSS for styling the table and layout.
 */

// Define the AdminPayroll component that renders the payroll management page for admin users.
export default function AdminPayroll() {
  const [payrolls, setPayrolls] = useState([]);

  useEffect(() => {
    fetchPayrolls();
  }, []);

  // Fetches the payroll data from the backend API and updates the component state.
  const fetchPayrolls = async () => {
    const res = await api.get("/payroll");
    setPayrolls(res.data);
  };

  // Render the payroll table with the fetched data and provide links to adjust each payroll entry.
  return (
    <div>

      <h2 className="text-2xl font-bold mb-6">
        Payroll Management
      </h2>

      <table className="w-full bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
        <thead className="bg-gray-700">
          <tr>
            <th className="p-3 border-b border-gray-700">Employee</th>
            <th className="p-3 border-b border-gray-700">Base Pay</th>
            <th className="p-3 border-b border-gray-700">Total Pay</th>
            <th className="p-3 border-b border-gray-700">Actions</th>
          </tr>
        </thead>

        <tbody>
          {payrolls.map((payroll) => (
            <tr key={payroll._id}>

              <td className="p-3 border-b border-gray-700">
                {payroll.user?.name}
              </td>

              <td className="p-3 border-b border-gray-700">
                ${payroll.basePay}
              </td>

              <td className="p-3 border-b border-gray-700">
                ${payroll.totalPay}
              </td>

              <td className="p-3 border-b border-gray-700">
                <Link
                  to={`/admin/payroll/${payroll._id}/adjust`}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Adjust
                </Link>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}