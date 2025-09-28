import { useNavigate } from "react-router-dom";
import { ThemeSelectorDialog } from "./theme-selector-dialog";
import { Button } from "./ui/button";
import LogoutIcon from "@/../public/icons/logout.svg?react";

const Header = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    localStorage.removeItem("attendanceData");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <header className="bg-background mx-auto px-3 pt-4 pb-2">
      <div className="container-fluid flex justify-between items-center">
        <h1 className="text-foreground text-2xl font-bold lg:text-3xl font-sans">JPortal</h1>
        <div className="flex items-center gap-1">
          <ThemeSelectorDialog />
          <Button variant="ghost" size="icon" onClick={handleLogout} className="cursor-pointer rounded-full">
            <LogoutIcon className="w-7 h-7 stroke-2 stroke-foreground" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
