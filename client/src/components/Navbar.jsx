import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import WalletConnect from './WalletConnect';
import {  Menu, X, LogOut, Settings } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const {
    user,
    isAuthenticated,
    logout,
  } = useContext(AppContext);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/food-detection', label: 'Detect' },
    { to: '/nearbyngo', label: 'NGOs' },
    { to: '/recipe-suggestion', label: 'Find Recipes' },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <img
              src={assets.logo}
              alt="Taaza Logo"
              className="h-10 w-10 rounded-full"
            />
            <span className="text-xl font-bold text-green-700">taaza</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive 
                      ? 'text-green-600' 
                      : 'text-gray-600 hover:text-green-600'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {label}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Desktop Auth & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* <WalletConnect /> */}
            <NotificationBell />

            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                  <img 
                    src={user?.picture} 
                    alt="User" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-green-200"
                  />
                  <img className="w-3" src={assets.dropdown_icon} alt="Dropdown" />
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-2">
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="flex items-center space-x-2 w-full p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                    >
                      <Settings className="w-4 h-4" />
                      <span>My Profile</span>
                    </button>
                    <button 
                      onClick={logout}
                      className="flex items-center space-x-2 w-full p-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 rounded-md cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200"
              >
                Create Account
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            >
              {showMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${
        showMenu ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="px-4 py-4 space-y-2 bg-white border-t border-gray-100">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setShowMenu(false)}
              className={({ isActive }) =>
                `block px-3 py-2 text-base font-medium rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? 'text-green-600 bg-green-50' 
                    : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          
          <div className="pt-4 border-t border-gray-100 space-y-2">
            {/* <div className="mb-4">
              <WalletConnect />
            </div> */}
            
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <img 
                    src={user?.picture} 
                    alt="User" 
                    className="w-8 h-8 rounded-full object-cover border-2 border-green-200"
                  />
                  <span className="text-sm font-medium text-gray-700">My Account</span>
                </div>
                <button 
                  onClick={() => {
                    navigate('/dashboard');
                    setShowMenu(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-green-600 hover:bg-gray-50 rounded-lg"
                >
                  My Profile
                </button>
                <button 
                  onClick={() => {
                    logout();
                    setShowMenu(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setShowMenu(false);
                  navigate('/login');
                }}
                className="w-full px-3 py-2 text-base font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;