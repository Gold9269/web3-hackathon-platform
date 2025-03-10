// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title HackathonPlatform
 * @dev Platform for organizing hackathons with tiered prize distribution and NFT certificates
 */
contract HackathonPlatform is ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;
    using Strings for uint256;

    bytes32 public constant ORGANIZER_ROLE = keccak256("ORGANIZER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    Counters.Counter private _eventIds;
    Counters.Counter private _tokenIds;

    // Structures
    struct Team {
        uint256 id;
        string name;
        address teamLeader;
        uint256 memberCount;
        uint256 votes;
        uint256 rank;        // Final rank (1 = first place, 2 = second place, etc.)
        uint256 prizeAmount; // Amount won (in wei)
        bool prizeDistributed;
        bool isRegistered;
    }

    struct HackathonEvent {
        uint256 id;
        address organizer;
        string name;
        string description;
        uint256 prizePool;       // Total prize pool in wei
        uint256 firstPrize;      // Amount for 1st place in wei
        uint256 secondPrize;     // Amount for 2nd place in wei
        uint256 thirdPrize;      // Amount for 3rd place in wei
        uint256 maxTeamSize;
        uint256 maxTeams;
        uint256 teamCount;
        uint256 startDate;
        uint256 endDate;
        bool isActive;
        bool votingOpen;
        bool resultsFinalized;
        bool isPublished;
    }

    // Main storage variables
    mapping(uint256 => HackathonEvent) public hackathonEvents;
    mapping(uint256 => mapping(uint256 => Team)) public teams; // eventId => teamId => Team
    // Additional mappings for team and voting management
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public teamMembers; // eventId => teamId => member => isMember
    mapping(uint256 => mapping(uint256 => address[])) public teamMembersList; // eventId => teamId => member addresses
    mapping(uint256 => mapping(address => bool)) public hasRegistered; // eventId => address => hasRegistered
    mapping(uint256 => mapping(address => uint256)) public participantToTeam; // eventId => address => teamId
    mapping(uint256 => mapping(address => bool)) public hasVoted; // eventId => address => hasVoted
    mapping(uint256 => uint256[]) public finalRankings; // eventId => array of teamIds in rank order
    
    // Base URI for NFT metadata
    string private _baseTokenURI;

    // Events
    event HackathonCreated(uint256 indexed eventId, string name, address organizer);
    event HackathonPublished(uint256 indexed eventId);
    event TeamRegistered(uint256 indexed eventId, uint256 teamId, string name, address teamLeader);
    event MemberJoined(uint256 indexed eventId, uint256 teamId, address member);
    event VoteCast(uint256 indexed eventId, address voter, uint256 teamId);
    event VotingStateChanged(uint256 indexed eventId, bool isOpen);
    event ResultsFinalized(uint256 indexed eventId, uint256[] rankedTeamIds);
    event PrizeDistributed(uint256 indexed eventId, uint256 teamId, address recipient, uint256 amount);
    event NFTAwarded(uint256 indexed eventId, uint256 teamId, address recipient, uint256 tokenId, uint256 rank);

    /**
     * @dev Initialize the contract with deployer as admin
     * @param baseURI Base URI for NFT metadata
     */
    constructor(string memory baseURI) ERC721("HackathonAward", "HACK") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _baseTokenURI = baseURI;
    }

    // ========================
    // Modifiers
    // ========================

    modifier onlyOrganizer(uint256 eventId) {
        require(
            hackathonEvents[eventId].organizer == msg.sender || 
            hasRole(ADMIN_ROLE, msg.sender),
            "HackathonPlatform: caller is not the event organizer or admin"
        );
        _;
    }

    modifier eventExists(uint256 eventId) {
        require(eventId > 0 && eventId <= _eventIds.current(), "HackathonPlatform: event does not exist");
        _;
    }

    modifier eventActive(uint256 eventId) {
        require(hackathonEvents[eventId].isActive, "HackathonPlatform: event is not active");
        _;
    }

    modifier eventPublished(uint256 eventId) {
        require(hackathonEvents[eventId].isPublished, "HackathonPlatform: event is not published");
        _;
    }

    modifier registrationOpen(uint256 eventId) {
        require(
            hackathonEvents[eventId].isActive && 
            hackathonEvents[eventId].isPublished && 
            !hackathonEvents[eventId].votingOpen &&
            block.timestamp >= hackathonEvents[eventId].startDate &&
            block.timestamp <= hackathonEvents[eventId].endDate,
            "HackathonPlatform: registration is not open"
        );
        _;
    }

    // ========================
    // Admin Functions
    // ========================

    /**
     * @dev Grant organizer role to an address
     * @param account The address to grant the role to
     */
    function addOrganizer(address account) external onlyRole(ADMIN_ROLE) {
        require(account != address(0), "Invalid address");
        grantRole(ORGANIZER_ROLE, account);
    }

    /**
     * @dev Revoke organizer role from an address
     * @param account The address to revoke the role from
     */
    function removeOrganizer(address account) external onlyRole(ADMIN_ROLE) {
        revokeRole(ORGANIZER_ROLE, account);
    }

    /**
     * @dev Set the base URI for NFT metadata
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) external onlyRole(ADMIN_ROLE) {
        _baseTokenURI = baseURI;
    }

    // ========================
    // Event Management Functions
    // ========================

    /**
     * @dev Create a new hackathon event
     * @param name Event name
     * @param description Event description
     * @param prizePool Total prize pool amount in wei
     * @param firstPrizePercent Percentage for first prize (out of 100)
     * @param secondPrizePercent Percentage for second prize (out of 100)
     * @param thirdPrizePercent Percentage for third prize (out of 100)
     * @param maxTeamSize Maximum number of members per team
     * @param maxTeams Maximum number of teams allowed
     * @param startDate Start timestamp of the event
     * @param endDate End timestamp of the event
     * @return eventId The ID of the created event
     */
    function createHackathon(
        string memory name,
        string memory description,
        uint256 prizePool,
        uint8 firstPrizePercent,
        uint8 secondPrizePercent,
        uint8 thirdPrizePercent,
        uint256 maxTeamSize,
        uint256 maxTeams,
        uint256 startDate,
        uint256 endDate
    ) external payable returns (uint256) {
        require(hasRole(ORGANIZER_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender), 
            "Caller is not an organizer or admin");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(firstPrizePercent + secondPrizePercent + thirdPrizePercent == 100, "Prize percentages must total 100");
        require(msg.value == prizePool, "Sent value must match prize pool");
        require(startDate < endDate, "End date must be after start date");
        require(startDate > block.timestamp, "Start date must be in the future");
        require(maxTeamSize > 0, "Max team size must be greater than 0");
        require(maxTeams >= 3, "Must allow at least 3 teams");
        
        _eventIds.increment();
        uint256 eventId = _eventIds.current();
        
        HackathonEvent storage hackathon = hackathonEvents[eventId];
        hackathon.id = eventId;
        hackathon.organizer = msg.sender;
        hackathon.name = name;
        hackathon.description = description;
        hackathon.prizePool = prizePool;
        hackathon.maxTeamSize = maxTeamSize;
        hackathon.maxTeams = maxTeams;
        hackathon.startDate = startDate;
        hackathon.endDate = endDate;
        hackathon.isActive = true;
        hackathon.isPublished = true; // false
        
        // Calculate prize amounts
        hackathon.firstPrize = (prizePool * firstPrizePercent) / 100;
        hackathon.secondPrize = (prizePool * secondPrizePercent) / 100;
        hackathon.thirdPrize = (prizePool * thirdPrizePercent) / 100;
        
        emit HackathonCreated(eventId, name, msg.sender);
        return eventId;
    }

    /**
     * @dev Publish a hackathon event to open registrations
     * @param eventId ID of the event to publish
     */
    function publishHackathon(uint256 eventId) external eventExists(eventId) {
        HackathonEvent storage hackathon = hackathonEvents[eventId];
        require(!hackathon.isPublished, "Event already published");
        require(hackathon.isActive, "Event is not active");
        
        hackathon.isPublished = true;
        emit HackathonPublished(eventId);
    }

    /**
     * @dev Cancel a hackathon event and refund the prize pool
     * @param eventId ID of the event to cancel
     */
    function cancelHackathon(uint256 eventId) external eventExists(eventId) {
        HackathonEvent storage hackathon = hackathonEvents[eventId];
        require(hackathon.isActive, "Event already inactive");
        require(!hackathon.resultsFinalized, "Results already finalized");
        
        hackathon.isActive = false;
        
        // Refund prize pool to organizer
        (bool success, ) = hackathon.organizer.call{value: hackathon.prizePool}("");
        require(success, "Transfer failed");
    }

    // ========================
    // Team Management Functions
    // ========================

    /**
     * @dev Register a new team for an event
     * @param eventId ID of the event
     * @param teamName Name of the team
     * @return teamId The ID of the registered team
     */
    function registerTeam(uint256 eventId, string memory teamName) 
        external 
        eventExists(eventId) 
        eventActive(eventId)
        eventPublished(eventId)
        registrationOpen(eventId)
        returns (uint256) 
    {
        require(bytes(teamName).length > 0, "Team name cannot be empty");
        
        HackathonEvent storage hackathon = hackathonEvents[eventId];
        
        require(!hasRegistered[eventId][msg.sender], "Already registered for this event");
        require(hackathon.teamCount < hackathon.maxTeams, "Maximum teams reached");
        
        uint256 teamId = hackathon.teamCount;
        hackathon.teamCount++;
        
        Team storage team = teams[eventId][teamId];
        team.id = teamId;
        team.name = teamName;
        team.teamLeader = msg.sender;
        team.memberCount = 1;
        team.isRegistered = true;
        
        // Add member to team
        teamMembers[eventId][teamId][msg.sender] = true;
        teamMembersList[eventId][teamId].push(msg.sender);
        
        // Mark user as registered
        hasRegistered[eventId][msg.sender] = true;
        participantToTeam[eventId][msg.sender] = teamId;
        
        emit TeamRegistered(eventId, teamId, teamName, msg.sender);
        emit MemberJoined(eventId, teamId, msg.sender);
        
        return teamId;
    }

    /**
     * @dev Join an existing team
     * @param eventId ID of the event
     * @param teamId ID of the team to join
     */
    function joinTeam(uint256 eventId, uint256 teamId) 
        external 
        eventExists(eventId) 
        eventActive(eventId)
        eventPublished(eventId)
        registrationOpen(eventId)
    {
        Team storage team = teams[eventId][teamId];
        HackathonEvent storage hackathon = hackathonEvents[eventId];
        
        require(team.isRegistered, "Team does not exist");
        require(!hasRegistered[eventId][msg.sender], "Already registered for this event");
        require(team.memberCount < hackathon.maxTeamSize, "Team is full");
        
        // Add member to team
        teamMembers[eventId][teamId][msg.sender] = true;
        teamMembersList[eventId][teamId].push(msg.sender);
        team.memberCount++;
        
        // Mark user as registered
        hasRegistered[eventId][msg.sender] = true;
        participantToTeam[eventId][msg.sender] = teamId;
        
        emit MemberJoined(eventId, teamId, msg.sender);
    }

    /**
     * @dev Get all members of a team
     * @param eventId ID of the event
     * @param teamId ID of the team
     * @return Array of team member addresses
     */
    function getTeamMembers(uint256 eventId, uint256 teamId) 
        external 
        view 
        eventExists(eventId) 
        returns (address[] memory) 
    {
        require(teams[eventId][teamId].isRegistered, "Team does not exist");
        return teamMembersList[eventId][teamId];
    }

    // ========================
    // Voting Functions
    // ========================

    /**
     * @dev Set the voting state (open/closed) for an event
     * @param eventId ID of the event
     * @param votingState True to open voting, false to close
     */
    function setVotingState(uint256 eventId, bool votingState) 
        external 
        eventExists(eventId) 
        eventActive(eventId)
    {
        HackathonEvent storage hackathon = hackathonEvents[eventId];
        require(hackathon.isPublished, "Event not published");
        require(block.timestamp >= hackathon.startDate, "Event has not started");
        require(!hackathon.resultsFinalized, "Results already finalized");
        
        hackathon.votingOpen = votingState;
        
        emit VotingStateChanged(eventId, votingState);
    }

    /**
     * @dev Cast a vote for a team
     * @param eventId ID of the event
     * @param teamId ID of the team to vote for
     */
    function castVote(uint256 eventId, uint256 teamId) 
        external 
        eventExists(eventId) 
        eventActive(eventId)
        eventPublished(eventId)
    {
        HackathonEvent storage hackathon = hackathonEvents[eventId];
        require(hackathon.votingOpen, "Voting is not open");
        require(!hackathon.resultsFinalized, "Results already finalized");
        require(hasRegistered[eventId][msg.sender], "Not registered for this event");
        require(!hasVoted[eventId][msg.sender], "Already voted");
        require(teams[eventId][teamId].isRegistered, "Team does not exist");
        
        // Cannot vote for your own team
        uint256 senderTeamId = participantToTeam[eventId][msg.sender];
        require(teamId != senderTeamId, "Cannot vote for your own team");
        
        // Record vote
        teams[eventId][teamId].votes++;
        hasVoted[eventId][msg.sender] = true;
        
        emit VoteCast(eventId, msg.sender, teamId);
    }

    /**
     * @dev Finalize the results of an event and determine winners
     * @param eventId ID of the event
     */
    /**
 * @dev Finalize the results of an event with option for organizer to choose winners
 * @param eventId ID of the event
 * @param useManualRanking Boolean to determine if organizer's manual ranking should be used
 * @param manualTopTeamIds Optional array of team IDs for manually selected top 3 teams (in order)
 */
function finalizeResults(
    uint256 eventId,
    bool useManualRanking,
    uint256[] memory manualTopTeamIds
) 
    external 
    eventExists(eventId) 
    eventActive(eventId)
{
    HackathonEvent storage hackathon = hackathonEvents[eventId];
    require(hackathon.isPublished, "Event not published");
    require(!hackathon.resultsFinalized, "Results already finalized");
    require(hackathon.teamCount >= 3, "Not enough teams registered");
    require(block.timestamp > hackathon.endDate || !hackathon.votingOpen, "Event still in progress or voting open");
    
    uint256[] memory teamIds;
    
    if (useManualRanking) {
        // Manual ranking by organizer
        require(manualTopTeamIds.length >= 3, "Must provide at least top 3 teams");
        
        // Validate that all provided team IDs exist
        for (uint256 i = 0; i < manualTopTeamIds.length && i < 3; i++) {
            require(manualTopTeamIds[i] < hackathon.teamCount, "Invalid team ID");
            require(teams[eventId][manualTopTeamIds[i]].isRegistered, "Team does not exist");
            
            // Check for duplicate team IDs in top 3
            for (uint256 j = 0; j < i; j++) {
                require(manualTopTeamIds[j] != manualTopTeamIds[i], "Duplicate team in ranking");
            }
        }
        
        // For teams not in the top 3, add them to the ranking array
        teamIds = new uint256[](hackathon.teamCount);
        
        // First add the manual top 3
        for (uint256 i = 0; i < 3; i++) {
            teamIds[i] = manualTopTeamIds[i];
        }
        
        // Then add remaining teams sorted by votes
        uint256 filledCount = 3;
        for (uint256 i = 0; i < hackathon.teamCount; i++) {
            bool isInTop3 = false;
            for (uint256 j = 0; j < 3; j++) {
                if (i == manualTopTeamIds[j]) {
                    isInTop3 = true;
                    break;
                }
            }
            
            if (!isInTop3 && filledCount < teamIds.length) {
                teamIds[filledCount] = i;
                filledCount++;
            }
        }
        
        // Sort the remaining teams (after index 2) by votes
        for (uint256 i = 3; i < teamIds.length; i++) {
            for (uint256 j = 3; j < teamIds.length - i + 3 - 1; j++) {
                if (teams[eventId][teamIds[j]].votes < teams[eventId][teamIds[j + 1]].votes) {
                    uint256 temp = teamIds[j];
                    teamIds[j] = teamIds[j + 1];
                    teamIds[j + 1] = temp;
                }
            }
        }
    } else {
        // Automatic ranking based on votes
        teamIds = new uint256[](hackathon.teamCount);
        for (uint256 i = 0; i < hackathon.teamCount; i++) {
            teamIds[i] = i;
        }
        
        // Simple bubble sort to rank teams by votes (descending)
        for (uint256 i = 0; i < teamIds.length; i++) {
            for (uint256 j = 0; j < teamIds.length - i - 1; j++) {
                if (teams[eventId][teamIds[j]].votes < teams[eventId][teamIds[j + 1]].votes) {
                    uint256 temp = teamIds[j];
                    teamIds[j] = teamIds[j + 1];
                    teamIds[j + 1] = temp;
                }
            }
        }
    }
    
    // Assign rankings and prize amounts to top 3 teams
    for (uint256 i = 0; i < teamIds.length && i < 3; i++) {
        Team storage team = teams[eventId][teamIds[i]];
        team.rank = i + 1;
        
        // Assign prizes based on rank
        if (i == 0) { // First place
            team.prizeAmount = hackathon.firstPrize;
        } else if (i == 1) { // Second place
            team.prizeAmount = hackathon.secondPrize;
        } else if (i == 2) { // Third place
            team.prizeAmount = hackathon.thirdPrize;
        }
    }
    
    // Store final rankings
    finalRankings[eventId] = teamIds;
    hackathon.resultsFinalized = true;
    
    emit ResultsFinalized(eventId, teamIds);
}
    /**
     * @dev Distribute prizes to winning teams
     * @param eventId ID of the event
     * @param teamId ID of the team to distribute prize to
     */
    function distributePrize(uint256 eventId, uint256 teamId) 
        external 
        eventExists(eventId) 
        eventActive(eventId)
    {
        HackathonEvent storage hackathon = hackathonEvents[eventId];
        Team storage team = teams[eventId][teamId];
        
        require(hackathon.resultsFinalized, "Results not finalized");
        require(team.rank > 0 && team.rank <= 3, "Team is not a winner");
        require(!team.prizeDistributed, "Prize already distributed");
        require(team.prizeAmount > 0, "No prize amount set");
        
        // Mark as distributed
        team.prizeDistributed = true;
        
        // Transfer prize to team leader
        (bool success, ) = team.teamLeader.call{value: team.prizeAmount}("");
        require(success, "Prize transfer failed");
        
        emit PrizeDistributed(eventId, teamId, team.teamLeader, team.prizeAmount);
    }

    /**
     * @dev Award NFT certificates to a team
     * @param eventId ID of the event
     * @param teamId ID of the team
     */
    function awardNFTs(uint256 eventId, uint256 teamId) 
        external 
        eventExists(eventId) 
        eventActive(eventId)
    {
        HackathonEvent storage hackathon = hackathonEvents[eventId];
        Team storage team = teams[eventId][teamId];
        
        require(hackathon.resultsFinalized, "Results not finalized");
        require(team.rank > 0 && team.rank <= 3, "Team is not a winner");
        
        // Award NFTs to each team member
        address[] memory members = teamMembersList[eventId][teamId];
        for (uint256 i = 0; i < members.length; i++) {
            _tokenIds.increment();
            uint256 tokenId = _tokenIds.current();
            
            _mint(members[i], tokenId);
            
            // Set token URI with metadata reflecting the event and ranking
            string memory tokenURI = string(abi.encodePacked(
                _baseTokenURI,
                eventId.toString(),
                "/",
                team.rank.toString(),
                "/",
                tokenId.toString()
            ));
            _setTokenURI(tokenId, tokenURI);
            
            emit NFTAwarded(eventId, teamId, members[i], tokenId, team.rank);
        }
    }

    /**
     * @dev Get the final rankings for an event
     * @param eventId ID of the event
     * @return Array of team IDs in rank order
     */
    function getEventRankings(uint256 eventId) 
        external 
        view 
        eventExists(eventId) 
        returns (uint256[] memory) 
    {
        require(hackathonEvents[eventId].resultsFinalized, "Results not finalized");
        return finalRankings[eventId];
    }
    function getEventDetails(uint256 eventId) 
        external 
        view 
        eventExists(eventId) 
        returns (
            string memory name,
            string memory description,
            uint256 prizePool,
            uint256 startDate,
            uint256 endDate,
            bool isActive,
            bool votingOpen,
            bool resultsFinalized,
            uint256 teamCount,
            uint256 maxTeams
        ) 
    {
        HackathonEvent storage hackathon = hackathonEvents[eventId];
        return (
            hackathon.name,
            hackathon.description,
            hackathon.prizePool,
            hackathon.startDate,
            hackathon.endDate,
            hackathon.isActive,
            hackathon.votingOpen,
            hackathon.resultsFinalized,
            hackathon.teamCount,
            hackathon.maxTeams
        );
    }
    function getTeamDetails(uint256 eventId, uint256 teamId) 
        external 
        view 
        eventExists(eventId) 
        returns (
            string memory name,
            address teamLeader,
            uint256 memberCount,
            uint256 votes,
            uint256 rank,
            uint256 prizeAmount,
            bool prizeDistributed
        ) 
    {
        Team storage team = teams[eventId][teamId];
        require(team.isRegistered, "Team does not exist");
        
        return (
            team.name,
            team.teamLeader,
            team.memberCount,
            team.votes,
            team.rank,
            team.prizeAmount,
            team.prizeDistributed
        );
    }

    /**
     * @dev Get all registered teams for an event
     * @param eventId ID of the event
     * @return Array of team IDs
     */
    function getEventTeams(uint256 eventId) 
        external 
        view 
        eventExists(eventId) 
        returns (uint256[] memory) 
    {
        HackathonEvent storage hackathon = hackathonEvents[eventId];
        uint256[] memory teamIds = new uint256[](hackathon.teamCount);
        
        for (uint256 i = 0; i < hackathon.teamCount; i++) {
            teamIds[i] = i;
        }
        
        return teamIds;
    }
    
    /**
     * @dev Get participant's team for an event
     * @param eventId ID of the event
     * @param participant Address of the participant
     * @return teamId ID of the participant's team
     */
    function getParticipantTeam(uint256 eventId, address participant) 
        external 
        view 
        eventExists(eventId) 
        returns (uint256) 
    {
        require(hasRegistered[eventId][participant], "Not registered for this event");
        return participantToTeam[eventId][participant];
    }

    /**
     * @dev Returns whether a user has voted in an event
     * @param eventId ID of the event
     * @param participant Address of the participant
     * @return True if the participant has voted
     */
    function hasParticipantVoted(uint256 eventId, address participant) 
        external 
        view 
        eventExists(eventId) 
        returns (bool) 
    {
        return hasVoted[eventId][participant];
    }

    /**
     * @dev Get the base URI for token metadata
     * @return Base URI string
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Override for access control on token transfers
     */
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) 
        internal 
        override 
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        // Only allow transfers from zero address (minting) or by admin
        require(
            from == address(0) || hasRole(ADMIN_ROLE, msg.sender),
            "HackathonPlatform: NFTs can only be transferred by admins"
        );
    }

    /**
     * @dev Required override for solidity 
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
