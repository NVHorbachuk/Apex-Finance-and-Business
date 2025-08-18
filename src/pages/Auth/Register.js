import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const logoUrl = "/image.png";

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Починаємо завантаження

    if (password !== confirmPassword) {
      setError('Паролі не співпадають!');
      setLoading(false); // Завершуємо завантаження, якщо паролі не співпадають
      return;
    }

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Користувач успішно зареєстрований:', userCredential.user);
      navigate('/'); // Перенаправляємо на дашборд після успішної реєстрації
    } catch (error) {
      console.error('Помилка реєстрації:', error.message);
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('Користувач з цією електронною поштою вже існує.');
          break;
        case 'auth/invalid-email':
          setError('Невірний формат електронної пошти.');
          break;
        case 'auth/weak-password':
          setError('Пароль має бути не менше 6 символів.');
          break;
        default:
          setError(`Помилка реєстрації: ${error.message || 'Будь ласка, спробуйте ще раз.'}`);
      }
    } finally {
      setLoading(false); // Завершуємо завантаження незалежно від успіху/невдачі
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 font-['Inter']">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 max-w-md w-full text-center transform transition-all duration-300 hover:scale-105">
        {/* Логотип */}
        <div className="mb-6">
          <img
            src={logoUrl}
            alt="Apex Finance Logo"
            className="mx-auto w-28 h-28 object-contain rounded-full shadow-md"
            // Додаємо заглушку, якщо зображення не завантажується
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/112x112/A7C7E7/FFFFFF?text=Logo";
            }}
          />
        </div>

        {/* Заголовок та посилання на вхід */}
        <h2 className="text-4xl font-extrabold text-gray-800 mb-2">Створити обліковий запис</h2>
        <p className="text-gray-600 mb-8">
          Вже маєте обліковий запис?{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200">
            Увійти
          </a>
        </p>

        {/* Повідомлення про помилку */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6" role="alert">
            <p className="font-semibold mb-1">Помилка!</p>
            <p>{error}</p>
          </div>
        )}

        {/* Форма реєстрації */}
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-left text-gray-700 text-sm font-semibold mb-2">
              Електронна пошта
            </label>
            <input
              type="email"
              id="email"
              placeholder="ваша.пошта@example.com"
              className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-400 transition-all duration-200 text-gray-800 placeholder-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-left text-gray-700 text-sm font-semibold mb-2">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              placeholder="Мінімум 6 символів"
              className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-400 transition-all duration-200 text-gray-800 placeholder-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-left text-gray-700 text-sm font-semibold mb-2">
              Підтвердіть пароль
            </label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Повторіть пароль"
              className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-400 transition-all duration-200 text-gray-800 placeholder-gray-400"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-300 active:bg-green-800 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Реєстрація...' : 'Зареєструватися'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;