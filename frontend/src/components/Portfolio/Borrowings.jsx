import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import LoanCard from "../Loans/LoanCard";
import { AiOutlineInbox } from "react-icons/ai";

function Borrowings() {
  const status = useSelector((state) => state.auth.status);
  const [data, setData] = useState([
    {
      id: 1,
      name: "Roshan",
      loanAmount: 25000,
      tenure: 9,
      interestRate: 40.5,
      status: "Ongoing",
    },
    {
      id: 2,
      name: "Roshan",
      loanAmount: 25000,
      tenure: 9,
      interestRate: 40.5,
      status: "Ongoing",
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "http://localhost:8080/borrower/web3/view-loan",
          {
            method: "POST",
            body: JSON.stringify({
              aadhar: localStorage.getItem("aadhar"),
            }),
          }
        );
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [status]);

  return (
    <div>
      <div className=" bg-neutral-900 mt-8 p-10 rounded-xl">
        <div>
          <h1
            className=" text-4xl my-10 ml-10 text-white font-montserrat font-extrabold
    "
          >
            Your Borrowings
          </h1>

          {data.length != 0 ? (
            <div className=" grid grid-cols-1 gap-y-5">
              {data.map((item) => (
                <div key={item.id} className=" grid grid-cols-1 gap-y-5">
                  <LoanCard loan={item} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-56">
              <AiOutlineInbox className="text-4xl text-gray-500" />
              <h1 className="text-2xl text-gray-500">No Borrowings</h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Borrowings;
