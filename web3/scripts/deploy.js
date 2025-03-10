require("dotenv").config();
const { ethers, network } = require("hardhat");

async function main() {
  const baseURI =
    process.env.BASE_URI ||
    "https://yellow-rainy-hamster-148.mypinata.cloud/ipfs/bafybeiez4nmqeiuwlftqdqd2xpsxuf6hnwxlc4qckhpy5eaq7terochh54/";

  const HackathonPlatform = await ethers.getContractFactory("HackathonPlatform");
  console.log("Deploying HackathonPlatform contract on:", network.name);

  const hackathonPlatform = await HackathonPlatform.deploy(baseURI);
  await hackathonPlatform.waitForDeployment();

  const contractAddress = await hackathonPlatform.getAddress();
  console.log("✅ HackathonPlatform deployed at:", contractAddress);
  console.log("🔗 BaseURI set to:", baseURI);
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
