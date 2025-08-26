import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Імпортуємо Firebase
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Імпортуємо всі компоненти сторінок з ваших папок, явно вказуючи розширення .js
import Dashboard from './pages/Dashboard/Dashboard.js';
import Login from './pages/Auth/Login.js';
import Register from './pages/Auth/Register.js';
import Goals from './pages/Goals/Goals.js';
import Budgets from './pages/Budgets/Budgets.js';
import Transactions from './pages/Transactions/Transactions.js';
import Accounts from './pages/Accounts/Accounts.js';
import AdminPanel from './pages/AdminPanel/AdminPanel.js';
import ProfileSettings from './pages/ProfileSettings/ProfileSettings.js';
import LandingPage from './pages/LandingPage/LandingPage.js';
import NFTProjectPage from './pages/NFTProjectPage/NFTProjectPage.js';

// Імпорт нових сторінок з вашої структури файлів
import AboutUs from './pages/AboutUs/AboutUs.js';
import Blog from './pages/Blog/Blog.js';
import Careers from './pages/Careers/Careers.js';
import ContactUs from './pages/ContactUs/ContactUs.js';
import CookiePolicy from './pages/CookiePolicy/CookiePolicy.js';
import Forum from './pages/Forum/Forum.js';
import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy.js';
import Settings from './pages/Settings/Settings.js';
import TermsOfUse from './pages/TermsOfUse/TermsOfUse.js';

// Список публічних маршрутів, які не потребують автентифікації
const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/nft-project',
    '/about-us',
    '/blog',
    '/careers',
    '/contact-us',
    '/cookie-policy',
    '/faq',
    '/privacy-policy',
    '/terms-of-use',
];


// Функція-обгортка для захищених маршрутів (оновлено)
function ProtectedRoute({ component: Component, isAuthenticated, db, auth, userId, userData, setGlobalUserData }) {
    const navigate = useNavigate();
    const currentLocation = window.location.pathname;

    useEffect(() => {
        // Якщо користувач не автентифікований і намагається отримати доступ до захищеного маршруту, перенаправляємо на сторінку входу
        if (isAuthenticated === false && !publicRoutes.includes(currentLocation)) {
            navigate('/login');
        }
        // Якщо користувач автентифікований і знаходиться на сторінках входу/реєстрації, перенаправляємо на дашборд
        else if (isAuthenticated === true && (currentLocation === '/login' || currentLocation === '/register')) {
            navigate('/dashboard'); // Перенаправляємо на /dashboard
        }
    }, [isAuthenticated, navigate, currentLocation, Component]); // Додано Component до залежностей useEffect

    if (isAuthenticated === null) {
        return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans']">Завантаження...</div>;
    }

    // Якщо маршрут публічний, дозволяємо відобразити його без автентифікації
    // Цей блок є необхідним, якщо ProtectedRoute обгортає також публічні маршрути
    if (!isAuthenticated && publicRoutes.includes(currentLocation)) {
        return <Component db={db} auth={auth} userId={userId} userData={userData} setGlobalUserData={setGlobalUserData} />;
    }

    // Якщо користувач автентифікований, рендеримо компонент
    if (isAuthenticated) {
        return <Component db={db} auth={auth} userId={userId} userData={userData} setGlobalUserData={setGlobalUserData} />;
    }

    return null; // У всіх інших випадках (наприклад, неавтентифікований користувач на захищеному маршруті), нічого не рендеримо, оскільки перенаправлення вже відбудеться
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
                    const userProfileRef = doc(dbInstance, `/artifacts/${appId}/users/${user.uid}/profile`, 'details');
                    const userProfileSnap = await getDoc(userProfileRef);
                    if (userProfileSnap.exists()) {
                        setUserData({ id: user.uid, ...userProfileSnap.data() });
                    } else {
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
                    {/* Публічні маршрути */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/nft-project" element={<NFTProjectPage />} />
                    <Route path="/login" element={<Login db={db} auth={auth} setUserId={setUserId} setUserData={setUserData} />} />
                    <Route path="/register" element={<Register db={db} auth={auth} />} />
                    <Route path="/about-us" element={<AboutUs />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/careers" element={<Careers />} />
                    <Route path="/contact-us" element={<ContactUs />} />
                    <Route path="/cookie-policy" element={<CookiePolicy />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-use" element={<TermsOfUse />} />

                    {/* Захищені маршрути (оновлено спосіб передачі компонента) */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} db={db} auth={auth} userId={userId} userData={userData} setGlobalUserData={setGlobalUserData} component={Dashboard} />
                    } />
                    <Route path="/budgets" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} db={db} auth={auth} userId={userId} userData={userData} setGlobalUserData={setGlobalUserData} component={Budgets} />
                    } />
                    <Route path="/transactions" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} db={db} auth={auth} userId={userId} userData={userData} setGlobalUserData={setGlobalUserData} component={Transactions} />
                    } />
                    <Route path="/accounts" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} db={db} auth={auth} userId={userId} userData={userData} setGlobalUserData={setGlobalUserData} component={Accounts} />
                    } />
                    <Route path="/goals" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} db={db} auth={auth} userId={userId} userData={userData} setGlobalUserData={setGlobalUserData} component={Goals} />
                    } />
                    <Route path="/admin" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} db={db} auth={auth} userId={userId} userData={userData} setGlobalUserData={setGlobalUserData} component={AdminPanel} />
                    } />
                    <Route path="/profile-settings" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} db={db} auth={auth} userId={userId} userData={userData} setGlobalUserData={setGlobalUserData} component={ProfileSettings} />
                    } />
                    <Route path="/forum" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} db={db} auth={auth} userId={userId} userData={userData} setGlobalUserData={setGlobalUserData} component={Forum} />
                    } />
                     <Route path="/settings" element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} db={db} auth={auth} userId={userId} userData={userData} setGlobalUserData={setGlobalUserData} component={Settings} />
                    } />
                </Routes>
            </main>
        </Router>
    );
}

export default App;
