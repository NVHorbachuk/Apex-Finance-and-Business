// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Імпортуємо Firebase
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Імпортуємо компоненти сторінок
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Goals from './pages/Goals/Goals';
import Budgets from './pages/Budgets/Budgets';
import Transactions from './pages/Transactions/Transactions';
import Accounts from './pages/Accounts/Accounts';
import AdminPanel from './pages/AdminPanel/AdminPanel';
import ProfileSettings from './pages/ProfileSettings/ProfileSettings';
import LandingPage from './pages/LandingPage/LandingPage'; // Імпорт нової LandingPage

// Функція-обгортка для захищених маршрутів
function ProtectedRoute({ children, isAuthenticated, db, auth, userId, userData, setGlobalUserData }) {
    const navigate = useNavigate();
    const currentLocation = window.location.pathname;

    useEffect(() => {
        // Якщо користувач не автентифікований і намагається отримати доступ до захищеного маршруту (крім '/'), перенаправляємо на сторінку входу
        if (isAuthenticated === false && currentLocation !== '/login' && currentLocation !== '/register' && currentLocation !== '/') {
            navigate('/login');
        }
        // Якщо користувач автентифікований і знаходиться на сторінках входу/реєстрації, перенаправляємо на дашборд
        else if (isAuthenticated === true && (currentLocation === '/login' || currentLocation === '/register')) {
            navigate('/dashboard'); // Перенаправляємо на /dashboard
        }
    }, [isAuthenticated, navigate, currentLocation]);

    if (isAuthenticated === null) {
        return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans']">Завантаження...</div>;
    }

    // Якщо це "/" і користувач не автентифікований, дозволяємо відобразити LandingPage без db, auth, userId, userData
    if (currentLocation === '/' && isAuthenticated === false) {
        return children;
    }

    return isAuthenticated ? React.cloneElement(children, { db, auth, userId, userData, setGlobalUserData }) : null;
}

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userData, setUserData] = useState(null);

    const setGlobalUserData = (data) => {
        setUserData(data);
    };

    useEffect(() => {
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

            const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
                if (user) {
                    setIsAuthenticated(true);
                    setUserId(user.uid);

                    const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';
                    // Змінено шлях для user_profiles на users/${user.uid}/profile/details
                    const userProfileRef = doc(dbInstance, `/artifacts/${appId}/users/${user.uid}/profile`, 'details');
                    const userProfileSnap = await getDoc(userProfileRef);
                    if (userProfileSnap.exists()) {
                        setUserData({ id: user.uid, ...userProfileSnap.data() });
                    } else {
                        // Якщо профайл не існує, створити його з базовими даними
                        const initialProfileData = {
                            email: user.email || '',
                            firstName: '',
                            lastName: '',
                            phone: '',
                            address: '',
                            city: '',
                            country: '',
                            currency: 'UAH',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        await setDoc(userProfileRef, initialProfileData);
                        setUserData(initialProfileData);
                    }

                } else {
                    setIsAuthenticated(false);
                    setUserId(null);
                    setUserData(null);
                }
            });

            return () => unsubscribe();
        } else {
            console.error("App.js: Конфігурація Firebase недоступна або неповна. Автентифікація не працюватиме належним чином.");
            setIsAuthenticated(false);
            setUserId(null);
            setUserData(null);
        }
    }, []);

    return (
        <Router>
            <main className="flex-grow">
                <Routes>
                    {/* Нова головна сторінка */}
                    <Route path="/" element={<LandingPage />} />

                    {/* Передача setUserId та setUserData до компонента Login */}
                    <Route path="/login" element={<Login db={db} auth={auth} setUserId={setUserId} setUserData={setUserData} />} />
                    <Route path="/register" element={<Register db={db} auth={auth} />} />

                    {/* Dashboard тепер на окремому маршруті */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} db={db} auth={auth} userId={userId} userData={userData} setGlobalUserData={setGlobalUserData}>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/budgets" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} db={db} auth={auth} userId={userId} userData={userData} setGlobalUserData={setGlobalUserData}>
                            <Budgets />
                        </ProtectedRoute>
                    } />
                    <Route path="/transactions" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} db={db} auth={auth} userId={userId} userData={userData} setGlobalUserData={setGlobalUserData}>
                            <Transactions />
                        </ProtectedRoute>
                    } />
                    <Route path="/accounts" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} db={db} auth={auth} userId={userId} userData={userData} setGlobalUserData={setGlobalUserData}>
                            <Accounts />
                        </ProtectedRoute>
                    } />
                    <Route path="/goals" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} db={db} auth={auth} userId={userId} userData={userData} setGlobalUserData={setGlobalUserData}>
                            <Goals />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} db={db} auth={auth} userId={userId} userData={userData} setGlobalUserData={setGlobalUserData}>
                            <AdminPanel />
                        </ProtectedRoute>
                    } />
                    <Route path="/profile-settings" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} db={db} auth={auth} userId={userId} userData={userData} setGlobalUserData={setGlobalUserData}>
                            <ProfileSettings />
                        </ProtectedRoute>
                    } />
                </Routes>
            </main>
        </Router>
    );
}

export default App;
