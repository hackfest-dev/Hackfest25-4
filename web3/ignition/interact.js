const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer, borrower, lender1, lender2] = await ethers.getSigners();

  const Loans = await ethers.getContractFactory("Loans");
  const loans = await Loans.attach("0x8a791620dd6260079bf849dc5567adc3f2fdc318");

  // Sample Loan Data
  const principal = 10000;
  const tenure = 5;
  const interestRate = 10; 
  const agreedPenalty = 2; 
  const sanctionedDate = Math.floor(Date.now() / 1000); 
  const lenderAddresses = [lender1.address, lender2.address];
  const percentages = [60, 40];

  // 🟢 Create a loan
  const tx = await loans.createLoan(
    borrower.address,
    principal,
    tenure,
    sanctionedDate,
    interestRate,
    agreedPenalty,
    lenderAddresses,
    percentages
  );
  await tx.wait();
  console.log("Loan created successfully");

  // 🟡 Get borrower’s loan info
  const borrowerLoans = await loans.getBorrowersLoanInfo(borrower.address);
  console.log("\n📄 Borrower's Loans:");
  console.log(JSON.stringify(formatLoanAgreements(borrowerLoans), null, 2));

  // 🔵 Get lender’s loan IDs
  const lenderLoanIds = await loans.getLendersLoanInfo(lender1.address);
  console.log("\n📄 Lender's Loan IDs:");
  console.log(lenderLoanIds.map((id) => id.toString()));
}

// 📦 Helper: Format BigInts for JSON display
function formatLoanAgreements(loans) {
  return loans.map((loan) => ({
    loanId: loan.loanId.toString(),
    borrower: loan.borrower,
    principal: loan.principal.toString(),
    tenure: Number(loan.tenure),
    sanctionedDate: loan.sanctionedDate.toString(),
    interestRate: Number(loan.interestRate),
    agreedPenalty: Number(loan.agreedPenalty),
    monthlyEMI: loan.monthlyEMI.toString(),
    totalPaid: loan.totalPaid.toString(),
    nextDueDate: loan.nextDueDate.toString(),
    isCompleted: loan.isCompleted,
    lenders: loan.lenders.map((l) => ({
      lender: l.lender,
      percentage: Number(l.percentage),
    })),
  }));
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
