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
    ) external view returns (uint256[] memory) {
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
        uint256[] memory lenderLoanIds = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i < nextLoanId; i++) {
            LoanAgreement storage loan = loanAgreements[i];
            for (uint256 j = 0; j < loan.lenders.length; j++) {
                if (loan.lenders[j].lender == lender) {
                    lenderLoanIds[index] = i;
                    index++;
                    break;
                }
            }
        }
        return lenderLoanIds;
    }

    function getLendersForLoan(
        uint256 loanId
    ) external view returns (address[] memory, uint8[] memory) {
        LenderShare[] storage shares = loanAgreements[loanId].lenders;
        address[] memory addresses = new address[](shares.length);
        uint8[] memory percentages = new uint8[](shares.length);

        for (uint256 i = 0; i < shares.length; i++) {
            addresses[i] = shares[i].lender;
            percentages[i] = shares[i].percentage;
        }

        return (addresses, percentages);
    }
}
