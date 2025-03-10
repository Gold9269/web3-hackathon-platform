import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Trophy,
  Users,
  Award,
  FileCheck,
  Vote,
  Coins,
  AlignCenterVertical as Certificate
} from 'lucide-react';
import { Marquee } from './magicui/marquee';
import {Particles} from './magicui/particles'
import { FlipText } from './magicui/flip-text';

//for testimonials
const Card = ({ name, Role, text }) => (
  <div className="w-80 bg-green-100 rounded-lg shadow-lg p-6 text-center mx-4">
    <p className="text-lg italic text-gray-700">"{text}"</p>
    <h3 className="mt-4 text-green-700 font-semibold">{name}</h3>
    <span className="text-sm text-gray-500">{Role}</span>
  </div>
);

const Home = () => {

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Hackathon Organizer",
      text: "This platform made managing our hackathon a breeze! The AI-based resume shortlisting saved us hours of work, and the blockchain-powered prize distribution ensured fairness and transparency."
    },
    {
      name: "James Carter",
      role: "Participant",
      text: "Loved the experience! The seamless Web3 login and NFT certificates were a game-changer. The voting system also made our hackathon more engaging."
    },
    {
      name: "Emily Roberts",
      role: "Tech Conference Host",
      text: "Setting up and managing our event was incredibly smooth. The ability to create private and public events helped us organize our sessions efficiently."
    },
    {
      name: "Daniel Lee",
      role: "Blockchain Developer",
      text: "The smart contract integration for prize distribution was flawless! The platform ensures complete transparency and removes manual handling errors."
    },
    {
      name: "Olivia Martinez",
      role: "Startup Founder",
      text: "I participated in a pitch competition on this platform, and the experience was fantastic! The AI-powered shortlisting ensured that the best ideas got recognized."
    },
    {
      name: "Michael Brown",
      role: "Event Sponsor",
      text: "Sponsoring events on this platform was an excellent decision. The engagement tools and seamless participation process helped maximize our brand visibility."
    }
  ]
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <>
    <div className="flex flex-col">

    
      {/* Hero Section */}
  <section className="relative bg-white dark:bg-black py-20 pt-32 transition-colors overflow-hidden">
  <div className="absolute inset-0">
    <Particles
      quantity={100}
      staticity={30}
      ease={50}
      size={2}
      refresh={false}
      color={"0A0A08"} // Adjust to your desired glow effect
      vx={0.5}
      vy={0.5}
    />
  </div>

  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight glitch-effect text-gray-900 dark:text-white dark:neon-text" data-text="EVENTX">
        EVENTX
      </h1>
      <FlipText
        duration={0.5}
        delayMultiple={0.08}
        className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-yellow-400"
      >
        MANAGE
      </FlipText>

      <FlipText
        duration={0.5}
        delayMultiple={0.08}
        className="text-4xl md:text-6xl font-bold mb-12 tracking-tight text-yellow-500"
      >
        FROM 0 TO 1
      </FlipText>

    </motion.div>

    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="flex justify-center"
    >
      <Link
        to="/get-started"
        className="inline-flex items-center px-8 py-4 text-lg font-bold text-black bg-yellow-400 rounded-full hover:bg-yellow-300 transition-all transform hover:scale-105 neon-border"
      >
        Get Started
        <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
    </motion.div>
  </div>
</section>

      {/* Key Features Section */}
      <section className="py-20  dark:bg-black text-gray-900 dark:text-white transition-colors relative">
      <div className="absolute inset-0">
    <Particles
      quantity={100}
      staticity={30}
      ease={50}
      size={2}
      refresh={false}
      color={"0A0A08"} // Adjust to your desired glow effect
      vx={0.5}
      vy={0.5}
    />
  </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 dark:neon-text">Key Features</h2>
            <p className="text-xl text-yellow-600 dark:text-yellow-400">
              Powered by Web3 Technology
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Trophy,
                title: 'Event Hosting',
                description: 'Host hackathons, tech events, and competitions with ease',
               
              },
              {
                icon: FileCheck,
                title: 'Smart Shortlisting',
                description: 'AI-powered resume screening for participant selection',
                
              },
              {
                icon: Vote,
                title: 'Decentralized Voting',
                description: 'Transparent voting system powered by smart contracts',
                
              },
              {
                icon: Coins,
                title: 'Automated Rewards',
                description: 'Smart contract-based prize distribution to winners',
                
              },
              {
                icon: Certificate,
                title: 'NFT Certificates',
                description: 'Mint and distribute verifiable NFT certificates',
                
              },
              {
                icon: Award,
                title: 'Achievement Tracking',
                description: 'Blockchain-verified participation and achievements',
                
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative group h-full"
              >
               
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-xl transform scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300"></div>

{/* Main card */}
<div className="relative bg-white dark:bg-black p-8 rounded-xl transform transition-transform group-hover:-translate-y-2 border border-yellow-400 neon-border h-full flex flex-col justify-between">
  <div className="p-3 rounded-lg inline-block mb-4 bg-yellow-400 neon-border">
    <feature.icon className="h-6 w-6 text-black dark:text-white" />
  </div>
  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{feature.title}</h3>
  <p className="text-yellow-600 dark:text-yellow-400">{feature.description}</p>
  
</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="py-20 bg-white dark:bg-black text-gray-900 dark:text-white transition-colors"
      >



      
   {/* Testimonials Section */}
<section className="py-20  dark:bg-black text-gray-900 dark:text-white transition-colors relative">
<div className="absolute inset-0">
    <Particles
      quantity={100}
      staticity={30}
      ease={50}
      size={2}
      refresh={false}
      color={"0A0A08"} // Adjust to your desired glow effect
      vx={0.5}
      vy={0.5}
    />
  </div>

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="text-center mb-16"
    >
      <h2 className="text-4xl font-bold mb-4 dark:neon-text">What People Say About EVENTX</h2>
      <p className="text-xl text-yellow-600 dark:text-yellow-400">
        Trusted by Hackathon Organizers, Developers, and Innovators
      </p>
    </motion.div>
    {/* Marquee Testimonials */}
    <Marquee className="mt-8" pauseOnHover={true} reverse={false} repeat={2}>
      {testimonials.map((testimonial, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white dark:bg-black border border-yellow-400 neon-border p-6 rounded-xl shadow-lg text-center mx-4 max-w-xs"
        >
          <p className="text-lg italic text-gray-700 dark:text-gray-300">"{testimonial.text}"</p>
          <h3 className="mt-4 text-yellow-600 dark:text-yellow-400 font-semibold">{testimonial.name}</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</span>
        </motion.div>
      ))}
    </Marquee>
  </div>
</section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-6">
          <h2 className="text-4xl font-bold mb-8 dark:neon-text">Ready to Start Your Journey?</h2>
          <Link
            to="/host"
            className="inline-flex items-center px-8 py-4 text-lg font-bold text-black bg-yellow-400 rounded-full hover:bg-yellow-300 transition-all transform hover:scale-105 neon-border"
          >
            Host an Event
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </motion.section>
    </div>
  

    </>
    
  );
};

export default Home;