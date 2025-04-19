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
      fetch("http://localhost:8080/user/verify-user", {
        method: "GET",
      })
        .then((res) => {
          if (res.status === 401) {
            navigate("/verify-otp");
          }else{
            navigate("/");
          }
        })
        .catch((err) => {
          navigate("/verify-otp");
          console.log("error :",err);
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
