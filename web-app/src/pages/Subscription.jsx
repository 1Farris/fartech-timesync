import React from "react";
import api from "../services/api";
import { useAuth } from "../contexts/useAuth";

export default function Subscription() {
  const { user } = useAuth();

  const subscribe = async () => {
    try {
      const res = await api.post("/payments/create-checkout-session");

      window.location.href = res.data.url; // redirect to Stripe
    } catch (error) {
      console.error(error);
      alert("Failed to start subscription");
    }
  };

  const isTrial =
    user?.subscription?.plan === "trial";

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Subscription Plans
        </h2>

        <div className="border rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold">Pro Plan</h3>
          <p className="text-gray-600 mt-2">
            ✔ Unlimited teams  
            ✔ Team management  
            ✔ Payment reports  
            ✔ Priority support
          </p>

          <p className="text-2xl font-bold mt-4">$29/month</p>

          {isTrial ? (
            <button
              onClick={subscribe}
              className="mt-6 bg-blue-600 text-white w-full py-3 rounded-lg"
            >
              Upgrade Now
            </button>
          ) : (
            <p className="mt-6 text-green-600 font-semibold">
              You are subscribed
            </p>
          )}
        </div>
      </div>
    </div>
  );
}