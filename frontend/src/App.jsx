import { useEffect, useState } from "react";
import "./App.css";

import { Outlet } from "react-router";
import Navbar from "./components/Navbar/Navbar";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { login } from "./Store/authSlice";
import { ToastContainer, toast, Bounce } from "react-toastify";

function App() {
  const authStatus = useSelector((state) => state.auth.status);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    const varifyuser = async () => {
      if (!authStatus) {
        try {
          const num = localStorage.getItem("aadhar");
          if (num == null) throw new Error("No aadhar number found");
          const res = await fetch("http://localhost:8080/user/verify-user", {
            method: "POST",
            body: JSON.stringify({ aadhar: num }),
          });

          const body = await res.json();
          dispatch(login(body));
          console.log("body", body);
          navigate("/");
        } catch (err) {
          navigate("/verify-otp");
          console.log("error :", err);
        }
      }
    };
    varifyuser();
  }, [authStatus]);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      <Navbar />
      <Outlet />
    </>
  );
}

export default App;
