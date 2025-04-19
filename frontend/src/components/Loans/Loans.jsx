import React, { useEffect, useState } from "react";
import LoanCard from "./LoanCard";
import { useSelector } from "react-redux";

function Loans() {
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
        const res = await fetch("http://localhost:8080/lender/all-loan", {
          method: "post",
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
    <div className=" p-10 h-screen bg-neutral-900">
      <div className="my-5 p-4 rounded-xl bg-black ">
        <h1
          className=" text-4xl my-10 ml-10 text-white font-montserrat font-extrabold
        "
        >
          Live Loans
        </h1>
        {data.length != 0 ? (
          <div className=" grid grid-cols-1 gap-y-5 ">
            {data.map((item) => (
              <div
                key={Math.random() * 10}
                className=" grid grid-cols-1 gap-y-5"
              >
                <LoanCard loan={item} />
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

export default Loans;
