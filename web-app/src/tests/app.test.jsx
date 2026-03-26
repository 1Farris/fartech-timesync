import { render } from "@testing-library/react";
import App from "../App";
/**
 * app.test.jsx
 * -----------------------
 * This file contains a basic test case for the App component to ensure that it renders without crashing. 
 * The test uses React Testing Library to render the App component and checks for any errors during 
 * the rendering process. This serves as a sanity check to confirm that the main application component 
 * can be loaded successfully, which is essential for further testing and development of the application.
 * 
 */

// Define a test suite for the App component that includes a test case to check if the component renders 
// without crashing.
describe("App Component", () => {

  test("renders application without crashing", () => {

    render(<App />);

  });

});