import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function TimeEntry() {
  const navigate = useNavigate();

  const [companyType, setCompanyType] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [description, setDescription] = useState("");
  const [proof, setProof] = useState(null);
  const [loading, setLoading] = useState(false);

  // RWS weekly total
  const [weeklyTotalHours, setWeeklyTotalHours] = useState("");

  // Welocalized / Telus daily hours
  const [dailyHours, setDailyHours] = useState({
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
    sunday: "",
  });

  const calculateTotal = () => {
    return Object.values(dailyHours)
      .reduce((sum, val) => sum + parseFloat(val || 0), 0)
      .toFixed(2);
  };

  const handleDailyChange = (day, value) => {
    const parsed = parseFloat(value || 0);

    if (parsed > 8) {
      alert("Maximum 8.00 hours per day allowed");
      return;
    }

    setDailyHours({ ...dailyHours, [day]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyType || !weekStart || !weekEnd) {
      alert("Please fill required fields");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("companyType", companyType);
      formData.append("weekStart", weekStart);
      formData.append("weekEnd", weekEnd);
      formData.append("description", description);

      if (companyType === "RWS") {
        formData.append("weeklyTotalHours", weeklyTotalHours);
      } else {
        formData.append("dailyHours", JSON.stringify(dailyHours));
      }

      if (proof) {
        formData.append("proof", proof);
      }

      await api.post("/time-entries", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Weekly time entry submitted successfully!");
      navigate("/dashboard");

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Weekly Time Entry
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Company Type */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Company Type *
            </label>
            <select
              value={companyType}
              onChange={(e) => setCompanyType(e.target.value)}
              className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Type</option>
              <option value="RWS">RWS (Weekly Total Only)</option>
              <option value="Welocalized">
                Welocalized (Daily Hours)
              </option>
              <option value="Telus">
                Telus (Daily Hours)
              </option>
            </select>
          </div>

          {/* Week Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Week Start *
              </label>
              <input
                type="date"
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
                className="border p-3 w-full rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Week End *
              </label>
              <input
                type="date"
                value={weekEnd}
                onChange={(e) => setWeekEnd(e.target.value)}
                className="border p-3 w-full rounded-lg"
                required
              />
            </div>
          </div>

          {/* RWS Option */}
          {companyType === "RWS" && (
            <div>
              <label className="block text-sm font-semibold mb-2">
                Total Weekly Hours (Decimal allowed)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g 42.50"
                value={weeklyTotalHours}
                onChange={(e) => setWeeklyTotalHours(e.target.value)}
                className="border p-3 w-full rounded-lg"
                required
              />
            </div>
          )}

          {/* Welocalized / Telus */}
          {(companyType === "Welocalized" ||
            companyType === "Telus") && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">
                Enter Daily Hours (Max 8.00 per day)
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {Object.keys(dailyHours).map((day) => (
                  <input
                    key={day}
                    type="number"
                    step="0.01"
                    min="0"
                    max="8"
                    placeholder={day}
                    value={dailyHours[day]}
                    onChange={(e) =>
                      handleDailyChange(day, e.target.value)
                    }
                    className="border p-2 rounded-lg"
                  />
                ))}
              </div>

              <div className="mt-4 text-right font-bold text-blue-600">
                Total Hours: {calculateTotal()} hrs
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="border p-3 w-full rounded-lg"
            />
          </div>

          {/* Upload Proof */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Upload Proof (Image/PDF)
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setProof(e.target.files[0])}
              className="w-full"
            />
            {proof && (
              <p className="text-sm text-green-600 mt-1">
                Selected: {proof.name}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white w-full py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            {loading ? "Submitting..." : "Submit Weekly Time"}
          </button>

        </form>
      </div>
    </div>
  );
}
