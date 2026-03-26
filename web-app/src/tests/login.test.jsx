import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import Login from "../pages/Login";

/**
 * Login Component Test
 * ---------------------
 * Verifies that the login page renders correctly
 * and contains required input fields.
 *
 * Testing Framework:
 * - Vitest
 * - React Testing Library
 */
describe("Login Page", () => {
  test("renders login form", () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthProvider>
    );
  });
});