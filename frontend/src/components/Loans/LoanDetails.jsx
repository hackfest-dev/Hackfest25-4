import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";

import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Flex, Progress, Space, ConfigProvider } from "antd";

function LoanDetails() {
  const status = useSelector((state) => state.auth.status);
  const { id } = useParams();
  const [percent, setPercent] = useState(0);
  const [invAmt, setInvAmt] = useState(0);

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

  const updatePercent = (invAmt, reqAmt) => {
    setPercent((prevPercent) => {
      const newPercent = prevPercent + (invAmt * 100) / reqAmt;
      if (newPercent > 100) {
        return 100;
      }
      return newPercent;
    });
  };

  const handleClick = () => {
    //first param is investment amount, second is loan amount
    updatePercent(invAmt, 10000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8080/lender/loan", {
          method: "POST",
          body: JSON.stringify({
            loan_id: id,
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
    <div className=" bg-neutral-950 p-10">
      <div className=" my-12 p-10 rounded-xl bg-zinc-900 text-white">
        <h1 className=" text-neutral-500 text-sm my-3.5 ml-10">
          Loan ID: <strong>5igsfjf5w54snf</strong>
        </h1>
        <h1 className=" text-neutral-100 text-2xl my-3.5 ml-10">
          User ID: <strong>fvoneff5w54snf</strong>
        </h1>
        <h1 className=" text-neutral-400 text-xl my-3.5 ml-10">
          Amount: <strong className=" text-blue-200">25000.00</strong>
        </h1>
        <div className=" p-8 rounded-xl">
          <div className=" grid grid-cols-5 gap-6">
            <div className=" p-2.5 rounded-md bg-neutral-900 text-semibold">
              <h2 className=" text-gray-200 bg-neutral-700 p-2.5 rounded-md">
                Tenure: <strong>12 Months</strong>
              </h2>
            </div>
            <div className=" p-2.5 rounded-md bg-neutral-900 text-semibold">
              <h2 className=" text-gray-200 bg-neutral-700 p-2.5 rounded-md">
                Interest Rate: <strong>14%</strong>
              </h2>
            </div>
            <div className=" p-2.5 rounded-md bg-neutral-900 text-semibold">
              <h2 className=" text-gray-200 bg-neutral-700 p-2.5 rounded-md">
                Installment: <strong>Monthly</strong>
              </h2>
            </div>
            <div className=" p-2.5 rounded-md bg-neutral-900 text-semibold">
              <h2 className=" text-gray-200 bg-neutral-700 p-2.5 rounded-md">
                Investors: Roshan
              </h2>
            </div>
          </div>
          <div className=" grid grid-cols-1 place-items-center mt-16">
            <h1
              className=" text-3xl my-10 ml-10 text-white font-montserrat font-extrabold
    "
            >
              Invest in this loan
            </h1>
            <ConfigProvider
              theme={{
                components: {
                  Progress: {
                    colorText: "white",
                  },
                },
              }}
            >
              <Flex vertical gap="small">
                <Flex vertical gap="small">
                  <Progress
                    size={{ width: "400px", height: "15px" }}
                    percent={percent}
                    type="line"
                    trailColor="#212221"
                  />
                </Flex>
                <form className=" flex flex-col mt-10">
                  <input
                    type="number"
                    name="amt"
                    id="amt"
                    min={1000}
                    onChange={(e) => Number(setInvAmt(e.target.value))}
                    className=" p-4 text-white border-2 border-blue-600  "
                  />
                  <button
                    onClick={handleClick}
                    className="my-3.5 bg-blue-600 bg p-3.5 rounded-xl tracking-wide font-semibold text-black outline-none"
                  >
                    Invest
                  </button>
                </form>
              </Flex>
            </ConfigProvider>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoanDetails;
