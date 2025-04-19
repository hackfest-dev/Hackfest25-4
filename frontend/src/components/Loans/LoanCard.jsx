import React from "react";
import { useNavigate } from "react-router";
function LoanCard({ loan }) {
  const navigate = useNavigate();
  return loan ? (
    <div className=" bg-neutral-950 text-white rounded-2xl p-4">
      <div className="my-2 grid grid-cols-4">
        <h1 className=" col-span-2">User ID: {loan.asked_by}</h1>
        <h2 className=" text-gray-400">
          Installment: <span className=" text-white">Monthly</span>
        </h2>
        <span
          onClick={() => navigate(`/loan/${loan.loan_id}`)}
          className="ml-9 pl-2 size-5.5 bg-blue-500 rounded-full text-white"
        >
          {">"}
        </span>
      </div>
      <div className=" grid grid-cols-3">
        <div>
          <h4 className=" text-gray-400 ">Loan amount</h4>
          <h4>₹ {loan.amount}</h4>
        </div>
        <div>
          <h4 className=" text-gray-400 ">Tenure</h4>
          <h4>{`${loan.tenure} Month(s)`}</h4>
        </div>
        <div>
          <h4 className=" text-gray-400 ">Interest rate</h4>
          <h4>{loan.interest}%</h4>
        </div>
      </div>
    </div>
  ) : null;
}

export default LoanCard;
