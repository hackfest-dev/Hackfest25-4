import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Flex, Progress, ConfigProvider } from "antd";

function PendingLoanCard({ loan }) {
  const [percent, setPercent] = useState(0);
  const navigate = useNavigate();

  return loan ? (
    <div className=" bg-neutral-950 text-white rounded-2xl p-4">
      <div className="my-2 grid grid-cols-4">
        <h1 className=" col-span-2">{loan.name}</h1>
        <h2 className=" text-gray-400">
          Installment: <span className=" text-white">Monthly</span>
        </h2>
        <h2 className=" text-gray-400">
          Request Expiry: <span className=" text-white"> 1 week</span>
        </h2>
      </div>
      <div className=" grid grid-cols-3">
        <div>
          <h4 className=" text-gray-400 ">Loan amount</h4>
          <h4>₹ {loan.loanAmount}</h4>
        </div>
        <div>
          <h4 className=" text-gray-400 ">Tenure</h4>
          <h4>{`${loan.tenure} Month(s)`}</h4>
        </div>
        <div>
          <h4 className=" text-gray-400 ">Interest rate</h4>
          <h4>{loan.interestRate}%</h4>
        </div>
      </div>
      <div className=" grid grid-cols-1 place-items-center my-16">
        <h1
          className=" text-3xl my-10 ml-10 text-white font-montserrat font-extrabold
    "
        >
          Amount invested to your loan request
        </h1>
        <div className=" relative">
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
            </Flex>
          </ConfigProvider>
          <div className=" absolute">0</div>
          <div className=" absolute right-6">{loan.loanAmount}</div>
        </div>
      </div>
    </div>
  ) : null;
}

export default PendingLoanCard;
