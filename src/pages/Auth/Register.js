// src/pages/Auth/Register.js
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
    console.log('Register: Спроба реєстрації для email:', email); // Детальне логування

    if (password !== confirmPassword) {
      setError('Паролі не співпадають!');
      console.log('Register: Паролі не співпадають.'); // Детальне логування
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth();
      console.log('Register: Виклик createUserWithEmailAndPassword...'); // Детальне логування
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Register: Користувач успішно зареєстрований:', userCredential.user); // Детальне логування

      console.log('Register: Перенаправлення на дашборд з Register.js...');
      navigate('/');

    } catch (error) {
      console.error('Register: Помилка реєстрації (детально):', error); // Детальне логування об'єкта помилки
      console.error('Register: Повідомлення про помилку:', error.message); // Детальне логування повідомлення про помилку

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
          setError(`Помилка реєстрації: ${error.message || 'Будь ласка, спробуйте ще раз.'}`); // Більш детальна помилка
      }
    } finally {
      setLoading(false);
      console.log('Register: Процес реєстрації завершено.'); // Детальне логування
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center p-4 font-['DM Sans']">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center border border-gray-200">
        {/* Logo section */}
        <div className="mb-6">
          <img src={logoUrl} alt="Apex Finance Logo" className="mx-auto w-24 h-24 object-contain" />
        </div>

        {/* Title and Login Link */}
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Створити новий обліковий запис</h2>
        <p className="text-gray-600 mb-6">
          Вже маєте обліковий запис?{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
            Увійти
          </a>
        </p>

        {/* Display error messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-left text-gray-700 text-sm font-bold mb-2">Електронна пошта</label>
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
            <label htmlFor="password" className="block text-left text-gray-700 text-sm font-bold mb-2">Пароль</label>
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
          <div>
            <label htmlFor="confirmPassword" className="block text-left text-gray-700 text-sm font-bold mb-2">Підтвердіть пароль</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder=" "
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} // ВИПРАВЛЕНО: .target.checked на .target.value
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Реєстрація...' : 'Зареєструватися'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register; // ДОДАНО export default
