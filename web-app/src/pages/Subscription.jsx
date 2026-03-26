import React from "react";
import api from "../services/api";
import { useAuth } from "../contexts/useAuth";

/**
 * Subscription.jsx
 * -----------------------
 * This component renders the subscription page for the TimeSync application. It allows 
 * users to view their current subscription plan and upgrade to a different plan if needed. 
 * The component uses the useAuth context to access user information and provides a button to 
 * initiate the subscription process.
 */

// Define the Subscription component that renders the subscription page for users to view and 
// manage their subscription plans.
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

  // Determine if the user is currently on a trial subscription plan to conditionally render the 
  // subscription status and upgrade button.

  const isTrial =
    user?.subscription?.plan === "trial";

    // Render the subscription details and upgrade options for the user, showing the current plan 
    // and a button to upgrade if they are on a trial plan.
  return (
    <div className="flex justify-center items-center">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Subscription Plans
        </h2>

        <div className="border rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold">Pro Plan</h3>
          <p className="text-gray-200 mt-2">
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