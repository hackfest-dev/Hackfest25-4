import { useEffect, useState } from "react";
import "./App.css";

import { Outlet } from "react-router";
import Navbar from "./components/Navbar/Navbar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
function App() {
  const authStatus = useSelector((state) => state.auth.status);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authStatus) {
      fetch("http://localhost:5000/verify", {
        method: "GET",
      })
        .then((res) => {
          if (res == null) {
            navigate("/verify-otp");
          } else {
            navigate("/");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [authStatus]);

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default App;
