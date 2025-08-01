import React from "react";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const StatCard = ({ title, value, icon, gradient = false }) => {
  return (
    <Card className={`p-6 ${gradient ? "stat-card-gradient" : ""}`} hover>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-secondary mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-full">
          <ApperIcon name={icon} className="h-6 w-6 text-white" />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;