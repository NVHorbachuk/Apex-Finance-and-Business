import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

// URL для логотипу. Використовуємо заглушку, що імітує іконку із зображення
const logoUrl = "https://placehold.co/120x120/E0EAF4/6A95B6?text=?";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Користувач успішно увійшов!');
      navigate('/');
    } catch (error) {
      console.error('Помилка входу:', error.message);
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Неправильна електронна пошта або пароль.');
          break;
        case 'auth/invalid-email':
          setError('Невірний формат електронної пошти.');
          break;
        default:
          setError(`Помилка входу: ${error.message || 'Будь ласка, спробуйте ще раз.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Функції-заглушки для соціального входу (потрібна реалізація)
  const handleSocialLogin = (provider) => {
    setError(`Авторизація через ${provider} ще не реалізована.`);
    // Тут буде логіка для входу через Google/Facebook
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-['Inter']">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-sm w-full text-center">
        {/* Логотип */}
        <div className="mb-8">
          <img
            src={logoUrl}
            alt="Логотип"
            className="mx-auto w-28 h-28 object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/112x112/E0EAF4/6A95B6?text=?"; // Заглушка, якщо зображення не завантажується
            }}
          />
        </div>

        {/* Заголовок та посилання на реєстрацію */}
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Увійдіть у свій обліковий запис</h2>
        <p className="text-gray-600 text-sm mb-6">
          Не маєте облікового запису?{' '}
          <a href="/register" className="text-blue-600 hover:underline font-medium transition-colors duration-200">
            Зареєструватися
          </a>
        </p>

        {/* Повідомлення про помилку */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-md mb-4" role="alert">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Форма входу */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-left text-gray-700 text-sm font-medium mb-1">Електронна пошта</label>
            <input
              type="email"
              id="email"
              placeholder=""
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-left text-gray-700 text-sm font-medium mb-1">Пароль</label>
            <input
              type="password"
              id="password"
              placeholder=""
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Прапорець "Запам'ятати мене" */}
          <div className="flex items-center justify-start text-left">
            <input
              type="checkbox"
              id="rememberMe"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
              Запам'ятати мене
            </label>
          </div>

          {/* Кнопка входу */}
          <button
            type="submit"
            className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-sm transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Вхід...' : 'Увійти'}
          </button>
        </form>

        {/* Розділювач "АБО" */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">АБО</span>
          </div>
        </div>

        {/* Кнопки соціального входу */}
        <div className="grid grid-cols-2 gap-2 mt-4"> {/* Використовуємо grid для рівномірного розташування */}
          <button
            onClick={() => handleSocialLogin('Google')}
            className="flex flex-col items-center justify-center p-3 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200"
          >
            {/* Іконка Google - велика, як на зображенні */}
            <svg className="w-10 h-10 mb-1" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M44.5 20H24v8h11.2c-1.1 5.3-6 9.2-11.2 9.2-6.9 0-12.5-5.6-12.5-12.5S17.1 12.5 24 12.5c3.2 0 6.1 1.2 8.3 3.3L35.7 13c-2.8-2.6-6.6-4.5-11.7-4.5C14.7 8.5 7.5 15.7 7.5 25s7.2 16.5 16.5 16.5c10.2 0 17.5-7.3 17.5-16.5 0-1.1-.1-2.2-.3-3.2z" fill="#4285F4"/>
              <path d="M44.5 20H24v8h11.2c-1.1 5.3-6 9.2-11.2 9.2-6.9 0-12.5-5.6-12.5-12.5S17.1 12.5 24 12.5c3.2 0 6.1 1.2 8.3 3.3L35.7 13c-2.8-2.6-6.6-4.5-11.7-4.5C14.7 8.5 7.5 15.7 7.5 25s7.2 16.5 16.5 16.5c10.2 0 17.5-7.3 17.5-16.5 0-1.1-.1-2.2-.3-3.2z" fill="url(#b)"/>
              <defs>
                <linearGradient id="b" x1="6.892" y1="9.755" x2="38.747" y2="40.245" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1A73E8"/>
                  <stop offset="1" stopColor="#3367D6"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="text-xs">Продовжити з Google</span>
          </button>
          <button
            onClick={() => handleSocialLogin('Facebook')}
            className="flex flex-col items-center justify-center p-3 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200"
          >
            {/* Іконка Facebook - велика, як на зображенні */}
            <svg className="w-10 h-10 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0">
              <path fill="#1877F2" d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.124 8.438 9.878v-6.987h-2.54V12h2.54V9.764c0-2.504 1.493-3.886 3.776-3.886 1.094 0 2.24.195 2.24.195v2.454H15.82c-1.24 0-1.62.772-1.62 1.56V12h2.77l-.443 2.891h-2.327V22c4.781-.754 8.438-4.887 8.438-9.878C22 6.477 17.523 2 12 2z"/>
            </svg>
            <span className="text-xs">Продовжити з Facebook</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;