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
import AdminPanel from './pages/AdminPanel/AdminPanel';

// Функція-обгортка для захищених маршрутів
function ProtectedRoute({ children, isAuthenticated, db, auth, userId }) {
    const navigate = useNavigate();
    const currentLocation = window.location.pathname;

    useEffect(() => {
        // Якщо користувач не автентифікований і намагається отримати доступ до захищеного маршруту, перенаправляємо на сторінку входу
        if (isAuthenticated === false && currentLocation !== '/login' && currentLocation !== '/register') {
            navigate('/login');
        }
        // Якщо користувач автентифікований і знаходиться на сторінках входу/реєстрації, перенаправляємо на головну
        else if (isAuthenticated === true && (currentLocation === '/login' || currentLocation === '/register')) {
            navigate('/');
        }
    }, [isAuthenticated, navigate, currentLocation]);

    // Показуємо завантаження, доки стан автентифікації не буде визначено
    if (isAuthenticated === null) {
        return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans']">Завантаження...</div>;
    }

    // Рендеримо дочірні елементи та передаємо їм props, тільки якщо користувач автентифікований
    return isAuthenticated ? React.cloneElement(children, { db, auth, userId }) : null;
}

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        // Отримуємо конфігурацію Firebase та початковий токен автентифікації з глобальних змінних
        const firebaseConfig = typeof window.__firebase_config !== 'undefined'
            ? JSON.parse(window.__firebase_config)
            : {
                apiKey: "AIzaSyDCm-4RcM0oNB1FWFjMOB9MEe2XtzHmeBE",
                authDomain: "apex-finance-1928e.firebaseapp.com",
                projectId: "apex-finance-1928e",
                storageBucket: "apex-finance-1928e.appspot.com",
                messagingSenderId: "1041175836092",
                appId: "1:1041175836092:web:f8cfa3b568a092bb3b67b9",
                measurementId: "G-Y6JSCG9346"
            };

        const initialAuthToken = typeof window.__initial_auth_token !== 'undefined'
            ? window.__initial_auth_token
            : null;

        if (firebaseConfig && firebaseConfig.apiKey) {
            const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
            const authInstance = getAuth(app);
            const dbInstance = getFirestore(app);

            setAuth(authInstance);
            setDb(dbInstance);

            // Виконуємо початкову автентифікацію
            const authenticateUser = async () => {
                if (initialAuthToken) {
                    try {
                        await signInWithCustomToken(authInstance, initialAuthToken);
                    } catch (error) {
                        console.error("App.js: Помилка входу з custom token:", error);
                        // Якщо custom token не вдається, не намагайтеся анонімну автентифікацію тут.
                        // Дозвольте onAuthStateChanged обробити неавтентифікований стан.
                    }
                } else {
                    // Якщо початкового токена немає, спробуйте анонімний вхід (для середовища Canvas)
                    try {
                        await signInAnonymously(authInstance);
                    } catch (anonError) {
                        console.error("App.js: Помилка анонімного входу (без initialAuthToken):", anonError);
                    }
                }
            };
            authenticateUser();

            // Слухаємо зміни стану автентифікації
            const unsubscribe = onAuthStateChanged(authInstance, (user) => {
                if (user) {
                    setIsAuthenticated(true);
                    setUserId(user.uid); // Використовуємо UID автентифікованого користувача
                } else {
                    setIsAuthenticated(false);
                    setUserId(null); // Якщо користувач не автентифікований, userId має бути null
                                    // ProtectedRoute перенаправить на сторінку входу
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
                    {/* Маршрути для входу/реєстрації */}
                    <Route path="/login" element={<Login db={db} auth={auth} />} />
                    <Route path="/register" element={<Register db={db} auth={auth} />} />

                    {/* Захищені маршрути */}
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
                    <Route path="/admin" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} db={db} auth={auth} userId={userId}>
                            <AdminPanel />
                        </ProtectedRoute>
                    } />
                </Routes>
            </main>
        </Router>
    );
}

export default App;
