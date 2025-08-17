import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; // Importing routing components
import Dashboard from './pages/Dashboard/Dashboard'; // Import the Dashboard component
import Budgets from "./pages/Budgets/Budgets";

function App() {
  return (
    // Router component to enable client-side routing
    <Router>
      {/* Navigation Bar */}
      <nav className="bg-blue-800 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          {/* Brand Logo/Name */}
          <Link to="/" className="text-white text-2xl font-bold">
            Apex Finance
          </Link>
          {/* Navigation Links */}
          <div className="space-x-4">
            <Link
              to="/"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-lg font-medium transition duration-300 ease-in-out"
            >
              Дашборд
            </Link>
            <Link
              to="/transactions"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-lg font-medium transition duration-300 ease-in-out"
            >
              Транзакції
            </Link>
            {/* Add more links for other pages as they are created */}
            {/*
            <Link to="/budgets" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-lg font-medium transition duration-300 ease-in-out">
              Бюджети
            </Link>
            <Link to="/accounts" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-lg font-medium transition duration-300 ease-in-out">
              Рахунки
            </Link>
            <Link to="/reports" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-lg font-medium transition duration-300 ease-in-out">
              Звіти
            </Link>
            <Link to="/goals" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-lg font-medium transition duration-300 ease-in-out">
              Цілі
            </Link>
            <Link to="/settings" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-lg font-medium transition duration-300 ease-in-out">
              Налаштування
            </Link>
            */}
          </div>
        </div>
      </nav>

      {/* Main Content Area - Routes */}
      <main className="flex-grow">
        {/* Defines the routes for different pages */}
        <Routes>
          {/* Route for the Dashboard page */}
          <Route path="/" element={<Dashboard />} />
          {/* Route for the Transactions page */}
        
          {/* Add more routes here as you create new pages */}
          {/*
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/reports" element={<ReportsAnalytics />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<NotFound />} /> // Catch-all for 404
          */}
        </Routes>
      </main>
    </Router>
  );
}

export default App;
