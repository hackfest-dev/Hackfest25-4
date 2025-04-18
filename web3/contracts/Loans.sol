// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Loans {
    struct LenderShare {
        address lender;
        uint8 percentage;
    }
    struct LoanAgreement {
        uint256 loanId;
        LenderShare[] lenders;
        address borrower;
        uint24 principal;
        uint256 tenure;
        uint256 sanctionedDate;
        uint8 interestRate;
        int8 agreedPenalty;
    }

    mapping(uint256 => LoanAgreement) public loanAgreements;
    uint256 public nextLoanId = 1;

    function createLoan(
        address borrower,
        uint24 principal,
        uint256 tenure,
        uint256 sanctionedDate,
        uint8 interestRate,
        int8 agreedPenalty,
        address[] calldata lenderAddresses,
        uint8[] calldata percentages
    ) external {
        require(
            lenderAddresses.length == percentages.length,
            "Mismatched lenders and percentages"
        );

        // Checking for mismatch in total percentage
        uint8 totalPercent = 0;
        for (uint256 i = 0; i < percentages.length; i++) {
            totalPercent += percentages[i];
        }
        require(totalPercent == 100, "Total percentage must equal 100");

        LoanAgreement storage loan = loanAgreements[nextLoanId];
        loan.loanId = nextLoanId;
        loan.borrower = borrower;
        loan.principal = principal;
        loan.tenure = tenure;
        loan.sanctionedDate = sanctionedDate;
        loan.interestRate = interestRate;
        loan.agreedPenalty = agreedPenalty;

        for (uint256 i = 0; i < lenderAddresses.length; i++) {
            loan.lenders.push(
                LenderShare({
                    lender: lenderAddresses[i],
                    percentage: percentages[i]
                })
            );
        }

        nextLoanId++;
    }
}
