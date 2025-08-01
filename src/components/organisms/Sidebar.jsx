import React from "react";
import NavItem from "@/components/molecules/NavItem";
import { cn } from "@/utils/cn";

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 flex-1 space-y-1">
                <NavItem to="/" icon="LayoutDashboard">
                  Dashboard
                </NavItem>
                <NavItem to="/events" icon="Calendar">
                  Events
                </NavItem>
                <NavItem to="/tasks" icon="CheckSquare">
                  Tasks
                </NavItem>
              </nav>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 space-y-1">
              <NavItem to="/" icon="LayoutDashboard" onClick={onClose}>
                Dashboard
              </NavItem>
              <NavItem to="/events" icon="Calendar" onClick={onClose}>
                Events
              </NavItem>
              <NavItem to="/tasks" icon="CheckSquare" onClick={onClose}>
                Tasks
              </NavItem>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;