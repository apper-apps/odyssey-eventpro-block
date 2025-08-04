import React, { useContext } from "react";
import { AuthContext } from "../../App";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
const Header = ({ onMenuClick }) => {
  const { logout } = useContext(AuthContext);
  
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden mr-2"
        >
          <ApperIcon name="Menu" className="h-5 w-5" />
        </Button>
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg mr-3">
            <ApperIcon name="Calendar" className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">EventPro</h1>
        </div>
      </div>
      
<div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm">
          <ApperIcon name="Bell" className="h-5 w-5" />
        </Button>
<Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            logout();
          }}
          className="text-gray-600 hover:text-gray-900"
        >
          <ApperIcon name="LogOut" className="h-5 w-5 mr-2" />
          Logout
        </Button>
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
          <ApperIcon name="User" className="h-4 w-4 text-white" />
        </div>
      </div>
    </header>
  );
};

export default Header;