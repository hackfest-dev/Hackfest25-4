// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Loans {
    struct LenderShare {
        address lender;
        uint8 percentage;
    }

    struct Installment {
        uint256 amount;
        uint8 interest;
        uint256 dueBy;
        bool isPaid;
    }

    struct LoanAgreement {
        uint256 loanId;
        LenderShare[] lenders;
        address borrower;
        uint32 principal;
        uint8 tenure;
        uint256 sanctionedDate;
        uint8 interestRate;
        int8 agreedPenalty;
        bool isCompleted;
        Installment[] installments;
    }

    mapping(uint256 => LoanAgreement) public loanAgreements;
    uint256 public nextLoanId = 1;

    function createLoan(
        address borrower,
        uint32 principal,
        uint8 tenure,
        uint256 sanctionedDate,
        uint8 interestRate,
        int8 agreedPenalty,
        address[] calldata lenderAddresses,
        uint8[] calldata percentages
    ) external returns (uint256) {
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

        uint256 currentLoanId = nextLoanId;
        LoanAgreement storage loan = loanAgreements[currentLoanId];
        loan.loanId = currentLoanId;
        loan.borrower = borrower;
        loan.principal = principal;
        loan.tenure = tenure;
        loan.sanctionedDate = sanctionedDate;
        loan.interestRate = interestRate;
        loan.agreedPenalty = agreedPenalty;
        loan.isCompleted = false;

        for (uint256 i = 0; i < lenderAddresses.length; i++) {
            loan.lenders.push(
                LenderShare({
                    lender: lenderAddresses[i],
                    percentage: percentages[i]
                })
            );
        }

        // Create installments
        uint32 amount;
        uint256 temp;
        amount = principal / tenure;
        for (uint8 i = 0; i < tenure; i++) {
            unchecked {
                temp = sanctionedDate + ((i + 1) * 30 days);
            }
            loan.installments.push(
                Installment({
                    amount: amount,
                    interest: interestRate,
                    dueBy: temp,
                    isPaid: false
                })
            );
        }
        nextLoanId++;
        return currentLoanId;
    }

    function getBorrowersLoanInfo(
        address borrower
    ) external view returns (LoanAgreement[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i < nextLoanId; i++) {
            if (loanAgreements[i].borrower == borrower) {
                count++;
            }
        }
        LoanAgreement[] memory result = new LoanAgreement[](count);
        uint256 index = 0;
        for (uint256 i = 1; i < nextLoanId; i++) {
            if (loanAgreements[i].borrower == borrower) {
                result[index] = loanAgreements[i];
                index++;
            }
        }
        return result;
    }

    function getLendersLoanInfo(
        address lender
    ) external view returns (LoanAgreement[] memory) {
        // First, count how many loans this lender is part of
        uint256 count = 0;
        for (uint256 i = 1; i < nextLoanId; i++) {
            LoanAgreement storage loan = loanAgreements[i];
            for (uint256 j = 0; j < loan.lenders.length; j++) {
                if (loan.lenders[j].lender == lender) {
                    count++;
                    break;
                }
            }
        }

        // Create an array to store all the loan agreements
        LoanAgreement[] memory result = new LoanAgreement[](count);
        uint256 index = 0;

        // Populate the array with loan agreements
        for (uint256 i = 1; i < nextLoanId; i++) {
            LoanAgreement storage loan = loanAgreements[i];
            for (uint256 j = 0; j < loan.lenders.length; j++) {
                if (loan.lenders[j].lender == lender) {
                    result[index] = loan;
                    index++;
                    break;
                }
            }
        }
        return result;
    }

    function updateInstallment(
        uint256 loanId,
        uint8 installmentIndex,
        bool isPaid,
        uint256 newDueBy,
        uint8 newInterest
    ) external {
        require(loanId < nextLoanId && loanId > 0, "Invalid loan ID");
        LoanAgreement storage loan = loanAgreements[loanId];

        require(
            msg.sender == loan.borrower,
            "Only borrower can update installment"
        );

        require(
            installmentIndex < loan.installments.length,
            "Invalid installment index"
        );

        loan.installments[installmentIndex].isPaid = isPaid;
        loan.installments[installmentIndex].dueBy = newDueBy;
        loan.installments[installmentIndex].interest = newInterest;

        bool allPaid = true;
        for (uint8 i = 0; i < loan.installments.length; i++) {
            if (!loan.installments[i].isPaid) {
                allPaid = false;
                break;
            }
        }

        if (allPaid) {
            loan.isCompleted = true;
        }
    }

    function getInstallment(
        uint256 loanId,
        uint8 installmentIndex
    ) external view returns (Installment memory) {
        require(loanId < nextLoanId && loanId > 0, "Invalid loan ID");
        LoanAgreement storage loan = loanAgreements[loanId];
        require(
            installmentIndex < loan.installments.length,
            "Invalid installment index"
        );
        return loan.installments[installmentIndex];
    }
}
