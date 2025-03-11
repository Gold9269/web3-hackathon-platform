const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("HackathonPlatform", function () {
  let hackathonPlatform;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addr4;
  let addr5;
  let addr6;
  let addrs;

  // Constants for test data
  const baseURI = "https://yellow-rainy-hamster-148.mypinata.cloud/ipfs/bafybeiez4nmqeiuwlftqdqd2xpsxuf6hnwxlc4qckhpy5eaq7terochh54/";
  const hackathonName = "Test Hackathon";
  const description = "A test hackathon for smart contract testing";
  const prizePool = ethers.parseEther("10");
  const firstPrizePercent = 50;
  const secondPrizePercent = 30;
  const thirdPrizePercent = 20;
  const maxTeamSize = 3;
  const maxTeams = 10;
  const teamName1 = "Team Alpha";
  const teamName2 = "Team Beta";
  const teamName3 = "Team Gamma";

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2, addr3, addr4, addr5, addr6, ...addrs] = await ethers.getSigners();

    // Deploy contract
    const HackathonPlatform = await ethers.getContractFactory("HackathonPlatform");
    hackathonPlatform = await HackathonPlatform.deploy(baseURI);
    await hackathonPlatform.waitForDeployment();
    
    // Note: This line in the original is redundant and has a typo, removing it
    // const hackathonPlatform = await ethers.getContract("HackathonPlatform");
  });

  // describe("Deployment", function () {
  //   it("Should set the right owner with admin role", async function () {
  //     // Check if the deployer has the admin role
  //     expect(await hackathonPlatform.hasRole(await hackathonPlatform.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
  //     expect(await hackathonPlatform.hasRole(await hackathonPlatform.ADMIN_ROLE(), owner.address)).to.equal(true);
  //   });

  //   it("Should set the correct base URI", async function () {
  //     // Award NFT to check the baseURI
  //     const eventId = await createTestHackathon();
  //     const teamId = await registerTeam(addr1, eventId, "Test Team");
  //     await joinTeam(addr2, eventId, teamId);
      
  //     // Finalize results manually to make this team a winner
  //     const manualRankings = [teamId, 1, 2]; // This assumes you'll create at least 3 teams
  //     await hackathonPlatform.finalizeResults(eventId, true, manualRankings);
      
  //     // Award NFT
  //     await hackathonPlatform.awardNFTs(eventId, teamId);
      
  //     // Check token URI
  //     const tokenId = 1n; // First token
  //     const tokenUri = await hackathonPlatform.tokenURI(tokenId);
  //     expect(tokenUri).to.include(baseURI);
  //   });
  // });

  describe("Hackathon Creation", function () {
    it("Should create a hackathon with correct parameters", async function () {
      // Create a hackathon
      const currentTime = await time.latest();
      const startDate = currentTime + 86400; // Start 1 day later
      const endDate = startDate + 604800; // End 1 week after start
      
      await expect(hackathonPlatform.createHackathon(
        hackathonName,
        description,
        prizePool,
        firstPrizePercent,
        secondPrizePercent,
        thirdPrizePercent,
        maxTeamSize,
        maxTeams,
        startDate,
        endDate,
        { value: prizePool }
      ))
        .to.emit(hackathonPlatform, "HackathonCreated")
        .withArgs(1n, hackathonName, owner.address);
      
      // Check hackathon details
      const eventDetails = await hackathonPlatform.getEventDetails(1);
      expect(eventDetails.name).to.equal(hackathonName);
      expect(eventDetails.description).to.equal(description);
      expect(eventDetails.prizePool).to.equal(prizePool);
      expect(eventDetails.isActive).to.equal(true);
      // expect(eventDetails.isPublished).to.equal(true); // Note: The contract has this set to true by default
    });

    it("Should fail if prize percentages don't sum to 100", async function () {
      const currentTime = await time.latest();
      const startDate = currentTime + 86400;
      const endDate = startDate + 604800;
      
      await expect(hackathonPlatform.createHackathon(
        hackathonName,
        description,
        prizePool,
        40, // only 90% total
        30,
        20,
        maxTeamSize,
        maxTeams,
        startDate,
        endDate,
        { value: prizePool }
      )).to.be.revertedWith("Prize percentages must total 100");
    });

    it("Should fail if sent value doesn't match prize pool", async function () {
      const currentTime = await time.latest();
      const startDate = currentTime + 86400;
      const endDate = startDate + 604800;
      
      await expect(hackathonPlatform.createHackathon(
        hackathonName,
        description,
        prizePool,
        firstPrizePercent,
        secondPrizePercent,
        thirdPrizePercent,
        maxTeamSize,
        maxTeams,
        startDate,
        endDate,
        { value: ethers.parseEther("5") } // Half of required amount
      )).to.be.revertedWith("Sent value must match prize pool");
    });
  });

  describe("Team Registration", function () {
    let eventId;
    
    beforeEach(async function () {
      eventId = await createTestHackathon();
      // Time travel to start date since registration requires event to have started
      const eventDetails = await hackathonPlatform.getEventDetails(eventId);
      await time.increaseTo(eventDetails.startDate);
    });

    it("Should register a team successfully", async function () {
      await expect(hackathonPlatform.connect(addr1).registerTeam(eventId, teamName1))
        .to.emit(hackathonPlatform, "TeamRegistered")
        .withArgs(eventId, 0n, teamName1, addr1.address);
      
      // Check team details
      const teamDetails = await hackathonPlatform.getTeamDetails(eventId, 0);
      expect(teamDetails.name).to.equal(teamName1);
      expect(teamDetails.teamLeader).to.equal(addr1.address);
      expect(teamDetails.memberCount).to.equal(1n);
    });

    it("Should allow joining an existing team", async function () {
      // First register a team
      await hackathonPlatform.connect(addr1).registerTeam(eventId, teamName1);
      
      // Then have another address join
      await expect(hackathonPlatform.connect(addr2).joinTeam(eventId, 0))
        .to.emit(hackathonPlatform, "MemberJoined")
        .withArgs(eventId, 0n, addr2.address);
      
      // Check member count
      const teamDetails = await hackathonPlatform.getTeamDetails(eventId, 0);
      expect(teamDetails.memberCount).to.equal(2n);
      
      // Check team members
      const members = await hackathonPlatform.getTeamMembers(eventId, 0);
      expect(members).to.have.length(2);
      expect(members).to.include(addr1.address);
      expect(members).to.include(addr2.address);
    });

    it("Should prevent joining if team is full", async function () {
      // Register a team with max size 3
      await hackathonPlatform.connect(addr1).registerTeam(eventId, teamName1);
      
      // Add 2 more members to reach max
      await hackathonPlatform.connect(addr2).joinTeam(eventId, 0);
      await hackathonPlatform.connect(addr3).joinTeam(eventId, 0);
      
      // Try to add a 4th member
      await expect(hackathonPlatform.connect(addr4).joinTeam(eventId, 0))
        .to.be.revertedWith("Team is full");
    });

    it("Should prevent the same person from registering twice", async function () {
      await hackathonPlatform.connect(addr1).registerTeam(eventId, teamName1);
      
      // Try to register again
      await expect(hackathonPlatform.connect(addr1).registerTeam(eventId, "Another Team"))
        .to.be.revertedWith("Already registered for this event");
      
      // Try to join another team
      await hackathonPlatform.connect(addr2).registerTeam(eventId, teamName2);
      await expect(hackathonPlatform.connect(addr1).joinTeam(eventId, 1))
        .to.be.revertedWith("Already registered for this event");
    });
  });

  describe("Voting System", function () {
    let eventId;
    let teamId1, teamId2, teamId3;
    
    beforeEach(async function () {
      eventId = await createTestHackathon();
      
      // Time travel to start date
      const eventDetails = await hackathonPlatform.getEventDetails(eventId);
      await time.increaseTo(eventDetails.startDate);
      
      // Register teams
      teamId1 = await registerTeam(addr1, eventId, teamName1);
      await joinTeam(addr2, eventId, teamId1);
      
      teamId2 = await registerTeam(addr3, eventId, teamName2);
      await joinTeam(addr4, eventId, teamId2);
      
      teamId3 = await registerTeam(addr5, eventId, teamName3);
      await joinTeam(addr6, eventId, teamId3);
      
      // Open voting
      await hackathonPlatform.setVotingState(eventId, true);
    });

    it("Should allow casting votes", async function () {
      // addr1 votes for team2
      await expect(hackathonPlatform.connect(addr1).castVote(eventId, teamId2))
        .to.emit(hackathonPlatform, "VoteCast")
        .withArgs(eventId, addr1.address, teamId2);
      
      // Check vote count
      const teamDetails = await hackathonPlatform.getTeamDetails(eventId, teamId2);
      expect(teamDetails.votes).to.equal(1n);
      
      // Check voter status
      expect(await hackathonPlatform.hasParticipantVoted(eventId, addr1.address)).to.equal(true);
    });

    it("Should prevent voting for your own team", async function () {
      // Try to vote for own team
      await expect(hackathonPlatform.connect(addr1).castVote(eventId, teamId1))
        .to.be.revertedWith("Cannot vote for your own team");
    });

    it("Should prevent voting twice", async function () {
      // First vote
      await hackathonPlatform.connect(addr1).castVote(eventId, teamId2);
      
      // Try to vote again
      await expect(hackathonPlatform.connect(addr1).castVote(eventId, teamId3))
        .to.be.revertedWith("Already voted");
    });

    it("Should prevent voting when voting is closed", async function () {
      // Close voting
      await hackathonPlatform.setVotingState(eventId, false);
      
      // Try to vote
      await expect(hackathonPlatform.connect(addr1).castVote(eventId, teamId2))
        .to.be.revertedWith("Voting is not open");
    });
  });

  describe("Results Finalization", function () {
    let eventId;
    let teamId1, teamId2, teamId3;
    
    beforeEach(async function () {
      eventId = await createTestHackathon();
      
      // Time travel to start date
      const eventDetails = await hackathonPlatform.getEventDetails(eventId);
      await time.increaseTo(eventDetails.startDate);
      
      // Register teams
      teamId1 = await registerTeam(addr1, eventId, teamName1);
      await joinTeam(addr2, eventId, teamId1);
      
      teamId2 = await registerTeam(addr3, eventId, teamName2);
      await joinTeam(addr4, eventId, teamId2);
      
      teamId3 = await registerTeam(addr5, eventId, teamName3);
      await joinTeam(addr6, eventId, teamId3);
      
      // Open voting
      await hackathonPlatform.setVotingState(eventId, true);
      
      // Cast votes to create a clear ranking
      await hackathonPlatform.connect(addr1).castVote(eventId, teamId2); // Team 1 votes for Team 2
      await hackathonPlatform.connect(addr2).castVote(eventId, teamId3); // Team 1 votes for Team 3
      await hackathonPlatform.connect(addr3).castVote(eventId, teamId3); // Team 2 votes for Team 3
      await hackathonPlatform.connect(addr4).castVote(eventId, teamId1); // Team 2 votes for Team 1
      await hackathonPlatform.connect(addr5).castVote(eventId, teamId2); // Team 3 votes for Team 2
      await hackathonPlatform.connect(addr6).castVote(eventId, teamId2); // Team 3 votes for Team 2
      
      // Results: Team 2 has 3 votes, Team 3 has 2 votes, Team 1 has 1 vote
      
      // Close voting
      await hackathonPlatform.setVotingState(eventId, false);
      
      // Time travel to end date
      await time.increaseTo(eventDetails.endDate + BigInt(1));
    });

    it("Should finalize results automatically based on votes", async function () {
      // Finalize results - automatic ranking
      await expect(hackathonPlatform.finalizeResults(eventId, false, []))
        .to.emit(hackathonPlatform, "ResultsFinalized");
      
      // Check rankings
      const rankings = await hackathonPlatform.getEventRankings(eventId);
      expect(rankings[0]).to.equal(teamId2); // Most votes
      expect(rankings[1]).to.equal(teamId3); // Second most
      expect(rankings[2]).to.equal(teamId1); // Least votes
      
      // Check team ranks
      const team1 = await hackathonPlatform.getTeamDetails(eventId, teamId1);
      const team2 = await hackathonPlatform.getTeamDetails(eventId, teamId2);
      const team3 = await hackathonPlatform.getTeamDetails(eventId, teamId3);
      
      expect(team1.rank).to.equal(3n); // Third place
      expect(team2.rank).to.equal(1n); // First place
      expect(team3.rank).to.equal(2n); // Second place
      
      // Check prize amounts
      const firstPrizeAmount = (prizePool * BigInt(firstPrizePercent)) / 100n;
      const secondPrizeAmount = (prizePool * BigInt(secondPrizePercent)) / 100n;
      const thirdPrizeAmount = (prizePool * BigInt(thirdPrizePercent)) / 100n;
      
      expect(team2.prizeAmount).to.equal(firstPrizeAmount);
      expect(team3.prizeAmount).to.equal(secondPrizeAmount);
      expect(team1.prizeAmount).to.equal(thirdPrizeAmount);
    });

    it("Should finalize results with manual ranking", async function () {
      // Manual ranking (different from vote counts)
      const manualRanking = [teamId1, teamId3, teamId2]; // Completely reversed from vote counts
      
      await expect(hackathonPlatform.finalizeResults(eventId, true, manualRanking))
        .to.emit(hackathonPlatform, "ResultsFinalized");
      
      // Check rankings
      const rankings = await hackathonPlatform.getEventRankings(eventId);
      expect(rankings[0]).to.equal(teamId1); // Manual first
      expect(rankings[1]).to.equal(teamId3); // Manual second
      expect(rankings[2]).to.equal(teamId2); // Manual third
      
      // Check team ranks
      const team1 = await hackathonPlatform.getTeamDetails(eventId, teamId1);
      const team2 = await hackathonPlatform.getTeamDetails(eventId, teamId2);
      const team3 = await hackathonPlatform.getTeamDetails(eventId, teamId3);
      
      expect(team1.rank).to.equal(1n); // First place (manually assigned)
      expect(team2.rank).to.equal(3n); // Third place (manually assigned)
      expect(team3.rank).to.equal(2n); // Second place (manually assigned)
    });

    it("Should fail manual ranking with invalid teams", async function () {
      // Try to provide a non-existent team ID
      const invalidRanking = [teamId1, teamId3, 99]; // 99 is not a valid team ID
      
      await expect(hackathonPlatform.finalizeResults(eventId, true, invalidRanking))
        .to.be.revertedWith("Invalid team ID");
    });

    it("Should fail manual ranking with duplicate teams", async function () {
      // Try to provide a duplicate team ID
      const duplicateRanking = [teamId1, teamId1, teamId3]; // teamId1 appears twice
      
      await expect(hackathonPlatform.finalizeResults(eventId, true, duplicateRanking))
        .to.be.revertedWith("Duplicate team in ranking");
    });
  });

  describe("Prize Distribution", function () {
    let eventId;
    let teamId1, teamId2, teamId3;
    
    beforeEach(async function () {
      eventId = await createTestHackathon();
      
      // Time travel to start date
      const eventDetails = await hackathonPlatform.getEventDetails(eventId);
      await time.increaseTo(eventDetails.startDate);
      
      // Register teams
      teamId1 = await registerTeam(addr1, eventId, teamName1);
      teamId2 = await registerTeam(addr3, eventId, teamName2);
      teamId3 = await registerTeam(addr5, eventId, teamName3);
      
      // Close voting and move to end date
      await hackathonPlatform.setVotingState(eventId, false);
      await time.increaseTo(eventDetails.endDate + BigInt(1));
      
      // Finalize results - automatic ranking
      await hackathonPlatform.finalizeResults(eventId, false, []);
    });

    it("Should distribute prize to team leader", async function () {
      // Get balance before
      const balanceBefore = await ethers.provider.getBalance(addr1.address);
      
      // Distribute prize to first place team
      await expect(hackathonPlatform.distributePrize(eventId, teamId1))
        .to.emit(hackathonPlatform, "PrizeDistributed")
        .withArgs(eventId, teamId1, addr1.address, ethers.parseEther("5")); // 5 ETH is 50% of 10 ETH prize pool
      
      // Check balance after
      const balanceAfter = await ethers.provider.getBalance(addr1.address);
      // In v6, we use bigint's standard arithmetic operators
      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("5"));
      
      // Check prize distributed flag
      const teamDetails = await hackathonPlatform.getTeamDetails(eventId, teamId1);
      expect(teamDetails.prizeDistributed).to.equal(true);
    });

    it("Should prevent distributing prize twice", async function () {
      // Distribute prize first time
      await hackathonPlatform.distributePrize(eventId, teamId1);
      
      // Try to distribute again
      await expect(hackathonPlatform.distributePrize(eventId, teamId1))
        .to.be.revertedWith("Prize already distributed");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow admin to add an organizer", async function () {
      await hackathonPlatform.addOrganizer(addr1.address);
      expect(await hackathonPlatform.hasRole(await hackathonPlatform.ORGANIZER_ROLE(), addr1.address)).to.equal(true);
    });

    it("Should allow admin to remove an organizer", async function () {
      await hackathonPlatform.addOrganizer(addr1.address);
      await hackathonPlatform.removeOrganizer(addr1.address);
      expect(await hackathonPlatform.hasRole(await hackathonPlatform.ORGANIZER_ROLE(), addr1.address)).to.equal(false);
    });
  });

  describe("Cancellation", function () {
    it("Should allow canceling an event and refund prize pool", async function () {
      const eventId = await createTestHackathon();
      
      // Get balance before
      const balanceBefore = await ethers.provider.getBalance(owner.address);
      
      // Cancel the event
      await hackathonPlatform.cancelHackathon(eventId);
      
      // Check event is inactive
      const eventDetails = await hackathonPlatform.getEventDetails(eventId);
      expect(eventDetails.isActive).to.equal(false);
      
      // Check balance after (accounting for gas costs)
      const balanceAfter = await ethers.provider.getBalance(owner.address);
      expect(balanceAfter).to.be.gt(balanceBefore); // Should be greater due to refund
    });

    it("Should prevent cancellation after results are finalized", async function () {
      const eventId = await createTestHackathon();
      
      // Time travel to start date
      const eventDetails = await hackathonPlatform.getEventDetails(eventId);
      await time.increaseTo(eventDetails.startDate);
      
      // Register at least 3 teams
      await registerTeam(addr1, eventId, teamName1);
      await registerTeam(addr2, eventId, teamName2);
      await registerTeam(addr3, eventId, teamName3);
      
      // Time travel to end date
      await time.increaseTo(eventDetails.endDate + BigInt(1));
      
      // Finalize results
      await hackathonPlatform.finalizeResults(eventId, false, []);
      
      // Try to cancel
      await expect(hackathonPlatform.cancelHackathon(eventId))
        .to.be.revertedWith("Results already finalized");
    });
  });

  // Helper functions
  async function createTestHackathon() {
    const currentTime = await time.latest();
    const startDate = currentTime + 86400; // Start 1 day later
    const endDate = startDate + 604800; // End 1 week after start
    
    await hackathonPlatform.createHackathon(
      hackathonName,
      description,
      prizePool,
      firstPrizePercent,
      secondPrizePercent,
      thirdPrizePercent,
      maxTeamSize,
      maxTeams,
      startDate,
      endDate,
      { value: prizePool }
    );
    
    return 1n; // First event ID
  }

  async function registerTeam(signer, eventId, name) {
    const tx = await hackathonPlatform.connect(signer).registerTeam(eventId, name);
    const receipt = await tx.wait();
    
    // Find the TeamRegistered event - different event handling in v6
    const event = receipt.logs.find(log => {
      try {
        // Try to parse the log as a TeamRegistered event
        const parsedLog = hackathonPlatform.interface.parseLog({
          topics: log.topics,
          data: log.data
        });
        return parsedLog?.name === 'TeamRegistered';
      } catch (e) {
        return false; // Not our event or couldn't parse
      }
    });
    
    if (event) {
      const parsedEvent = hackathonPlatform.interface.parseLog({
        topics: event.topics,
        data: event.data
      });
      return parsedEvent.args.teamId;
    }
    
    throw new Error("TeamRegistered event not found");
  }

  async function joinTeam(signer, eventId, teamId) {
    await hackathonPlatform.connect(signer).joinTeam(eventId, teamId);
  }
});