import { ethers,parseEther, parseUnits, BrowserProvider, Contract } from 'ethers';
import HackathonPlatformABI from './HackathonPlatform.json';
import { contractAddress } from './contractAddress';

let provider = null;
let signer = null;
let contract = null;

export const initializeContract = async () => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed or disabled.");
    }

    provider = new ethers.BrowserProvider(window.ethereum);
    
    // Request accounts
    await window.ethereum.request({ method: "eth_requestAccounts" });

    signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, HackathonPlatformABI.abi, signer);

    console.log("Contract initialized successfully");
    return { success: true, address: await signer.getAddress(), contract };
  } catch (error) {
    console.error("Error initializing contract:", error);
    return { success: false, error: error.message };
  }
};

// Contract interaction functions
export const getEventDetails = async (eventId) => {
  if (!contract) {
    console.log("Contract not initialized, initializing now...");
    const result = await initializeContract();
    if (!result.success) {
      throw new Error(result.error);
    }
  }
  return contract.getEventDetails(eventId);
};

export const createHackathon = async (
  name, description, prizePool, firstPrizePercent, 
  secondPrizePercent, thirdPrizePercent, maxTeamSize, 
  maxTeams, startDate, endDate
) => {
  try {
    // Initialize provider & signer
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    console.log("Using signer:", userAddress);

    // Validate ABI
    const abi = Array.isArray(HackathonPlatformABI) ? HackathonPlatformABI : HackathonPlatformABI.abi;
    if (!Array.isArray(abi)) throw new Error("ABI is not an array. Check JSON import.");

    // Initialize contract
    const contract = new Contract(contractAddress, abi, signer);

    // Validate prizePool
    if (!prizePool || isNaN(prizePool) || prizePool <= 0) {
      throw new Error("Invalid prize pool amount");
    }

    // Convert values
    const prizePoolWei = parseEther(prizePool.toString());
    console.log("Sending value (ETH):", ethers.formatEther(prizePoolWei));

    const [firstPrize, secondPrize, thirdPrize] = [firstPrizePercent, secondPrizePercent, thirdPrizePercent].map(
      p => BigInt(p)
    );

    // Check wallet balance
    const balance = await provider.getBalance(userAddress);
    console.log("Wallet Balance (ETH):", ethers.formatEther(balance));

    if (balance < prizePoolWei) {
      throw new Error("Insufficient funds! Add more ETH to your wallet.");
    }

    console.log(`Creating hackathon: ${name} | Prize Pool: ${prizePoolWei} wei`);

    // Send transaction with ETH equal to the prize pool
    const tx = await contract.createHackathon(
      name, description, prizePoolWei, 
      firstPrize, secondPrize, thirdPrize, 
      maxTeamSize, maxTeams, startDate, endDate, 
      {
        from: userAddress,
        value: prizePoolWei,
        gasLimit: 5_000_000,
        gasPrice: parseUnits("10", "gwei")
      }
    );

    console.log("Transaction submitted! Hash:", tx.hash);
    return tx;
  } catch (error) {
    console.error("Error in createHackathon:", error);
    throw error;
  }
};

export const publishHackathon = async (eventId) => {
  if (!contract) await initializeContract();
  return contract.publishHackathon(eventId);
};


// Register team on the blockchain

export const registerTeam = async (eventId, teamName) => {
  if (!contract) {
    const initResult = await initializeContract();
    if (!initResult.success) {
      throw new Error("Contract initialization failed: " + initResult.error);
    }
  }

  console.log("Attempting to register team with:", { eventId, teamName });

  try {
    const signer = await contract.runner.getAddress(); // Get the sender address
    console.log("Using signer:", signer);

    // 🔹 STEP 1: Check if the transaction will revert
    try {
      await contract.registerTeam.staticCall(eventId, teamName, { from: signer });
      console.log("Static call successful - No immediate reverts.");
    } catch (staticCallError) {
      console.error("Static call failed. Possible revert condition:", staticCallError);
      throw new Error("Transaction will revert. Check contract conditions.");
    }

    // 🔹 STEP 2: Estimate gas
    const gasLimit = await contract.registerTeam.estimateGas(eventId, teamName, { from: signer });
    console.log("Estimated Gas:", gasLimit.toString());

    // 🔹 STEP 3: Set gas price manually
    const gasPrice = parseUnits("10", "gwei");

    // 🔹 STEP 4: Send transaction with estimated gas
    const tx = await contract.registerTeam(eventId, teamName, {
      from: signer,
      gasLimit: gasLimit * 2n, // Buffer for unexpected gas spikes
      gasPrice: gasPrice,
    });

    console.log("Transaction submitted:", tx.hash);
    return tx;
  } catch (error) {
    console.error("Gas estimation failed:", error);
    throw new Error("Transaction gas estimation failed. Check contract conditions.");
  }
};


export const joinTeam = async (eventId, teamId) => {
  try {
    // 🔹 Ensure contract is initialized
    if (!contract) {
      const initResult = await initializeContract();
      if (!initResult.success) {
        throw new Error("Contract initialization failed: " + initResult.error);
      }
    }

    const signer = await contract.runner.getAddress(); // Get sender address
    console.log("Using signer:", signer);

    // 🔹 Validate contract function
    if (typeof contract.joinTeam !== "function") {
      throw new Error("oinTeam function does not exist on the contract");
    }

    // 🔹 Estimate gas before sending transaction
    let gasLimit;
    try {
      gasLimit = await contract.joinTeam.estimateGas(eventId, teamId, { from: signer });
      console.log("Estimated Gas:", gasLimit.toString());
    } catch (estimateError) {
      console.error("Gas estimation failed:", estimateError);
      throw new Error("Gas estimation failed. Check contract conditions.");
    }

    // 🔹 Set manual gas price
    const gasPrice = parseUnits("10", "gwei");

    // 🔹 Send transaction with estimated gas
    const tx = await contract.joinTeam(eventId, teamId, {
      from: signer,
      gasLimit: gasLimit * 2n, // Buffer for unexpected gas spikes
      gasPrice: gasPrice,
    });

    console.log("Transaction submitted:", tx.hash);
    return tx;
  } catch (error) {
    console.error("Error in joinTeam contract call:", error);
    throw new Error("Failed to join team. Please check contract conditions.");
  }
};

export const castVote = async (eventId, teamId) => {
  if (!contract) await initializeContract();
  return contract.castVote(eventId, teamId);
};

export const getTeamDetails = async (eventId, teamId) => {
  if (!contract) await initializeContract();
  return contract.getTeamDetails(eventId, teamId);
};

export const getEventTeams = async (eventId) => {
  if (!contract) await initializeContract();
  return contract.getEventTeams(eventId);
};

export const getEventRankings = async (eventId) => {
  if (!contract) await initializeContract();
  return contract.getEventRankings(eventId);
};

export const finalizeResults = async (eventId, useManualRanking, manualTopTeamIds) => {
  if (!contract) await initializeContract();
  return contract.finalizeResults(eventId, useManualRanking, manualTopTeamIds || []);
};

export const distributePrize = async (eventId, teamId) => {
  if (!contract) await initializeContract();
  return contract.distributePrize(eventId, teamId);
};

export const awardNFTs = async (eventId, teamId) => {
  if (!contract) await initializeContract();
  return contract.awardNFTs(eventId, teamId);
};