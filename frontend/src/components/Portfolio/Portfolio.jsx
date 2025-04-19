import React from "react";
import PendingLoans from "./PendingLoans";
import Investments from "./Investments";
import Borrowings from "./Borrowings";
function Portfolio() {
  return (
    <div className=" bg-neutral-950 p-10">
      <Investments />
      <PendingLoans />
    </div>
  );
}

export default Portfolio;
