import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy,Menu, X } from 'lucide-react';
import LogoutBtn from './LogoutBtn';
import { useSelector } from 'react-redux';
import AvatarDropdown from '../AvatarDropdown';
//import { ThemeToggle } from './ThemeToggle';

const Header = () => {
  const authStatus = useSelector((state)=>state.auth?.status)
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-black border-b border-yellow-400 fixed w-full top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center"
              >
                <Trophy className="h-8 w-8 text-yellow-400" />
                <span className="ml-2 text-3xl iceland-regular  text-black dark:text-white neon-text">EVENTX</span>
              </motion.div>
            </Link>

            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link to="/browse-events" className= " eb text-gray-900 dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300 px-3 py-2 text-sm font-medium">
                 Browse Events
              </Link>
              <Link to="/organize" className="eb text-gray-900 dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300 px-3 py-2 text-sm font-medium">
                organize
              </Link>
              <Link to="/resources" className="eb text-gray-900 dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300 px-3 py-2 text-sm font-medium">
                Resources
              </Link>
              <Link to="/about" className="eb text-gray-900 dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300 px-3 py-2 text-sm font-medium">
                About
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            
            <button className="p-2 text-yellow-400 hover:text-yellow-300">
            </button>
            {!authStatus && (
              <>
                <Link
                  to="/login"
                  className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium text-black bg-yellow-400 rounded-lg hover:bg-yellow-300 neon-border"
                >
                  Sign up
                </Link>
              </>
            )}
            {
              authStatus && (<>
              <AvatarDropdown/>
              <LogoutBtn/>
              </>)
            }

            

            <div className="flex md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-yellow-400 hover:text-yellow-300"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-black"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {[
                ["Browse Events", '/events'],
                ["Hackathons", '/hackathons'],
                ['Dashboard', '/dashboard'],
                ['Resources', '/resources'],
                ['About', '/about'],
                ['Sign in', '/signin'],
              ].map(([title, path]) => (
                <Link
                  key={path}
                  to={path}
                  className="block px-3 py-2 text-base font-medium text-gray-900 dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300"
                >
                  {title}
                </Link>
              ))}
              <Link
                to="/signup"
                className="block px-3 py-2 text-base font-medium text-black bg-yellow-400 rounded-lg hover:bg-yellow-300"
              >
                Sign up
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Header;