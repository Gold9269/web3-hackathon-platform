import React, { useEffect, useState } from 'react'
import { Link, useParams } from "react-router-dom";
import organizeService from '../backend/organize.js'
import authService from '../backend/auth.js'
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  Clock,
  Trophy,
  MessageCircle,
  FileText,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Star,
  Award,
  Gem,
  BookOpen,
  ShieldCheck,
} from "lucide-react";

function EventPage() {
  const [activeTab, setActiveTab] = useState("details");
  const [openFAQIndex, setOpenFAQIndex] = useState(null);
  const [user,setUser] = useState(null)
  const [round,setRound] = useState(null);
  
  

  useEffect(()=>{
    const fetchData = async()=>{
      try {
        const response = await authService.getCurrentUser();
        setUser(response.user); // ✅ Update state with user data
      } catch (error) {
        console.error("❌ Error fetching user:", error);
      }
    }
    fetchData()
  },[])

  const tabs = [
    {
      id: "details",
      label: "Details & Deadlines",
      icon: <BookOpen size={18} />,
    },
    { id: "stages", label: "Stages", icon: <Gem size={18} /> },
    { id: "prizes", label: "Prizes", icon: <Award size={18} /> },
    { id: "faqs", label: "FAQs", icon: <ShieldCheck size={18} /> },
  ];




  const { id } = useParams();
  const [isOwner,setIsOwner] = useState(false)
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(()=>{
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await organizeService.getHackathon(id);
        if (response && response.success) {
          setHackathon(response.hackathon);
        } else {
          setError("Failed to load hackathon details");
        }
      } catch (err) {
        setError(err.message || "An error occurred");
        console.error("Error fetching hackathon:", err);
      } finally {
        setLoading(false);
      }}
      fetchData();
  },[])
  
  //checking the owner
  useEffect(() => {
    if (!user || !user.ownedHackathons || !hackathon) return; // ✅ Ensure both user & hackathon exist
  
    const isUserOwner = user.ownedHackathons.some(
      (hackathonId) => hackathonId.toString() === hackathon._id
    );
  
    setIsOwner(isUserOwner);
  }, [user, hackathon]);

  useEffect(()=>{
    const fetchRound = async ()=>{
      const response = await organizeService.getRounds(id)
      setRound(response)
    }
    fetchRound()
  },[])

  console.log(round);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!hackathon) return <div>Hackathon not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 dark:from-gray-900 dark:to-amber-900/10">
      {/* Hero Banner */}
      <div className="relative h-[600px] overflow-hidden bg-gradient-to-br from-amber-400/40 to-amber-600/50 ">
        <motion.div
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              `url(${hackathon.banner})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/30" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center text-white"
        >
          

          <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-amber-400 to-white bg-clip-text text-transparent">
              {hackathon.name}
            </span>
            <br />
            <span className="text-4xl md:text-5xl font-medium">Season 5</span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 max-w-2xl text-amber-100 leading-relaxed">
            Empowering Women Engineers through Mentorship & Career Opportunities
          </p>

          <div className="flex flex-wrap gap-6 items-center">
            {isOwner?<Link to={`/${hackathon._id}/rounds/add`}><motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group px-8 py-4 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold rounded-xl shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 flex items-center gap-3"
            >
              <span>Start Round</span>
              <ChevronRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </motion.button></Link>
            :
            <Link to={`/${hackathon._id}/participants`}><motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group px-8 py-4 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold rounded-xl shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 flex items-center gap-3"
            >
              <span>Register Now</span>
              <ChevronRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </motion.button></Link>}
            

            <div className="flex items-center gap-8 text-amber-100">
              <div className="flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-lg bg-white/5">
                <Users className="h-5 w-5" />
                <span>29,898 registered</span>
              </div>
              <div className="flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-lg bg-white/5">
                <Calendar className="h-5 w-5" />
                <span>Ends {hackathon.finaleDate}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Stats */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-7xl mx-auto px-4 -translate-y-12 mb-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {[
            { icon: <Trophy />, label: "Prize Pool", value: `${hackathon.prizePool}` },
            { icon: <Users />, label: "Team Size", value: `${hackathon.maxTeamSize}` },
            { icon: <Clock />, label: "Deadline", value: `${hackathon.finaleDate}` },
            { icon: <Star />, label: "Level", value: "Beginner Friendly" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-xl">
                  {React.cloneElement(stat.icon, {
                    className: "h-6 w-6 text-amber-600 dark:text-amber-400",
                  })}
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? "bg-amber-500 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              whileHover={{ scale: activeTab === tab.id ? 1 : 1.05 }}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Animated Tab Content */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-amber-100 dark:border-amber-900/50"
          >
            {activeTab === "details" && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
                  Program Overview
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                      {hackathon.description}
                    </p>
                    <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                      <h3 className="text-xl font-bold mb-4">
                        Eligibility Criteria
                      </h3>
                      <ul className="space-y-4">
                        {[
                          "Women in 2nd year of B.Tech/B.E. (CS/IT related branches)",
                          "Minimum 7 CGPA or 70% aggregate",
                          "Basic programming knowledge required",
                        ].map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {round?.length > 0 ? (
  <div className="p-8 bg-gradient-to-br from-amber-100 to-white dark:from-amber-900/30 dark:to-gray-800 rounded-xl shadow-lg">
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      🏆 Current / Upcoming Round
    </h3>
    <div className="space-y-6">
      {round.map((item) => (
        <div
          key={item._id}
          className="flex items-center gap-6 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
        >
          {/* Round Dates */}
          <div className="w-20 h-20 bg-amber-500/10 rounded-lg flex flex-col items-center justify-center text-center">
            <span className="text-amber-600 dark:text-amber-400 font-semibold text-sm">
              📅 Start:
            </span>
            <span className="text-gray-700 dark:text-gray-300 text-sm">
              {new Date(item.startDate).toLocaleDateString()}
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold text-sm mt-2">
              ⏳ End:
            </span>
            <span className="text-gray-700 dark:text-gray-300 text-sm">
              {new Date(item.endDate).toLocaleDateString()}
            </span>
          </div>

          {/* Round Details */}
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              🔹 {item.roundName}
            </h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
              Round Number: <strong>{item.roundNumber}</strong>
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
              🏅 <span className="font-medium">Judging Criteria:</span> {item.judgingCriteria}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
) : null}

                  
                </div>
              </div>
            )}

            {/* Other tabs content with similar enhanced structure */}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default EventPage



