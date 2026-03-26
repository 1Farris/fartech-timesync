import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import Dashboard from "../pages/Dashboard";

/**
 * dashboard.test.jsx
 * -----------------------
 * This file contains a basic test case for the Dashboard component to ensure that it renders without 
 * crashing. The test uses React Testing Library to render the Dashboard component within the necessary 
 * context providers (AuthProvider and BrowserRouter) to simulate the environment in which the component 
 * operates. This serves as a sanity check to confirm that the Dashboard component can be loaded 
 * successfully, which is essential for further testing and development of the dashboard features.
 * 
 */

// Define a test suite for the Dashboard page that includes a test case to check if the component 
// renders without crashing.
describe("Dashboard Page", () => {
  test("dashboard renders", () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      </AuthProvider>
    );
  });
});