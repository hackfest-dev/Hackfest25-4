const { ethers } = require("hardhat");

async function main() {
  console.log("Interacting with Loans Contract...\n");

  // Get signers (accounts)
  const [deployer, lender1, lender2, lender3, borrower1, borrower2, borrower3] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Lenders: ${lender1.address}, ${lender2.address}, ${lender3.address}`);
  console.log(`Borrowers: ${borrower1.address}, ${borrower2.address}, ${borrower3.address}\n`);

  // Get the deployed Loans contract
  const Loans = await ethers.getContractFactory("Loans");
  const loans = await Loans.deploy();
  // await loans.deployed();
  console.log(`Loans contract deployed at: ${loans.target}\n`);

  // Create 3 different loan agreements
  console.log("Creating 3 loan agreements...");

  // Helper function to get current timestamp
  const currentTimestamp = Math.floor(Date.now() / 1000);

  // Create Loan 1
  const loan1Tx = await loans.createLoan(
    borrower1.address,
    10000, // principal: 10,000 (in smallest unit, e.g., wei)
    12, // tenure: 12 months
    currentTimestamp, // sanctioned date: now
    5, // interest rate: 5%
    2, // agreed penalty: 2%
    [lender1.address, lender2.address], // lenders
    [60, 40] // percentages: 60% and 40%
  );
  const loan1Receipt = await loan1Tx.wait();
  console.log(`Loan 1 created. Gas used: ${loan1Receipt.gasUsed.toString()}`);

  // Create Loan 2
  const loan2Tx = await loans.createLoan(
    borrower2.address,
    5000, // principal: 5,000
    6, // tenure: 6 months
    currentTimestamp, // sanctioned date: now
    7, // interest rate: 7%
    3, // agreed penalty: 3%
    [lender1.address, lender3.address], // lenders
    [70, 30] // percentages: 70% and 30%
  );
  const loan2Receipt = await loan2Tx.wait();
  console.log(`Loan 2 created. Gas used: ${loan2Receipt.gasUsed.toString()}`);

  // Create Loan 3
  const loan3Tx = await loans.createLoan(
    borrower3.address,
    15000, // principal: 15,000
    24, // tenure: 24 months
    currentTimestamp, // sanctioned date: now
    4, // interest rate: 4%
    1, // agreed penalty: 1%
    [lender1.address, lender2.address, lender3.address], // lenders
    [30, 30, 40] // percentages: 30%, 30%, and 40%
  );
  const loan3Receipt = await loan3Tx.wait();
  console.log(`Loan 3 created. Gas used: ${loan3Receipt.gasUsed.toString()}\n`);

  // Get all loans for each borrower
  console.log("LOAN INFORMATION BY BORROWER:\n");
  
  await displayBorrowerLoans(loans, borrower1, "Borrower 1");
  await displayBorrowerLoans(loans, borrower2, "Borrower 2");  
  await displayBorrowerLoans(loans, borrower3, "Borrower 3");

  // Get all loans for each lender
  console.log("\nLOAN INFORMATION BY LENDER:\n");
  
  await displayLenderLoans(loans, lender1, "Lender 1");
  await displayLenderLoans(loans, lender2, "Lender 2");
  await displayLenderLoans(loans, lender3, "Lender 3");
}

async function displayBorrowerLoans(loansContract, borrower, borrowerName) {
  const borrowerLoans = await loansContract.getBorrowersLoanInfo(borrower.address);
  
  console.log(`${borrowerName} (${borrower.address}) has ${borrowerLoans.length} loans:`);
  
  for (let i = 0; i < borrowerLoans.length; i++) {
    const loan = borrowerLoans[i];
    
    console.log(`\n  LOAN ID: ${loan.loanId}`);
    console.log(`  Principal: ${loan.principal}`);
    console.log(`  Tenure: ${loan.tenure} months`);
    console.log(`  Sanctioned Date: ${new Date(Number(loan.sanctionedDate) * 1000).toLocaleString()}`);
    console.log(`  Interest Rate: ${loan.interestRate}%`);
    console.log(`  Penalty: ${loan.agreedPenalty}%`);
    console.log(`  Completed: ${loan.isCompleted}`);
    
    console.log("  Lenders:");
    for (let j = 0; j < loan.lenders.length; j++) {
      console.log(`    Lender ${j+1}: ${loan.lenders[j].lender} - ${loan.lenders[j].percentage}%`);
    }
    
    console.log("  Installments:");
    for (let k = 0; k < loan.installments.length; k++) {
      const installment = loan.installments[k];
      console.log(`    Installment ${k+1}: Amount ${installment.amount}, Interest ${installment.interest}%, Due by ${new Date(Number(installment.dueBy) * 1000).toLocaleString()}, Paid: ${installment.isPaid}`);
    }
  }
  
  console.log(""); // Empty line for better readability
}

async function displayLenderLoans(loansContract, lender, lenderName) {
  // Updated to use the new getLendersLoanInfo that returns full loan details
  const lenderLoans = await loansContract.getLendersLoanInfo(lender.address);
  
  console.log(`${lenderName} (${lender.address}) is involved in ${lenderLoans.length} loans:`);
  
  for (let i = 0; i < lenderLoans.length; i++) {
    const loan = lenderLoans[i];
    
    console.log(`\n  LOAN ID: ${loan.loanId}`);
    console.log(`  Borrower: ${loan.borrower}`);
    console.log(`  Principal: ${loan.principal}`);
    console.log(`  Tenure: ${loan.tenure} months`);
    console.log(`  Sanctioned Date: ${new Date(Number(loan.sanctionedDate) * 1000).toLocaleString()}`);
    console.log(`  Interest Rate: ${loan.interestRate}%`);
    console.log(`  Penalty: ${loan.agreedPenalty}%`);
    console.log(`  Completed: ${loan.isCompleted}`);
    
    console.log("  Lenders:");
    for (let j = 0; j < loan.lenders.length; j++) {
      console.log(`    Lender ${j+1}: ${loan.lenders[j].lender} - ${loan.lenders[j].percentage}%`);
    }
    
    console.log("  Installments:");
    for (let k = 0; k < loan.installments.length; k++) {
      const installment = loan.installments[k];
      console.log(`    Installment ${k+1}: Amount ${installment.amount}, Interest ${installment.interest}%, Due by ${new Date(Number(installment.dueBy) * 1000).toLocaleString()}, Paid: ${installment.isPaid}`);
    }
  }
  
  console.log(""); // Empty line for better readability
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });