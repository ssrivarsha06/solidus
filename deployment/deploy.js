const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const { ethers } = hre;
  console.log("🚀 Starting Universal Identity Registry deployment...");
  console.log("🌐 Network:", hre.network.name);

  // Get the contract factory
  const UniversalIdentityRegistry = await ethers.getContractFactory("UniversalIdentityRegistry");

  console.log("⛓️ Deploying contract...");
  const contract = await UniversalIdentityRegistry.deploy();
  
  // Wait for deployment to complete
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ UniversalIdentityRegistry deployed to:", contractAddress);

  // Get deployer info
  const [deployer] = await ethers.getSigners();
  const deploymentInfo = {
    contractAddress,
    network: hre.network.name,
    deploymentTime: new Date().toISOString(),
    deployer: deployer.address,
    transactionHash: contract.deploymentTransaction()?.hash
  };

  // Save deployment info to backend folder
  const backendDir = path.join(__dirname, "../backend");
  if (!fs.existsSync(backendDir)) {
    fs.mkdirSync(backendDir, { recursive: true });
  }
  
  const deploymentPath = path.join(backendDir, "deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📄 Deployment info saved to ${deploymentPath}`);

  // Update .env file with contract address
  const envPath = path.join(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    
    if (envContent.includes("CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /CONTRACT_ADDRESS=.*/,
        `CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nCONTRACT_ADDRESS=${contractAddress}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log("📝 Updated .env with contract address");
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Summary:");
  console.log(`   Contract Address: ${contractAddress}`);
  console.log(`   Network: ${hre.network.name}`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log("\n🚀 Next steps:");
  console.log("   1. Start backend: npm run dev-backend");
  console.log("   2. Start frontend: npm run dev-frontend");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });