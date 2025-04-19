import React, { useState } from "react";
import { useNavigate } from "react-router";

import { ToastContainer, toast, Bounce } from "react-toastify";

function OTPVerification({ isOpen = true }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const notifyOTPSent = () => {
    toast.success("OTP sent successfully!", {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
    });
  };

  const notifyOTPSuccess = () =>
    toast.success("OTP verified successfully!", {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
    });

  const notifyOTPFailure = () =>
    toast.error("OTP verification failed", {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
    });

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    if (error) {
      setError("");
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    setOtp(value);
    if (error) {
      setError("");
    }
  };

  const sendOtp = async () => {
    try {
      setLoading(true);
      fetch("http://localhost:5000/send-otp", {})
        .then((res) => {
          if (res.status !== 200) {
            setOtpSent(true);
            notifyOTPSent();
            setError("");
          }
        })
        .catch((err) => {
          notifyOTPFailure();
          console.log(err);
        });
    } catch (error) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      fetch("http://localhost:5000/verify", {
        method: "POST",
      })
        .then((res) => {
          if (res.body.name) {
            notifyOTPSuccess();
            setTimeout(() => navigate("/"), 1000);
          } else {
            notifyOTPFailure();
          }
        })
        .catch((err) => console.log(err));
      console.log("OTP verified successfully");
    } catch (error) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!otpSent) {
      // Validate phone number
      if (!phoneNumber) {
        setError("Phone number is required");
      } else if (!/^\d{10}$/.test(phoneNumber)) {
        setError("Please enter a valid 10-digit phone number");
      } else {
        sendOtp();
      }
    } else {
      // Validate OTP
      if (!otp) {
        setError("OTP is required");
      } else if (!/^\d{6}$/.test(otp)) {
        setError("Please enter a valid 6-digit OTP");
      } else {
        verifyOtp();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
      <div className="bg-neutral-900 rounded-lg p-8 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-white">
            {otpSent ? "Enter OTP" : "Enter Your Phone Number"}
          </h2>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {!otpSent ? (
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-white">+91</span>
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  required
                  className="w-full pl-12 px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-indigo-500"
                  placeholder="Your Phone Number"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                />
              </div>
            </div>
          ) : (
            <div>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-indigo-500"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={handleOtpChange}
                maxLength={6}
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 border border-transparent rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Processing..." : otpSent ? "Verify OTP" : "Send OTP"}
            </button>
          </div>

          {otpSent && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setError("");
                }}
                className="text-indigo-400 hover:text-indigo-300"
              >
                Change Phone Number
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default OTPVerification;
