// src/store/contractSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as contractUtils from '../contracts/contractUtils';

// ====== ASYNC ACTIONS (THUNKS) ======
// These handle asynchronous operations like blockchain interactions

//Connect to the user's wallet
export const connectWallet = createAsyncThunk(
  'contract/connectWallet',
  async (_, { rejectWithValue }) => {
    try {
      // Try to connect to the wallet
      const result = await contractUtils.initializeContract();
      
      // If connection failed, return the error
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      
      // If successful, return the wallet address
      return { address: result.address };
    } catch (error) {
      // Handle any unexpected errors
      return rejectWithValue(error.message || 'Failed to connect wallet');
    }
  }
);

//Get details of a specific hackathon event
export const fetchEventDetails = createAsyncThunk(
  'contract/fetchEventDetails',
  async (eventId, { rejectWithValue }) => {
    try {
      // Get event details from the blockchain
      const eventDetails = await contractUtils.getEventDetails(eventId);
      
      // Format the data into a more usable structure
      return {
        id: Number(eventId),
        name: eventDetails[0],
        description: eventDetails[1],
        prizePool: eventDetails[2].toString(),
        startDate: eventDetails[3].toNumber(),
        endDate: eventDetails[4].toNumber(),
        isActive: eventDetails[5],
        votingOpen: eventDetails[6],
        resultsFinalized: eventDetails[7],
        teamCount: eventDetails[8].toNumber(),
        maxTeams: eventDetails[9].toNumber()
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch event details');
    }
  }
);

//Get all teams participating in a hackathon
export const fetchEventTeams = createAsyncThunk(
  'contract/fetchEventTeams',
  async (eventId, { rejectWithValue }) => {
    try {
      // First get all team IDs for this event in the form of array
      const teamIds = await contractUtils.getEventTeams(eventId);
      const teams = [];
      
      // Then get details for each team
      for (const teamId of teamIds) {
        const teamDetails = await contractUtils.getTeamDetails(eventId, teamId);
        teams.push({
          id: Number(teamId),
          name: teamDetails[0],
          teamLeader: teamDetails[1],
          memberCount: teamDetails[2].toNumber(),
          votes: teamDetails[3].toNumber(),
          rank: teamDetails[4].toNumber(),
          prizeAmount: teamDetails[5].toString(),
          prizeDistributed: teamDetails[6]
        });
      }
      
      return teams;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch teams');
    }
  }
);

//Create a new hackathon event
export const createNewHackathon = createAsyncThunk(
  'contract/createHackathon',
  async (hackathonData, { rejectWithValue }) => {
    try {
      // Send transaction to create a new hackathon
      const tx = await contractUtils.createHackathon(
        hackathonData.name,
        hackathonData.description,
        hackathonData.prizePool,
        hackathonData.firstPrizePercent,
        hackathonData.secondPrizePercent,
        hackathonData.thirdPrizePercent,
        hackathonData.maxTeamSize,
        hackathonData.maxTeams,
        hackathonData.startDate,
        hackathonData.endDate
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Find the event that was emitted and get the new event ID
      const event = receipt.events.find(e => e.event === 'HackathonCreated');
      const eventId = event.args.eventId.toNumber();
      
      // Return the new hackathon data along with its ID
      return { eventId, ...hackathonData };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create hackathon');
    }
  }
);

export const registerNewTeam = createAsyncThunk(
  'contract/registerTeam',
  async ({ eventId, teamName }, { rejectWithValue }) => {
    try {
      console.log("Registering team on blockchain:", { eventId, teamName });

      // 1️⃣ Ensure contract is initialized
      const initResult = await contractUtils.initializeContract();
      if (!initResult.success) {
        throw new Error("Contract initialization failed: " + initResult.error);
      }

      // 2️⃣ Call contract function correctly
      const tx = await contractUtils.registerTeam(eventId, teamName);
      console.log("Transaction submitted:", tx.hash);

      // 3️⃣ Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("Transaction mined:", receipt);
      return {eventId, teamName };
    } catch (error) {
      console.error("Error registering team:", error);
      return rejectWithValue(error.message || 'Failed to register team');
    }
  }
);

export const joinTeam = createAsyncThunk(
  'contract/joinTeam',
  async ({ eventId, teamId }, { rejectWithValue }) => {
    try {
      console.log("Attempting to join team with:", { eventId, teamId });

      // Ensure contract is initialized
      const initResult = await contractUtils.initializeContract();
      if (!initResult.success) {
        console.error("Contract initialization failed:", initResult.error);
        throw new Error("Contract initialization failed: " + initResult.error);
      }

      // Check if joinTeam function exists
      if (typeof contractUtils.joinTeam !== "function") {
        throw new Error("joinTeam function does not exist in contractUtils");
      }

      // Call the contract function
      const tx = await contractUtils.joinTeam(eventId, teamId);
      console.log("Transaction submitted:", tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("Transaction mined:", receipt);

      return { eventId, teamId };
    } catch (error) {
      console.error("Error joining team:", error);
      return rejectWithValue(error.message || "Failed to join team. Please check contract conditions.");
    }
  }
);


// ====== REDUX SLICE ======
// This manages the state for our blockchain interactions

const contractSlice = createSlice({
  name: 'contract',
  // Initial state when the app loads
  initialState: {
    isConnected: false,      // Whether we're connected to a wallet
    walletAddress: null,     // The user's wallet address
    currentEvent: null,      // The currently selected hackathon event
    teams: [],               // Teams in the current event
    loading: false,          // Whether we're currently loading data
    error: null              // Any error that occurred
  },
  
  // Regular actions (synchronous)
  reducers: {
    // Clear any error that might be showing
    clearError: (state) => {
      state.error = null;
    },
    // Reset the state when switching events or disconnecting
    resetState: (state) => {
      state.currentEvent = null;
      state.teams = [];
      state.error = null;
    }
  },
  
  // Handle the async action results
  extraReducers: (builder) => {
    builder
      // ==== Connect Wallet States ====
      .addCase(connectWallet.pending, (state) => {
        // When connection starts
        state.loading = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        // When connection succeeds
        state.loading = false;
        state.isConnected = true;
        state.walletAddress = action.payload.address;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        // When connection fails
        state.loading = false;
        state.error = action.payload || 'Failed to connect wallet';
      })
      
      // ==== Fetch Event Details States ====
      .addCase(fetchEventDetails.pending, (state) => {
        // When fetching starts
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventDetails.fulfilled, (state, action) => {
        // When fetching succeeds
        state.loading = false;
        state.currentEvent = action.payload;
      })
      .addCase(fetchEventDetails.rejected, (state, action) => {
        // When fetching fails
        state.loading = false;
        state.error = action.payload || 'Failed to fetch event details';
      })
      
      // ==== Fetch Teams States ====
      .addCase(fetchEventTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
      })
      .addCase(fetchEventTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch teams';
      })
      // ==== join team States ====
                // Add to your extraReducers in contractSlice.js
      .addCase(joinTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinTeam.fulfilled, (state, action) => {
        state.loading = false;
        // You might want to update state based on the team joined
      })
      .addCase(joinTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to join team';
      })
      
      // ==== Create Hackathon States ====
      .addCase(createNewHackathon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewHackathon.fulfilled, (state, action) => {
        state.loading = false;
        // Note: We don't update state here because you'd typically
        // navigate to the new event page after creation
      })
      .addCase(createNewHackathon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create hackathon';
      })
      
       // ==== Register Team States ====
       .addCase(registerNewTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerNewTeam.fulfilled, (state, action) => {
        state.loading = false;
        
        //Update state with the newly registered team
        state.teams.push({
          teamId: action.payload.teamId,
          eventId: action.payload.eventId,
          teamName: action.payload.teamName,
        });

        console.log("Redux state updated with new team:", action.payload);
      })
      .addCase(registerNewTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to register team';
      });
  }
});

// Export the regular actions
export const { clearError, resetState } = contractSlice.actions;

// Export the reducer to be used in the store
export default contractSlice.reducer;