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

  // Create Loan 1 - First get the next loan ID
  let nextLoanId = await loans.nextLoanId();
  const loan1Id = Number(nextLoanId);
  
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
  console.log(`Loan 1 created with ID: ${loan1Id}. Gas used: ${loan1Receipt.gasUsed.toString()}`);

  // Create Loan 2
  nextLoanId = await loans.nextLoanId();
  const loan2Id = Number(nextLoanId);
  
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
  console.log(`Loan 2 created with ID: ${loan2Id}. Gas used: ${loan2Receipt.gasUsed.toString()}`);

  // Create Loan 3
  nextLoanId = await loans.nextLoanId();
  const loan3Id = Number(nextLoanId);
  
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
  console.log(`Loan 3 created with ID: ${loan3Id}. Gas used: ${loan3Receipt.gasUsed.toString()}\n`);

  // Get all loans for each borrower
  console.log("LOAN INFORMATION BY BORROWER (BEFORE UPDATES):\n");
  
  await displayBorrowerLoans(loans, borrower1, "Borrower 1");
  await displayBorrowerLoans(loans, borrower2, "Borrower 2");  
  await displayBorrowerLoans(loans, borrower3, "Borrower 3");

  // Get all loans for each lender
  console.log("\nLOAN INFORMATION BY LENDER (BEFORE UPDATES):\n");
  
  await displayLenderLoans(loans, lender1, "Lender 1");
  await displayLenderLoans(loans, lender2, "Lender 2");
  await displayLenderLoans(loans, lender3, "Lender 3");

  console.log("\n\n========== DEMONSTRATING UPDATE INSTALLMENT FUNCTION ==========\n");

  // 1. Update a single installment for Loan 1
  console.log(`Updating installment 0 for Loan ${loan1Id}...`);
  const newDueDate1 = currentTimestamp + (60 * 24 * 60 * 60); // current time + 60 days
  let tx = await loans.connect(borrower1).updateInstallment(
    loan1Id,                
    0,                
    true,             
    newDueDate1,      
    6                 
  );
  await tx.wait();
  console.log("Installment updated successfully!");

  // 2. Update multiple installments for Loan 2 (marking all as paid to test completion)
  console.log(`\nUpdating all installments for Loan ${loan2Id} (marking all as paid)...`);
  
  // Get current loan 2 data
  const loan2Data = await loans.getBorrowersLoanInfo(borrower2.address);
  const installmentCount = loan2Data[0].installments.length;
  
  // Mark each installment as paid
  for (let i = 0; i < installmentCount; i++) {
    console.log(`Updating installment ${i} for Loan ${loan2Id}...`);
    const newDueDate = currentTimestamp + ((i + 1) * 30 * 24 * 60 * 60); // Extend by 30 days per installment
    tx = await loans.connect(borrower2).updateInstallment(
      loan2Id,                
      i,               
      true,            
      newDueDate,       
      7                
    );
    await tx.wait();
  }
  console.log(`All installments for Loan ${loan2Id} marked as paid!`);

  // 3. Try to update an installment as a non-borrower (should fail)
  console.log(`\nAttempting to update installment 0 for Loan ${loan3Id} as a non-borrower (should fail)...`);
  try {
    tx = await loans.connect(borrower1).updateInstallment(
      loan3Id,             
      0,               
      true,           
      currentTimestamp + (60 * 24 * 60 * 60), 
        5                 
    );
    await tx.wait();
    console.log("Transaction succeeded unexpectedly!");
  } catch (error) {
    console.log(`Transaction failed as expected: ${error.message.slice(0, 100)}...`);
  }

  // 4. Try to update an invalid installment index (should fail)
  console.log(`\nAttempting to update invalid installment index for Loan ${loan1Id} (should fail)...`);
  try {
    tx = await loans.connect(borrower1).updateInstallment(
      loan1Id,                
      99,               
      true,             
      currentTimestamp + (60 * 24 * 60 * 60), 
      5                 
    );
    await tx.wait();
    console.log("Transaction succeeded unexpectedly!");
  } catch (error) {
    console.log(`Transaction failed as expected: ${error.message.slice(0, 100)}...`);
  }

  // Display updated loan information
  console.log("\n\nLOAN INFORMATION BY BORROWER (AFTER UPDATES):\n");
  
  await displayBorrowerLoans(loans, borrower1, "Borrower 1");
  await displayBorrowerLoans(loans, borrower2, "Borrower 2");
  
  // Check if Loan 2 is now marked as completed
  const updatedLoan2Data = await loans.getBorrowersLoanInfo(borrower2.address);
  console.log(`\nLoan ${loan2Id} completion status: ${updatedLoan2Data[0].isCompleted}`);
  if (updatedLoan2Data[0].isCompleted) {
    console.log(`✅ Loan ${loan2Id} has been successfully marked as completed after all installments were paid!`);
  } else {
    console.log(`❌ Loan ${loan2Id} was not marked as completed despite all installments being paid!`);
  }
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