import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <header className="bg-[#191c20]">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold lg:text-3xl font-sans">
          JPortal
        </h1>
        <div className='hover:bg-gray-700 rounded-xl p-2'>
        <img
          src='/public/icons/logout.svg'
          alt="Logout"
          onClick={handleLogout}
          className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity"
        />
        </div>
      </div>
    </header>
  );
};

export default Header;
