const { task } = require("hardhat/config");
const { Client } = require('pg');

// Database connection configuration
const dbConfig = {
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Typically needed for Neon
  }
};

task("fund-wallets", "Funds wallets from the Neon database when local node starts")
  .setAction(async (taskArgs, hre) => {
    console.log("Connecting to Neon database to fetch wallets...");
    
    const client = new Client(dbConfig);
    
    try {
      // Connect to the database
      await client.connect();
      console.log("Connected to Neon database successfully!");
      
      // Query to fetch wallet addresses from your database
      // Adjust this query based on your actual database schema
      const query = "SELECT public_key FROM wallet";
      const result = await client.query(query);
      
      if (result.rows.length === 0) {
        console.log("No wallets found in the database.");
        return;
      }
      
      console.log(`Found ${result.rows.length} wallets in the database.`);
      
      // Use hardhat's ethers
      const { ethers } = hre;
      
      // Get the local node signer with ETH
      const [funder] = await ethers.getSigners();
      
      // Define the amount to fund each wallet (e.g., 1 ETH)
      // For ethers v6, use parseEther as a standalone function
      const fundAmount = ethers.parseEther("1.0");
      
      // Fund each wallet
      for (const row of result.rows) {
        const walletAddress = row.public_key;
        
        // Skip invalid addresses - use isAddress from ethers
        if (!ethers.isAddress(walletAddress)) {
          console.log(`Invalid address: ${walletAddress}, skipping...`);
          continue;
        }
        
        console.log(`Funding wallet ${walletAddress} with ${ethers.formatEther(fundAmount)} ETH...`);
        
        // Send transaction
        const tx = await funder.sendTransaction({
          to: walletAddress,
          value: fundAmount
        });
        
        await tx.wait();
        console.log(`Successfully funded wallet ${walletAddress}!`);
      }
      
      console.log("All wallets from the database have been funded!");
    } catch (error) {
      console.error("Error while funding wallets:", error);
    } finally {
      // Close the database connection
      await client.end();
    }
  });

// Export the task so it can be imported in hardhat.config.js
module.exports = {};