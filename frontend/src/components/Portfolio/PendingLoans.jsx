import React, { useEffect, useState } from "react";
import PendingLoanCard from "./PendingLoanCard";
import { AiOutlineInbox } from "react-icons/ai";
import { useSelector } from "react-redux";

function PendingLoans() {
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
  ]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const aadhar = localStorage.getItem("aadhar");
        const res = await fetch("http://localhost:8080/borrower/view-loan", {
          method: "POST",
          body: JSON.stringify({
            aadhar,
          }),
        });
        const body = await res.json();
        setData(body);
        console.log(body);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [status]);

  return (
    <div>
      <div className="mt-10 p-10 bg-neutral-900 rounded-xl">
        <h1 className="text-4xl my-10 ml-10 text-white font-montserrat font-extrabold">
          Loan Requests
        </h1>

        {data.length != 0 ? (
          <div className=" grid grid-cols-1 gap-y-5">
            {data.map((item) => (
              <div key={item.id} className=" grid grid-cols-1 gap-y-5">
                <PendingLoanCard loan={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-56">
            <AiOutlineInbox className="text-4xl text-gray-500" />
            <h1 className="text-2xl text-gray-500">No Requested Loans</h1>
          </div>
        )}
      </div>
    </div>
  );
}

export default PendingLoans;
