// src/components/Sidebar.js
import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-60 h-screen bg-white border-r border-gray-200 p-5">
      <h1 className="text-xl font-bold mb-8">Apex Finance</h1>
      <nav className="flex flex-col gap-4">
        <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
        <Link to="/transactions" className="hover:text-blue-600">Transactions</Link>
        <Link to="/cards" className="hover:text-blue-600">Cards</Link>
        <Link to="/budgets" className="hover:text-blue-600">Budgets</Link>
        <Link to="/goals" className="hover:text-blue-600">Goals</Link>
        <Link to="/account" className="hover:text-blue-600">Account</Link>
      </nav>
    </div>
  );
};

export default Sidebar;
