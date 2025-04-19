import React, { useState } from "react";
import { toast } from "react-toastify";
function LoanRequest() {
  const [formData, setFormData] = useState({
    amount: "",
    months: "1",
    interestRate: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Amount validation
    if (!formData.amount) {
      newErrors.amount = "Amount is required";
    } else if (
      formData.amount >= 5000 &&
      formData.amount <= 100000 &&
      isNaN(formData.amount)
    ) {
      newErrors.amount = "Please enter a valid amount";
    }

    // Interest rate validation
    if (!formData.interestRate) {
      newErrors.interestRate = "Interest rate is required";
    } else if (
      isNaN(formData.interestRate) ||
      formData.interestRate < 12 ||
      formData.interestRate > 40
    ) {
      newErrors.interestRate = "Interest rate must be between 12% and 40%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const aadhar = localStorage.getItem("aadhar");
        await fetch("http://localhost:8080/borrower/create-loan", {
          method: "POST",
          body: JSON.stringify({
            aadhar,
            amount: formData.amount,
            tenure: formData.tenure,
            interestRate: formData.interestRate,
          }),
        });
        console.log(formData);
        toast.success("Loan request created successfully!!");
      } catch (error) {
        console.log(error);
      }

      console.log("Form submitted with data:", formData);
      // Handle form submission here
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Loan Request
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                id="amount"
                name="amount"
                type="number"
                required
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-indigo-500"
                placeholder="Enter Amount"
                value={formData.amount}
                onChange={handleChange}
                min="5000"
                max="100000"
                step="0.01"
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <select
                id="months"
                name="months"
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-indigo-500"
                value={formData.months}
                onChange={handleChange}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? "Month" : "Months"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="relative">
                <input
                  id="interestRate"
                  name="interestRate"
                  type="number"
                  required
                  className="w-full pl-12 px-4 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-indigo-500"
                  placeholder="Interest Rate"
                  value={formData.interestRate}
                  onChange={handleChange}
                  min="12"
                  max="40"
                  step="0.01"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-white">%</span>
                </div>
              </div>
              {errors.interestRate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.interestRate}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Request Loan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoanRequest;
