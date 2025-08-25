import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    GithubAuthProvider,
    FacebookAuthProvider,
    signInWithPopup
} from 'firebase/auth';

function Login({ auth, db }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Обробник входу за допомогою електронної пошти
    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard'); 
        } catch (err) {
            console.error("Помилка входу:", err);
            setError("Помилка входу: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Обробник входу за допомогою Google
    const handleGoogleLogin = async () => {
        setError(null);
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            navigate('/dashboard');
        } catch (err) {
            console.error("Помилка входу з Google:", err);
            setError("Помилка входу з Google: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Обробник входу за допомогою GitHub
    const handleGithubLogin = async () => {
        setError(null);
        setLoading(true);
        try {
            const provider = new GithubAuthProvider();
            await signInWithPopup(auth, provider);
            navigate('/dashboard');
        } catch (err) {
            console.error("Помилка входу з GitHub:", err);
            setError("Помилка входу з GitHub: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Обробник входу за допомогою Facebook
    const handleFacebookLogin = async () => {
        setError(null);
        setLoading(true);
        try {
            const provider = new FacebookAuthProvider();
            await signInWithPopup(auth, provider);
            navigate('/dashboard');
        } catch (err) {
            console.error("Помилка входу з Facebook:", err);
            setError("Помилка входу з Facebook: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Вхід</h2>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
                        <input
                            type="email"
                            id="email"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Пароль:</label>
                        <input
                            type="password"
                            id="password"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Вхід...' : 'Увійти'}
                    </button>
                </form>

                <div className="mt-6 text-center text-gray-600">
                    <p>Або увійдіть за допомогою:</p>
                    <div className="flex justify-center space-x-4 mt-4">
                        <button
                            onClick={handleGoogleLogin}
                            className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                            title="Увійти з Google"
                            disabled={loading}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.002 4.26a5.748 5.748 0 00-4.606 2.373l-2.618 2.037c-.958-1.554-1.503-3.328-1.503-5.077C1.275 1.55 3.328.062 6.096.062c1.77 0 3.315.688 4.545 1.812l-2.062 1.624zm-.002 11.48c-2.42 0-4.524-1.375-5.63-3.385l-2.618 2.037c1.47 2.274 3.93 3.737 6.648 3.737 2.336 0 4.385-.884 5.92-2.31l-2.457-1.927c-1.125 1.09-2.585 1.768-4.323 1.768zM19.725 9.043c0-.688-.063-1.313-.188-1.917h-9.537v3.587h5.45c-.25 1.48-.962 2.65-2.093 3.42l2.457 1.926c1.55-1.465 2.45-3.52 2.45-6.026z" />
                            </svg>
                        </button>
                        <button
                            onClick={handleGithubLogin}
                            className="bg-gray-800 text-white p-3 rounded-full hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 transition-colors duration-200"
                            title="Увійти з GitHub"
                            disabled={loading}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.419 2.865 8.165 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.15-.11-1.458-.11-1.458.37-.25.028-.245.028-.245.41.028.623.422.623.422.365.623.957.442 1.18.337.038-.26.143-.442.26-.543-1.13-.128-2.324-.567-2.324-2.522 0-.557.198-1.013.522-1.366-.052-.128-.225-.644.048-1.342 0 0 .425-.137 1.4-.526.4-.11.82-.164 1.25-.166.42.002.84.056 1.238.166.974.389 1.4.526 1.4.526.273.698.1.921.049 1.342.324.353.522.809.522 1.366 0 1.956-1.196 2.393-2.328 2.518.15.129.283.385.283.774 0 1.178-.011 2.67-.011 3.03 0 .267.18.575.688.484C21.136 20.164 24 16.418 24 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <button
                            onClick={handleFacebookLogin}
                            className="bg-blue-700 text-white p-3 rounded-full hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors duration-200"
                            title="Увійти з Facebook"
                            disabled={loading}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.505 1.492-3.899 3.777-3.899 1.094 0 2.238.195 2.238.195v2.46h-1.262c-1.226 0-1.628.767-1.628 1.563V12h2.773l-.443 2.89h-2.33V22C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>

                <p className="mt-6 text-center text-gray-600">
                    Немає облікового запису? <Link to="/register" className="text-blue-600 hover:underline">Зареєструватися</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
