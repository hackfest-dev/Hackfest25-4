require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Import your script from ignition folder instead of tasks
require("./ignition/setBalances");

// This will run our fund-wallets task when the node starts
const { TASK_NODE } = require("hardhat/builtin-tasks/task-names");
const { task } = require("hardhat/config");

// Override the node task to run our funding task first
task(TASK_NODE).setAction(async (args, hre, runSuper) => {
  // We need to wait for the node to start before funding wallets
  // Using setTimeout to ensure the node is running
  setTimeout(async () => {
    await hre.run("fund-wallets");
  }, 3000); // Wait 3 seconds for the node to be ready
  
  // Continue with the original node task
  return runSuper();
});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      mining: {
        auto: true
      }
    }
  }
};