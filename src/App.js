// src/App.js
import React, { useState, useEffect } from 'react'; // Цей імпорт залишається
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Імпортуємо Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';

// Імпортуємо компоненти сторінок
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Goals from './pages/Goals/Goals';

// Імпортуємо інші необхідні компоненти
import Budgets from './pages/Budgets/Budgets';
import Transactions from './pages/Transactions/Transactions';
import Accounts from './pages/Accounts/Accounts';


// Функція-обгортка для захищених маршрутів
function ProtectedRoute({ children, isAuthenticated }) {
  const navigate = useNavigate();
  const currentLocation = window.location.pathname;

  useEffect(() => {
    console.log('ProtectedRoute: isAuthenticated current state:', isAuthenticated);
    console.log('ProtectedRoute: Current path:', currentLocation);

    if (isAuthenticated === false && currentLocation !== '/login' && currentLocation !== '/register') {
      console.log('ProtectedRoute: User not authenticated, redirecting to /login');
      navigate('/login');
    } else if (isAuthenticated === true && (currentLocation === '/login' || currentLocation === '/register')) {
        console.log('ProtectedRoute: User authenticated, redirecting from auth page to dashboard.');
        navigate('/');
    }
  }, [isAuthenticated, navigate, currentLocation]);

  if (isAuthenticated === null) {
    console.log('ProtectedRoute: Authentication state is null (loading)...');
    return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans']">Завантаження...</div>;
  }

  return isAuthenticated ? children : null;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
// ... ваш інший код функції App
  useEffect(() => {
    const firebaseConfig = typeof window.__firebase_config !== 'undefined'
      ? JSON.parse(window.__firebase_config)
      : {
          apiKey: "AIzaSyDCm-4RcM0oNB1FWFjMOB9MEe2XtzHmeBE",
          authDomain: "apex-finance-1928e.firebaseapp.com",
          projectId: "apex-finance-1928e",
          storageBucket: "apex-finance-1928e.firebasestorage.app",
          messagingSenderId: "1041175836092",
          appId: "1:1041175836092:web:f8cfa3b568a092bb3b67b9",
          measurementId: "G-Y6JSCG9346"
        };


    const initialAuthToken = typeof window.__initial_auth_token !== 'undefined'
      ? window.__initial_auth_token
      : null;


    if (firebaseConfig && firebaseConfig.apiKey) {
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);

      const authenticateUser = async () => {
        if (initialAuthToken) {
          try {
            await signInWithCustomToken(authInstance, initialAuthToken);
            console.log("App.js: Signed in with custom token.");
          } catch (error) {
            console.error("App.js: Error signing in with custom token:", error);
            // Якщо custom token не спрацював, просто встановлюємо false, щоб перенаправити на логін
            console.log("App.js: Custom token failed, user will be logged out.");
            setIsAuthenticated(false); // Встановлюємо false, щоб ProtectedRoute перенаправив на /login
          }
        } else {
          // Якщо initialAuthToken немає, користувач не автентифікований при завантаженні
          console.log("App.js: No initialAuthToken, user is not authenticated on load.");
          setIsAuthenticated(false); // Встановлюємо false, щоб ProtectedRoute перенаправив на /login
        }
      };
      authenticateUser();

      const unsubscribe = onAuthStateChanged(authInstance, (user) => {
        if (user) {
          console.log("App.js: onAuthStateChanged - User IS logged in:", user.uid);
          setIsAuthenticated(true);
        } else {
          console.log("App.js: onAuthStateChanged - User IS NOT logged in.");
          setIsAuthenticated(false);
        }
      });

      return () => unsubscribe();
    } else {
      console.error("App.js: Firebase config is not available or incomplete. Authentication will not work locally without it.");
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <Router>
      <main className="flex-grow">
        <Routes>
          {/* Маршрути, доступні без автентифікації */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Захищені маршрути */}
          <Route path="/" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/budgets" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Budgets />
            </ProtectedRoute>
          } />
          <Route path="/transactions" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Transactions />
            </ProtectedRoute>
          } />
        
           <Route path="/accounts" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Accounts />
            </ProtectedRoute>
          } />
          <Route path="/goals" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Goals />
            </ProtectedRoute>
          } />
          {/* <Route path="/settings" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ReportsAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />  */}
        </Routes>
      </main>
    </Router>
  );
}

export default App;
