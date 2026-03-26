import { Outlet } from "react-router-dom";
import Navbar from "../common/Navbar";
/**
 * MainLayout.jsx
 * -----------------------  
 * The main layout component that wraps around all protected routes. It includes the Navbar and 
 * defines the overall page structure.
 * This component is used in App.jsx to wrap around all routes that require authentication, 
 * ensuring a consistent layout across the app.
 * The Outlet component from react-router-dom is used to render the matched child route components 
 * within this layout.
 * The Navbar component appears across all authenticated pages, providing navigation and user info.
 * The main content area is styled with Tailwind CSS to ensure a responsive and visually appealing 
 * design.
 */

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}