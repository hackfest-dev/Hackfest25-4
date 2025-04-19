import React from "react";
import { LuLogOut } from "react-icons/lu";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

const handlePay = async () => {
  try {
    const aadhar = localStorage.getItem("aadhar");
    document.cookie = `aadhar=${aadhar}`;
    const response = await fetch("http://localhost:8080/deposit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: 1000,
      }),
    });

    const { amount, id, key } = await response.json();
    console.log(amount, id.key);
    const options = {
      key: key,
      amount: amount,
      currency: "INR",
      name: "Roshan A",
      description: "Test Transaction",
      image: "https://avatars.githubusercontent.com/u/106482274?v=4",
      order_id: id,
      callback_url: "http://localhost:8080/verify-deposit",
      prefill: {
        name: "Current user",
        email: "currentuser@example.com",
        contact: "9000090000",
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#3399cc",
      },
    };
    var rzp1 = new window.Razorpay(options);
    rzp1.open();
  } catch (err) {
    console.log(err);
  }
};

function Profile() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.userData);
  return user ? (
    <div>
      <div className="mt-14 grid grid-cols-5 gap-4 p-5 bg-neutral-950 text-white pt-10 pb-52 ">
        <div className=" col-span-3  p-4 rounded-2xl bg-[#0f1838]">
          <div className="mb-4 p-4 w-full rounded-2xl  bg-blue-900">
            <h2 className=" font-semibold text-lg tracking-wide ">
              {user.name}
            </h2>
            <h4 className=" text-neutral-400">
              Lender ID: {user.adhaar_card_num}
            </h4>
          </div>
          <div className="mb-4 p-4 w-full rounded-2xl bg-blue-900">
            <h2 className=" font-semibold text-lg tracking-wide ">
              Personal Details
            </h2>
            <div className="mt-4 grid grid-cols-4 ">
              <div>
                <h6 className=" text-gray-400">Name</h6>
                <h2 className="font-semibold text-lg tracking-wide ">
                  {user.first_name}
                </h2>
              </div>
              <div>
                <h6 className=" text-gray-400">Mobile number</h6>
                <h2 className="font-semibold text-lg tracking-wide ">
                  {user.ph_num}
                </h2>
              </div>{" "}
              <div>
                <h6 className=" text-gray-400">PAN Number</h6>
                <h2 className="font-semibold text-lg tracking-wide ">
                  {user.pan_card_num}
                </h2>
              </div>
              <div>
                <h6 className=" text-gray-400">Email</h6>
                <h2 className="font-semibold text-lg tracking-wide ">
                  {user.email}
                </h2>
              </div>
            </div>
          </div>
          <div className=" p-4 w-full  rounded-2xl bg-blue-900">
            <h2 className=" my-2 font-semibold text-lg tracking-wide ">
              Bank account
            </h2>
            <h4>Account number: {user.ac_num}</h4>
            <h4>IFSC code: {user.ifsc}</h4>
          </div>
        </div>
        <div className=" col-span-2 p-4 rounded-2xl bg-[#0f1838]">
          <div className=" rounded-2xl p-4  bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-500">
            <div className=" p-1 my-4">
              <h4 className=" text-xl">Total Balance</h4>
              <h1 className=" text-5xl font-bold">₹0.00</h1>
            </div>
            <hr />
            <div className=" grid grid-cols-2 gap-2 p-2 my-4">
              <button
                className=" text-black font-semibold bg-blue-100 rounded-xl p-4"
                onClick={handlePay}
              >
                Add funds
              </button>
              <button className="  border-2 border-white  rounded-xl p-4">
                Withdraw
              </button>
            </div>
          </div>
          <div className=" my-6 ">
            <div
              className=" w-full bg-blue-300 p-4 rounded-xl text-black"
              onClick={() => navigate("/loan-request")}
            >
              Request a Loan
            </div>
          </div>
          <div className=" my-4">
            <div className="flex gap-2.5 text-left tracking-wide rounded-xl p-4 w-full text-white bg-black">
              <LuLogOut className=" mt-1.5" />
              <span> Logout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
}

export default Profile;
