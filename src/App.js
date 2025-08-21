// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Імпортуємо Firebase
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'; // Імпортуємо doc, getDoc, setDoc, onSnapshot

// Імпортуємо компоненти сторінок
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Auth/Login'; // Corrected path
import Register from './pages/Auth/Register'; // Corrected path
import Goals from './pages/Goals/Goals';
import Budgets from './pages/Budgets/Budgets';
import Transactions from './pages/Transactions/Transactions';
import Accounts from './pages/Accounts/Accounts';
import AdminPanel from './pages/AdminPanel/AdminPanel';
import ProfileSettings from './pages/ProfileSettings/ProfileSettings';
import LandingPage from './pages/LandingPage/LandingPage'; // Import LandingPage

// New static pages
import AboutUs from './pages/AboutUs/AboutUs';
import Careers from './pages/Careers/Careers';
import ContactUs from './pages/ContactUs/ContactUs';
import Blog from './pages/Blog/Blog';
import Forum from './pages/Forum/Forum';
import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse/TermsOfUse';
import CookiePolicy from './pages/CookiePolicy/CookiePolicy';


// Wrapper function for protected routes
function ProtectedRoute({ children, isAuthenticated, db, auth, userId, userData, setGlobalUserData }) {
    const navigate = useNavigate();
    const currentLocation = window.location.pathname;

    useEffect(() => {
        // If user is not authenticated and tries to access a protected route, redirect to login page
        // Protected routes are defined implicitly by NOT being in publicPaths
        if (isAuthenticated === false && ![
            '/', '/login', '/register', '/about-us', '/careers', '/contact-us',
            '/blog', '/forum', '/privacy-policy', '/terms-of-use', '/cookie-policy'
        ].includes(currentLocation)) {
            navigate('/login');
        }
        // If user is authenticated and on login/register pages, redirect to dashboard
        else if (isAuthenticated === true && (currentLocation === '/login' || currentLocation === '/register')) {
            navigate('/dashboard'); // Redirect to /dashboard
        }
    }, [isAuthenticated, navigate, currentLocation]);

    // Show loading while authentication status is being determined
    if (isAuthenticated === null) {
        return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans']">Завантаження...</div>;
    }

    // Only render children with Firebase props if authenticated, otherwise null (will be redirected if protected)
    return isAuthenticated ? React.cloneElement(children, { db, auth, userId, userData, setGlobalUserData }) : null;
}

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userData, setUserData] = useState(null); // New state for user profile data

    // Function to update userData from child components
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
                        console.error("App.js: Error signing in with custom token:", error);
                        try {
                            await signInAnonymously(authInstance);
                        } catch (anonError) {
                            console.error("App.js: Error signing in anonymously:", anonError);
                            setIsAuthenticated(false);
                            setUserId(null);
                        }
                    }
                } else {
                    try {
                        await signInAnonymously(authInstance);
                    } catch (anonError) {
                        console.error("App.js: Error signing in anonymously (no initialAuthToken):", anonError);
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

                    // Get user profile data from Firestore using onSnapshot for reactivity
                    try {
                        const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';
                        const userProfileRef = doc(dbInstance, `/artifacts/${appId}/public/data/user_profiles`, user.uid);
                        // Using onSnapshot to react to real-time changes
                        const unsubscribeProfile = onSnapshot(userProfileRef, (docSnap) => {
                            if (docSnap.exists()) {
                                setUserData({ id: user.uid, ...docSnap.data() });
                            } else {
                                // If profile doesn't exist, initialize its email from Auth.
                                // firstName and lastName will be empty until the user enters them.
                                setUserData({ id: user.uid, email: user.email, firstName: '', lastName: '' });
                                // Create an empty profile so it exists in Firestore upon first login.
                                setDoc(userProfileRef, { email: user.email, userId: user.uid, createdAt: new Date().toISOString() }, { merge: true }).catch(err => console.error("Error creating initial user profile:", err));
                            }
                        }, (error) => {
                            console.error("App.js: Error getting user profile from onSnapshot:", error);
                            setUserData({ id: user.uid, email: user.email, firstName: '', lastName: '' }); // Fallback
                        });
                        return () => unsubscribeProfile(); // Unsubscribe when component unmounts or user changes
                    } catch (profileError) {
                        console.error("App.js: Error getting user profile (initial fetch):", profileError);
                        setUserData({ id: user.uid, email: user.email, firstName: '', lastName: '' }); // Fallback
                    }

                } else {
                    setIsAuthenticated(false);
                    setUserId(null);
                    setUserData(null);
                }
            });

            return () => unsubscribe();
        } else {
            console.error("App.js: Firebase configuration unavailable or incomplete. Authentication will not function correctly.");
            setIsAuthenticated(false);
            setUserId(null);
            setUserData(null);
        }
    }, []);

    return (
        <Router>
            <main className="flex-grow">
                <Routes>
                    {/* New main page, which is now LandingPage */}
                    <Route path="/" element={<LandingPage />} />

                    <Route path="/login" element={<Login db={db} auth={auth} />} />
                    <Route path="/register" element={<Register db={db} auth={auth} />} />

                    {/* Protected routes that require authentication and Firebase props */}
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

                    {/* Routes for static pages that do NOT require authentication or special Firebase props.
                        They receive userId and userData, but these are optional and mostly for consistent header/sidebar display. */}
                    <Route path="/about-us" element={<AboutUs userId={userId} userData={userData} />} />
                    <Route path="/careers" element={<Careers userId={userId} userData={userData} />} />
                    <Route path="/contact-us" element={<ContactUs userId={userId} userData={userData} />} />
                    <Route path="/blog" element={<Blog userId={userId} userData={userData} />} />
                    <Route path="/forum" element={<Forum userId={userId} userData={userData} />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy userId={userId} userData={userData} />} />
                    <Route path="/terms-of-use" element={<TermsOfUse userId={userId} userData={userData} />} />
                    <Route path="/cookie-policy" element={<CookiePolicy userId={userId} userData={userData} />} />

                </Routes>
            </main>
        </Router>
    );
}

export default App;
