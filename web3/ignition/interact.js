async function main() {
    const [deployer] = await ethers.getSigners();
  
    const Loans = await ethers.getContractFactory("Loans");
    const loans = await Loans.attach("0x5fbdb2315678afecb367f032d93f642f64180aa3");
  
    await loans.createLoan(
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        1000,
        12,
        Math.floor(Date.now() / 1000),
        5,
        -1,
        ["0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"],
        [60, 40]
    );
    const loan = await loans.loanAgreements(1);
    console.log(loan);
}
  
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
  