import React, { useEffect, useState } from 'react';
import { Users, UserPlus, UserPlus2, X, Search } from 'lucide-react';
import participantService from '../backend/participant.js';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
// import { keccak256, toUtf8Bytes, toBigInt } from "ethers";
import * as contractUtils from '../contracts/contractUtils.js';
import { joinTeam, registerNewTeam } from '../store/contractSlice.js';
export default function ParticipantDashboard() {
    const {id} = useParams();
    
    const navigate = useNavigate();
    const dispatch=useDispatch();
    const [mockTeams, setMockTeams] = useState([]);
    const [filteredTeams, setFilteredTeams] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [teamCode, setTeamCode] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [teamid,setTeamid]=useState(0);

    useEffect(() => {
        const fetchData = async() => {
            const data = await participantService.getParticipants(id);
            const teamsData = Array.isArray(data) ? data : [];
            setMockTeams(teamsData);
            setFilteredTeams(teamsData);
        };
        fetchData();
    }, []);
    

    // Update filtered teams whenever search query or mockTeams change
    useEffect(() => {
        if (!mockTeams || mockTeams.length === 0) return;
    
        const filtered = mockTeams.filter(team =>
            team.teamName && team.teamName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    
        setFilteredTeams(filtered);
    }, [searchQuery, mockTeams]);
    const convertToUint256 = (mongoId) => {
        return BigInt("0x" + mongoId).toString(); // Convert MongoDB ID to uint256
    };
    const handleCreateTeam = async (e) => {
        e.preventDefault();
        // Handle team creation logic here
        try {
            //Blockchain Call
            // Ensure contract is initialized before calling dispatch
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            if (accounts.length === 0) {
                alert("No wallet connected! Please connect to MetaMask.");
                return;
            }
            await contractUtils.initializeContract();
            const response = await dispatch(registerNewTeam({ eventId: 1, teamName })).unwrap();

            console.log("Blockchain response:", response);

            // alert(`Team created successfully! ID: ${response.teamId}`);
            setShowCreateModal(false);
            setTeamName('');
        } catch (error) {
            console.error("Error creating team:", error);
            alert("Failed to create team: " + (error.message || "Unknown error"));
        }
        // setShowCreateModal(false);
        // setTeamName('');
    };
    const handleJoinTeam = async (e) => {
        e.preventDefault();
        // Handle team joining logic here
        try {
            console.log("helloJi");

            //Blockchain call

            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            if (accounts.length === 0) {
                alert("No wallet connected! Please connect to MetaMask.");
                return;
            }
            await contractUtils.initializeContract();
            const blockchainresponse=await dispatch(joinTeam({eventId:1,teamId:1})).unwrap();
            console.log("join team blockchaiin repsonse:",blockchainresponse);

            // const response = await participantService.joinTeam(teamCode);
    
            // if (response.success) {
            //     console.log('Joined Team:', response);
            //     setTeamid(response?.teamid);
    
            //     // Redirect user to their team page
            //     navigate(`/team/${response}`);
            // } else {
            //     // Handle different error cases based on the response message
            //     if (response.message === "You are already a member of this team" || 
            //         response.message === "You are already part of a team for this hackathon") {
                    
            //         // If user is already in a team, redirect them to that team's page
            //         console.log("User already in a team, redirecting...");
            //         navigate(`/team/${response.teamId}`);
            //     }
            //     if(response.message === "Team is already at maximum capacity")navigate("")
                
            //     // Show alert for other errors
            //     alert(response.message);
            // }
        } catch (error) {
            console.error('Error joining team:', error);
            // alert(error.response?.data?.message || 'Failed to join team. Please try again.');
        
        // Handle specific error types
        if (error.code === 'CALL_EXCEPTION') {
            alert("Contract call failed. This could be due to invalid parameters or contract restrictions.");
        } else {
            alert("Failed to join team: " + (error.message || "Unknown error"));
        }
        }
        // setShowJoinModal(false);
        // setTeamCode('');
    };
    
    
    return (
        <div className="pt-20 p-6 bg-gray-50 h-screen">
            {/* Dashboard Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search teams..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create Team
                    </button>
                </div>
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTeams.length > 0 ? (
                    filteredTeams.map((team) => (
                        <div
                            key={team.id || Math.random().toString()}
                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200"
                            onClick={()=>setShowJoinModal(true)}
                        >
                            <div className="p-5">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{team.teamName || 'Unnamed Team'}</h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{team.description || 'No description available'}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Users className="h-4 w-4 mr-1" />
                                        {team.memberIds.length || 0} members
                                    </div>
                                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                                        View Details →
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-10 text-gray-500">
                        No teams found. Create or join a team to get started.
                    </div>
                )}
            </div>

            {/* Create Team Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Create New Team</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTeam} className="p-4">
                            <div>
                                <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
                                    Team Name
                                </label>
                                <input
                                    type="text"
                                    id="teamName"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="Enter team name"
                                    required
                                />
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="mr-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Create Team
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Join Team Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Join Team</h3>
                            <button
                                onClick={() => setShowJoinModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleJoinTeam} className="p-4">
                            <div>
                                <label htmlFor="teamCode" className="block text-sm font-medium text-gray-700">
                                    Team Code
                                </label>
                                <input
                                    type="text"
                                    id="teamCode"
                                    value={teamCode}
                                    onChange={(e) => setTeamCode(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="Enter team code"
                                    required
                                />
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowJoinModal(false)}
                                    className="mr-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Join Team
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}