import React from 'react';
import { ArrowUpRight, Eye, Users, Clock, ArrowRight, Link } from 'lucide-react';
import organizeService from '../backend/organize.js';
import { useNavigate } from 'react-router-dom';

const Event = () => {
  const navigate = useNavigate();
  const [events, setEvents] = React.useState([]);

  
  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
          const data = await organizeService.getAllHackathons();
          setEvents(data);
      } catch (error) {
          console.error("Error fetching hackathons:", error);
      }
    }
    fetchEvents()
  },[]);

  
  // const engageCards = [
  //   { id: '1', title: 'General & Case Competitions', icon: 'https://img.icons8.com/color/96/bar-chart.png', createLink: '/create/competition' },
  //   { id: '2', title: 'Innovation Challenges', icon: 'https://img.icons8.com/color/96/innovation.png', createLink: '/create/innovation' },
  //   { id: '3', title: 'Quizzes', icon: 'https://img.icons8.com/color/96/quiz.png', createLink: '/create/quiz' },
  //   { id: '4', title: 'Hackathons & Coding Challenges', icon: 'https://img.icons8.com/color/96/code.png', createLink: '/create/hackathon' }
  // ];

  // const hireCards = [
  //   { id: '5', title: 'Jobs', icon: 'https://img.icons8.com/color/96/briefcase.png', createLink: '/create/job' },
  //   { id: '6', title: 'Internships', icon: 'https://img.icons8.com/color/96/internship.png', createLink: '/create/internship' },
  //   { id: '7', title: 'Hiring Challenges', icon: 'https://img.icons8.com/color/96/test-passed.png', createLink: '/create/hiring-challenge' }
  // ];

  // const competitions = [
  //   { id: '1',
  //       title: 'Lawyerr.ai Case Study Challenge: Revolutionizing Legal Tech',
  //       organizer: 'Techhalo',
  //       logo: 'https://img.icons8.com/color/96/law.png',
  //       bannerImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
  //       type: 'Online',
  //       pricing: 'Free',
  //       views: 353,
  //       applicants: 6,
  //       daysLeft: 6,
  //       link: '#',
  //       bgColor: 'bg-purple-600' },

  //   { id: '2',
  //   title: 'InnoSpark 2025: National Level Ideathon',
  //   organizer: 'Saraswati College of Engineering, Kharghar',
  //   logo: 'https://img.icons8.com/color/96/idea.png',
  //   bannerImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
  //   type: 'Offline',
  //   pricing: 'Free',
  //   views: 245,
  //   applicants: 6,
  //   daysLeft: 11,
  //   link: '#',
  //   bgColor: 'bg-pink-600' },

  //   {
  //       id: '3',
  //   title: 'Techno Chill: Heat up Your Knowledge',
  //   organizer: 'National Engineering College, Kovilpatti',
  //   logo: 'https://img.icons8.com/color/96/technology.png',
  //   bannerImage: 'https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?auto=format&fit=crop&q=80&w=800',
  //   type: 'Offline',
  //   pricing: 'Paid',
  //   views: 965,
  //   applicants: 12,
  //   daysLeft: 4,
  //   link: '#',
  //   bgColor: 'bg-blue-600'

  //   }
  // ];

  const CompetitionCard = ({ competition }) => (
    <div onClick={()=>navigate(`/hackathon/${competition._id}`)} className="relative overflow-hidden rounded-2xl shadow-lg transition-transform transform hover:scale-105  bg-white">
      {/* Banner Image */}
      <div className="relative h-48 w-full">
        <img 
          src={competition.banner} 
          alt={competition.name}
          className="w-full h-full object-cover rounded-t-2xl"
        />
        <div className={`absolute inset-0 bg-green-700 opacity-60`}></div>
        

        {/* Arrow Link */}
        <Link 
          href="/event-page"
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <ArrowUpRight className="w-7 h-7 text-black" />
        </Link>
      </div>

      {/* Content */}
      <div className="p-6 space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{competition.name}</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="bg-gray-200 text-sm px-3 py-1 rounded-full font-medium">💰 Prize: {competition.prizePool}</span>
          <span className="bg-gray-200 text-sm px-3 py-1 rounded-full font-medium">📅 Finale: {competition.finaleDate}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 mt-6 sm:px-6 lg:px-8">
    <div className="min-h-screen bg-gray-50 py-12 mt-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900">🚀 Exciting Competitions</h2>
          <p className="text-gray-600 mt-1">Explore the Competitions that are creating a buzz among your peers!</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {events.map(competition => <CompetitionCard key={competition._id} competition={competition} />)}
          </div>
        </div>
      </div>
    </div></div>
  );
};

export default Event;
