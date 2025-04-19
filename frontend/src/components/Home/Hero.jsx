import React from "react";
import tfm from "../../assets/tfm.svg";
import { useNavigate } from "react-router";
function Hero() {
  const navigate = useNavigate();
  return (
    <div>
      {" "}
      <div className="p-10 mt-10 bg-neutral-900">
        <div className="bg-black grid grid-cols-4 place-items-center rounded-xl p-10">
          <div className=" col-span-2">
            <h1 className=" text-blue-500 font-extrabold track-wide text-5xl font-montserrat">
              <span className=" text-blue-300">No Middlemen,</span>
              Just Smart Contracts, Fair Loans on the Blockchain
            </h1>
            <p className="font-montserrat font-normal text-gray-400 tracking-wide my-8 text-lg">
              Peer-to-peer loans secured by blockchain. Transparent, immutable,
              and free from intermediaries.
            </p>
            <div className=" w-1/3">
              <button
                onClick={() => navigate("/live-loans")}
                className=" text-black bg-white w-[80%] p-4 rounded-xl font-semibold text-lg"
              >
                Start Lending
              </button>
            </div>
          </div>
          <div className=" col-span-2">
            <img src={tfm} alt="" className="w-96 h-[440px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
