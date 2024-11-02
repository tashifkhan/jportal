import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"

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
        <Button
          variant="outline"
          onClick={handleLogout}
          className="text-white hover:text-[#191c20]"
        >
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;
