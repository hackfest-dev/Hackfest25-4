import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router";

import { Provider } from "react-redux";
import store from "./Store/store.js";

import App from "./App.jsx";
import Home from "./components/Home/Home.jsx";
import Loans from "./components/Loans/Loans.jsx";
import Portfolio from "./components/Portfolio/Portfolio.jsx";
import Profile from "./components/Profile/Profile.jsx";
import Signup from "./components/Auth/Signup.jsx";
import OTPVerification from "./components/Auth/OTPVerification.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/live-loans",
        element: <Loans />,
      },
      {
        path: "/portfolio",
        element: <Portfolio />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/register",
        element: <Signup />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/verify-otp",
        element: <OTPVerification />,
      },
    ],
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
