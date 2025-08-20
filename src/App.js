// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Імпортуємо Firebase
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'; // Імпортуємо doc, getDoc, setDoc

// Імпортуємо компоненти сторінок
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Goals from './pages/Goals/Goals';
import Budgets from './pages/Budgets/Budgets';
import Transactions from './pages/Transactions/Transactions';
import Accounts from './pages/Accounts/Accounts';
import AdminPanel from './pages/AdminPanel/AdminPanel';
import ProfileSettings from './pages/ProfileSettings/ProfileSettings'; // Імпорт нової сторінки

// Функція-обгортка для захищених маршрутів
function ProtectedRoute({ children, isAuthenticated, db, auth, userId, userData, setGlobalUserData }) { // Додано setGlobalUserData
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
    return isAuthenticated ? React.cloneElement(children, { db, auth, userId, userData, setGlobalUserData }) : null; // Передано setGlobalUserData
}

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userData, setUserData] = useState(null); // Новий стан для даних профілю користувача

    // Функція для оновлення userData з дочірніх компонентів
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

            const unsubscribe = onAuthStateChanged(authInstance, async (user) => { // Зроблено асинхронним для виклику Firestore
                if (user) {
                    setIsAuthenticated(true);
                    setUserId(user.uid);

                    // Отримання даних профілю користувача з Firestore
                    try {
                        const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id'; // Отримуємо appId тут
                        const userProfileRef = doc(dbInstance, `/artifacts/${appId}/public/data/user_profiles`, user.uid);
                        const userProfileSnap = await getDoc(userProfileRef);
                        if (userProfileSnap.exists()) {
                            setUserData({ id: user.uid, ...userProfileSnap.data() });
                        } else {
                            // Якщо профіль не існує, ініціалізуємо його email з Auth.
                            // firstName та lastName будуть порожніми, доки користувач їх не введе.
                            setUserData({ id: user.uid, email: user.email, firstName: '', lastName: '' });
                            // Створюємо порожній профіль, щоб він існував у Firestore при першому вході.
                            await setDoc(userProfileRef, { email: user.email, userId: user.uid, createdAt: new Date().toISOString() }, { merge: true });
                        }
                    } catch (profileError) {
                        console.error("App.js: Помилка отримання профілю користувача:", profileError);
                        setUserData({ id: user.uid, email: user.email, firstName: '', lastName: '' }); // Запасний варіант
                    }

                } else {
                    setIsAuthenticated(false);
                    setUserId(null); // Змінено на null, як обговорювалося раніше для персистентності
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
    }, []); // Видалено appId з залежностей, щоб уникнути повторної ініціалізації додатку при зміні appId, чого не відбувається

    return (
        <Router>
            <main className="flex-grow">
                <Routes>
                    <Route path="/login" element={<Login db={db} auth={auth} />} /> {/* Передача db, auth */}
                    <Route path="/register" element={<Register db={db} auth={auth} />} /> {/* Передача db, auth */}

                    <Route path="/" element={
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
