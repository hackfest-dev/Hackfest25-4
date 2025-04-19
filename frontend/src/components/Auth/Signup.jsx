import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../../Store/authSlice";

import { ToastContainer, toast, Bounce } from "react-toastify";
function Login() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    aadharNumber: "",
    pan: "",
    accountNumber: "",
    ifsc: "",
    bankName: "",
  });

  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Name validation
    if (!formData.name) {
      newErrors.name = "Name is required";
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    // Address validation
    if (!formData.address) {
      newErrors.address = "Address is required";
    }

    // City validation
    if (!formData.city) {
      newErrors.city = "City is required";
    }

    // State validation
    if (!formData.state) {
      newErrors.state = "State is required";
    }

    if (!formData.pincode) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Please enter a valid 6-digit pincode";
    }

    if (!formData.aadharNumber) {
      newErrors.aadharNumber = "Aadhar number is required";
    } else if (!/^\d{12}$/.test(formData.aadharNumber)) {
      newErrors.aadharNumber = "Please enter a valid 12-digit aadhar number";
    }

    // PAN validation
    if (!formData.pan) {
      newErrors.pan = "PAN number is required";
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
      newErrors.pan = "Please enter a valid PAN number";
    }

    // Account number validation
    if (!formData.accountNumber) {
      newErrors.accountNumber = "Account number is required";
    } else if (!/^\d{9,18}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = "Please enter a valid account number";
    }

    // IFSC validation
    if (!formData.ifsc) {
      newErrors.ifsc = "IFSC code is required";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc)) {
      newErrors.ifsc = "Please enter a valid IFSC code";
    }

    // Bank name validation
    if (!formData.bankName) {
      newErrors.bankName = "Bank name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await fetch("http://localhost:8080/user/create", {
          method: "POST",
          body: JSON.stringify(formData),
        });

        toast.success("Form submitted");
      } catch (err) {
        toast.error("Error submitting form");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-indigo-500"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-indigo-500"
                placeholder="Enter name as per PAN card"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
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
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
            <div>
              <input
                id="address"
                name="address"
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-indigo-500"
                placeholder="Your Address"
                value={formData.address}
                onChange={handleChange}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>
            <div>
              <input
                id="city"
                name="city"
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-indigo-500"
                placeholder="Your City"
                value={formData.city}
                onChange={handleChange}
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
              )}
            </div>
            <div>
              <input
                id="state"
                name="state"
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-indigo-500"
                placeholder="Your State"
                value={formData.state}
                onChange={handleChange}
              />
              {errors.state && (
                <p className="text-red-500 text-sm mt-1">{errors.state}</p>
              )}
            </div>
            <div>
              <input
                id="pincode"
                name="pincode"
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-indigo-500"
                placeholder="Your Pincode"
                value={formData.pincode}
                onChange={handleChange}
              />
              {errors.pincode && (
                <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
              )}
            </div>
            <div>
              <input
                id="aadharNumber"
                name="aadharNumber"
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-indigo-500"
                placeholder="Your Aadhar Number"
                value={formData.aadharNumber}
                onChange={handleChange}
              />
              {errors.aadharNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.aadharNumber}
                </p>
              )}
            </div>

            <div>
              <input
                id="pan"
                name="pan"
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-indigo-500"
                placeholder="Your PAN Number"
                value={formData.pan}
                onChange={handleChange}
              />
              {errors.pan && (
                <p className="text-red-500 text-sm mt-1">{errors.pan}</p>
              )}
            </div>
            <div>
              <input
                id="accountNumber"
                name="accountNumber"
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-indigo-500"
                placeholder="Your Account Number"
                value={formData.accountNumber}
                onChange={handleChange}
              />
              {errors.accountNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.accountNumber}
                </p>
              )}
            </div>
            <div>
              <input
                id="ifsc"
                name="ifsc"
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-indigo-500"
                placeholder="Your IFSC Code"
                value={formData.ifsc}
                onChange={handleChange}
              />
              {errors.ifsc && (
                <p className="text-red-500 text-sm mt-1">{errors.ifsc}</p>
              )}
            </div>
            <div>
              <input
                id="bankName"
                name="bankName"
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-indigo-500"
                placeholder="Your Bank Name"
                value={formData.bankName}
                onChange={handleChange}
              />
              {errors.bankName && (
                <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-white"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
