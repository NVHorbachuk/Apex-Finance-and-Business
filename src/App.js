// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Імпортуємо Firebase
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Імпортуємо компоненти сторінок
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Goals from './pages/Goals/Goals';
import Budgets from './pages/Budgets/Budgets';
import Transactions from './pages/Transactions/Transactions';
import Accounts from './pages/Accounts/Accounts';

// Функція-обгортка для захищених маршрутів
function ProtectedRoute({ children, isAuthenticated, db, auth, userId }) {
    const navigate = useNavigate();
    const currentLocation = window.location.pathname;

    useEffect(() => {
        if (isAuthenticated === false && currentLocation !== '/login' && currentLocation !== '/register') {
            navigate('/login');
        } else if (isAuthenticated === true && (currentLocation === '/login' || currentLocation === '/register')) {
            navigate('/');
        }
    }, [isAuthenticated, navigate, currentLocation]);

    if (isAuthenticated === null) {
        return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans']">Завантаження...</div>;
    }

    return isAuthenticated ? React.cloneElement(children, { db, auth, userId }) : null;
}

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        // Отримуємо конфігурацію Firebase та початковий токен автентифікації з глобальних змінних
        // Якщо ви працюєте локально (не в середовищі Canvas), використовуємо ці конкретні дані.
        // Це реальні дані вашого проекту Apex-Finance.
        const firebaseConfig = typeof window.__firebase_config !== 'undefined'
            ? JSON.parse(window.__firebase_config)
            : {
                apiKey: "AIzaSyDCm-4RcM0oNB1FWFjMOB9MEe2XtzHmeBE",
                authDomain: "apex-finance-1928e.firebaseapp.com",
                projectId: "apex-finance-1928e",
                storageBucket: "apex-finance-1928e.appspot.com", // Виправлено суфікс
                messagingSenderId: "1041175836092",
                appId: "1:1041175836092:web:f8cfa3b568a092bb3b67b9", // Залишено попередній appId, оскільки не надано нового
                measurementId: "G-Y6JSCG9346" // Залишено попередній measurementId, оскільки не надано нового
            };

        const initialAuthToken = typeof window.__initial_auth_token !== 'undefined'
            ? window.__initial_auth_token
            : null;

        // Перевірка, чи конфігурація Firebase дійсна (тепер з вашими реальними даними)
        if (firebaseConfig && firebaseConfig.apiKey) {
            const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
            const authInstance = getAuth(app);
            const dbInstance = getFirestore(app);

            setAuth(authInstance);
            setDb(dbInstance);

            const authenticateUser = async () => {
                if (initialAuthToken) {
                    try {
                        await signInWithCustomToken(authInstance, initialAuthToken);
                    } catch (error) {
                        console.error("App.js: Помилка входу з custom token:", error);
                        try {
                            await signInAnonymously(authInstance);
                        } catch (anonError) {
                            console.error("App.js: Помилка анонімного входу:", anonError);
                            setIsAuthenticated(false);
                            setUserId(null);
                        }
                    }
                } else {
                    try {
                        await signInAnonymously(authInstance);
                    } catch (anonError) {
                        console.error("App.js: Помилка анонімного входу (без initialAuthToken):", anonError);
                        setIsAuthenticated(false);
                        setUserId(null);
                    }
                }
            };
            authenticateUser();

            const unsubscribe = onAuthStateChanged(authInstance, (user) => {
                if (user) {
                    setIsAuthenticated(true);
                    setUserId(user.uid);
                } else {
                    setIsAuthenticated(false);
                    setUserId(crypto.randomUUID());
                }
            });

            return () => unsubscribe();
        } else {
            console.error("App.js: Конфігурація Firebase недоступна або неповна. Автентифікація не працюватиме належним чином.");
            setIsAuthenticated(false);
            setUserId(null);
        }
    }, []);

    return (
        <Router>
            <main className="flex-grow">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} db={db} auth={auth} userId={userId}>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/budgets" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} db={db} auth={auth} userId={userId}>
                            <Budgets />
                        </ProtectedRoute>
                    } />
                    <Route path="/transactions" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} db={db} auth={auth} userId={userId}>
                            <Transactions />
                        </ProtectedRoute>
                    } />
                    <Route path="/accounts" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} db={db} auth={auth} userId={userId}>
                            <Accounts />
                        </ProtectedRoute>
                    } />
                    <Route path="/goals" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} db={db} auth={auth} userId={userId}>
                            <Goals />
                        </ProtectedRoute>
                    } />
                </Routes>
            </main>
        </Router>
    );
}

export default App;
