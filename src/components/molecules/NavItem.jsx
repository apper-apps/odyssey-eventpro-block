import React from "react";
import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const NavItem = ({ to, icon, children, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center px-4 py-3 mx-2 text-sm font-medium rounded-md transition-all duration-200",
          isActive
            ? "nav-item-active text-white"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        )
      }
    >
      <ApperIcon name={icon} className="mr-3 h-5 w-5" />
      {children}
    </NavLink>
  );
};

export default NavItem;