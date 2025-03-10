// src/contracts/contractUtils.js
import { ethers } from 'ethers';
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

    provider = new ethers.providers.Web3Provider(window.ethereum);

    // Request accounts and handle rejection
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      throw new Error("User rejected the connection request.");
    }

    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, HackathonPlatformABI.abi, signer);

    return { success: true, address: await signer.getAddress(), contract };
  } catch (error) {
    console.error("Error initializing contract:", error);
    return { success: false, error: error.message };
  }
};

// Contract interaction functions
export const getEventDetails = async (eventId) => {
  if (!contract) await initializeContract();
  return contract.getEventDetails(eventId);
};

export const createHackathon = async (name, description, prizePool, firstPrizePercent, secondPrizePercent, thirdPrizePercent, maxTeamSize, maxTeams, startDate, endDate) => {
  if (!contract) await initializeContract();
  
  // Convert prizePool to wei
  const prizePoolWei = ethers.utils.parseEther(prizePool.toString());
  
  // Calculate actual prize values in wei
  const firstPrizeValue = prizePoolWei.mul(firstPrizePercent).div(100);
  const secondPrizeValue = prizePoolWei.mul(secondPrizePercent).div(100);
  const thirdPrizeValue = prizePoolWei.mul(thirdPrizePercent).div(100);
  
  const options = { value: prizePoolWei };
  
  return contract.createHackathon(
    name, description, prizePoolWei, 
    firstPrizeValue, secondPrizeValue, thirdPrizeValue, 
    maxTeamSize, maxTeams, startDate, endDate, options
  );
};

export const publishHackathon = async (eventId) => {
  if (!contract) await initializeContract();
  return contract.publishHackathon(eventId);
};

export const registerTeam = async (eventId, teamName) => {
  if (!contract) await initializeContract();
  return contract.registerTeam(eventId, teamName);
};

export const joinTeam = async (eventId, teamId) => {
  if (!contract) await initializeContract();
  return contract.joinTeam(eventId, teamId);
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