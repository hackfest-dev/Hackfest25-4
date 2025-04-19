import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import InvestmentCard from "./InvestmentCard";
function Investments() {
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

  useEffect( () => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/user/investments");
        if (res.status == 200) {
          setData(res.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    
    fetchData();
  }, [status]);
  
  return (
    <div>
      <div className=" bg-neutral-900 mt-8 p-10 rounded-xl">
        <div className=" ">
          <h1
            className=" text-4xl my-10 ml-10 text-white font-montserrat font-extrabold
    "
          >
            Your investments
          </h1>
          <div className=" grid grid-cols-1 gap-y-5">
            <InvestmentCard />
            <InvestmentCard />
            <InvestmentCard />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Investments;
