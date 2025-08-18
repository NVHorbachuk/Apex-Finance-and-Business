// src/pages/Auth/Login.js
import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
// import { useNavigate } from 'react-router-dom'; // Видалено useNavigate

const logoUrl = "/image.png";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // const navigate = useNavigate(); // Видалено ініціалізацію useNavigate

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log('Login: Спроба входу для email:', email);

    try {
      const auth = getAuth();
      console.log('Login: Виклик signInWithEmailAndPassword...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login: Користувач успішно увійшов:', userCredential.user);

      console.log('Login: Перенаправлення на дашборд з Login.js через window.location.href...');
      window.location.href = '/'; // Використовуємо window.location.href

    } catch (error) {
      console.error('Login: Помилка входу (детально):', error);
      console.error('Login: Повідомлення про помилку:', error.message);

      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Невірний логін або пароль.');
          break;
        case 'auth/invalid-email':
          setError('Невірний формат електронної пошти.');
          break;
        default:
          setError(`Помилка входу: ${error.message || 'Будь ласка, спробуйте ще раз.'}`);
      }
    } finally {
      setLoading(false);
      console.log('Login: Процес входу завершено.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center p-4 font-['DM Sans']">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center border border-gray-200">
        <div className="mb-6">
          <img src={logoUrl} alt="Apex Finance Logo" className="mx-auto w-24 h-24 object-contain" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Log in to your account</h2>
        <p className="text-gray-600 mb-6">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
            Sign Up
          </a>
        </p>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-left text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              id="email"
              placeholder=" "
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-left text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              id="password"
              placeholder=" "
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-start">
            <label className="flex items-center text-gray-700 text-sm">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 rounded mr-2"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
          </div>
          <button
            type="submit"
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Вхід...' : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition duration-300 ease-in-out hover:bg-gray-50 shadow-sm"
            onClick={() => console.log('Continue with Google')}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google Logo" className="w-5 h-5 mr-3" />
            Continue with Google
          </button>
          <button
            type="button"
            className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition duration-300 ease-in-out hover:bg-gray-50 shadow-sm"
            onClick={() => console.log('Continue with Facebook')}
          >
            <img src="https://www.facebook.com/favicon.ico" alt="Facebook Logo" className="w-5 h-5 mr-3" />
            Continue with Facebook
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
