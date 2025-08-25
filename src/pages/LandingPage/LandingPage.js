import React from "react";
import { Link } from "react-router-dom";
import {
  AcademicCapIcon,
  ChartPieIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
// Removed: import { Dialog, DialogPanel } from '@headlessui/react';

// Шляхи до зображень, використовуючи надані імена файлів
const logoUrl = "/image.png";
const founder1ImageUrl = "/1755782105149.jpg";
const founder2ImageUrl = "/image_b2fe3d.png"; // Замінено на файл користувача
const founder3ImageUrl = "/IMG_20250717_213406.jpg"; // Замінено на файл користувача

function LandingPage() {
  // Стан для керування відкриттям/закриттям мобільного меню
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // useEffect для логування після монтування компонента (для налагодження)
  React.useEffect(() => {
    console.log("LandingPage component mounted.");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-green-100 font-['Inter'] text-gray-900 flex flex-col">
      {/* Верхній банер сповіщень */}
      <div className="bg-emerald-500 text-white p-3 text-center text-sm flex items-center justify-center space-x-2">
        <span>Розблокуйте Apex Finance Premium з NFT 🔗</span>
        <Link
          to="/nft-project"
          className="underline hover:text-gray-200 transition-colors"
        >
          {" "}
          {/* Посилання на сторінку проекту NFT */}
          Натисніть, щоб дізнатися про наш останній проект! 🚀
        </Link>
      </div>
      {/* Навігаційна панель */}

      <header className="py-5 px-8 bg-white bg-opacity-90 backdrop-blur-sm shadow-lg rounded-b-3xl">
        <div className="max-w-8xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img
              src={logoUrl}
              alt="APEX Finance Logo"
              className="h-12 w-12 mr-3 rounded-full shadow-md border border-gray-100"
            />
            <span className="text-3xl font-extrabold text-indigo-700 tracking-tight">
              APEX FINANCE
            </span>
          </div>
          {/* Мобільне меню - кнопка відкриття */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Відкрити головне меню</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <nav className="hidden lg:flex space-x-8 items-center">
            <Link
              to="/nft-project"
              className="text-lg font-medium text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-gray-50"
            >
              Проект NFT
            </Link>
            <a
              href="#features"
              className="text-lg font-medium text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-gray-50"
            >
              Продукт
            </a>
            <a
              href="#features"
              className="text-lg font-medium text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-gray-50"
            >
              Функції
            </a>
            <a
              href="#"
              className="text-lg font-medium text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-gray-50"
            >
              Маркетплейс
            </a>
            <a
              href="#"
              className="text-lg font-medium text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-gray-50"
            >
              Команда
            </a>
            <Link
              to="/login"
              className="text-lg font-medium text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-gray-50"
            >
              Увійти
            </Link>
            <Link
              to="/register"
              className="bg-indigo-600 text-white text-lg font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-105"
            >
              Зареєструватися
            </Link>
          </nav>
        </div>
      </header>

      {/* Мобільне меню (кастомна реалізація замість Headless UI Dialog) */}
      <div
        className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } lg:hidden`}
      >
        <div
          className="absolute inset-0 bg-black bg-opacity-40"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        ></div>{" "}
        {/* Затемнення фону */}
        <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="-m-1.5 p-1.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">APEX Finance</span>
              <img
                className="h-8 w-auto"
                src={logoUrl}
                alt="APEX Finance Logo"
              />
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Закрити меню</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                <Link
                  to="/nft-project"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Проект NFT
                </Link>
                <a
                  href="#features"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Продукт
                </a>
                <a
                  href="#features"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Функції
                </a>
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Маркетплейс
                </a>
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Команда
                </a>
              </div>
              <div className="py-6">
                <Link
                  to="/login"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Увійти
                </Link>
                <Link
                  to="/register"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Зареєструватися
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="relative py-24 md:py-40 text-center overflow-hidden flex-grow">
        <div className="absolute inset-0 z-0">
          {/* Приклад тонких фонових градієнтів та форм */}
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-300 opacity-20 rounded-full filter blur-3xl animate-blob"></div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-300 opacity-20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-green-300 opacity-20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-8 text-gray-900 animate-fade-in-up">
            Ваш шлях до фінансової ясності та свободи
          </h1>
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-3xl mx-auto text-gray-700 animate-fade-in-up animation-delay-500">
            Отримайте повний контроль над своїми фінансами, спростіть управління
            грошима та досягайте своїх цілей з APEX FINANCE.
          </p>
          <div className="flex justify-center space-x-6 animate-fade-in-up animation-delay-1000">
            <a
              href="#features"
              className="bg-indigo-600 text-white px-10 py-4 rounded-full text-xl font-semibold shadow-xl hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
            >
              Дізнатися більше
            </a>
            <Link
              to="/register"
              className="border-2 border-indigo-600 text-indigo-600 px-10 py-4 rounded-full text-xl font-semibold hover:bg-indigo-600 hover:text-white transition duration-300 transform hover:scale-105"
            >
              Почати зараз
            </Link>
          </div>

          <div className="mt-20 animate-fade-in-up animation-delay-1500 py-16 bg-white bg-opacity-80 rounded-3xl shadow-2xl border-2 border-blue-200">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-16 px-6">
              Наші засновники
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-6">
              {/* Засновник 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transform hover:scale-[1.03] transition-transform duration-300">
                <img
                  src={founder1ImageUrl}
                  alt="Назарій Горбачук"
                  className="h-32 w-32 rounded-full mx-auto mb-6 border-4 border-indigo-400 object-cover"
                />
                <h3 className="font-bold text-2xl text-gray-900 mb-2">
                  Назарій Горбачук
                </h3>
                <p className="text-indigo-600 font-semibold mb-4">
                  Головний виконавчий директор (CEO)
                </p>
                <p className="text-lg text-gray-700">
                  Назарій Вікторович - візіонер, який керує стратегією та
                  інноваціями APEX FINANCE, зосереджуючись на створенні зручних
                  фінансових рішень.
                </p>
              </div>
              {/* Засновник 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transform hover:scale-[1.03] transition-transform duration-300">
                <img
                  src={founder2ImageUrl}
                  alt="Стефунька Андрій-Святослав"
                  className="h-32 w-32 rounded-full mx-auto mb-6 border-4 border-indigo-400 object-cover"
                />
                <h3 className="font-bold text-2xl text-gray-900 mb-2">
                  Андрій Стефунька
                </h3>
                <p className="text-indigo-600 font-semibold mb-4">
                  Головний технічний директор (CTO)
                </p>
                <p className="text-lg text-gray-700">
                  Андрій Михайлович відповідає за архітектуру та розробку
                  технологічної платформи APEX FINANCE, забезпечуючи її
                  надійність та масштабованість.
                </p>
              </div>
              {/* Засновник 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transform hover:scale-[1.03] transition-transform duration-300">
                <img
                  src={founder3ImageUrl}
                  alt="Щерба Андрій"
                  className="h-32 w-32 rounded-full mx-auto mb-6 border-4 border-indigo-400 object-cover"
                />
                <h3 className="font-bold text-2xl text-gray-900 mb-2">
                  Андрій Щерба
                </h3>
                <p className="text-indigo-600 font-semibold mb-4">
                  Головний фінансовий директор (CFO)
                </p>
                <p className="text-lg text-gray-700">
                  Андрій Анатолійович керує фінансовими операціями та
                  стратегією, забезпечуючи стабільний ріст та відповідність
                  вимогам APEX FINANCE.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Секція "Ключові особливості" */}
      <section
        id="features"
        className="py-24 bg-white rounded-t-3xl shadow-inner"
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-16">
            Особливості, які вам сподобаються
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* Картка 1: Інтелектуальний бюджет */}
            <div className="p-10 rounded-2xl shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 transform hover:-translate-y-3 transition-transform duration-300 ease-out border border-blue-100">
              <AcademicCapIcon className="h-16 w-16 text-blue-600 mx-auto mb-8" />
              <h3 className="text-3xl font-bold mb-4 text-gray-900">
                Інтелектуальний бюджет
              </h3>
              <p className="text-lg text-gray-700">
                Створюйте персоналізовані бюджети, які адаптуються до ваших
                витрат, і отримуйте сповіщення, щоб залишатися на правильному
                шляху.
              </p>
            </div>
            {/* Картка 2: Комплексна звітність */}
            <div className="p-10 rounded-2xl shadow-xl bg-gradient-to-br from-green-50 to-teal-50 transform hover:-translate-y-3 transition-transform duration-300 ease-out border border-green-100">
              <ChartPieIcon className="h-16 w-16 text-green-600 mx-auto mb-8" />
              <h3 className="text-3xl font-bold mb-4 text-gray-900">
                Комплексна звітність
              </h3>
              <p className="text-lg text-gray-700">
                Отримуйте детальні графіки та звіти про свої доходи, витрати та
                заощадження, щоб приймати обґрунтовані фінансові рішення.
              </p>
            </div>
            {/* Картка 3: Захист даних */}
            <div className="p-10 rounded-2xl shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 transform hover:-translate-y-3 transition-transform duration-300 ease-out border border-purple-100">
              <ShieldCheckIcon className="h-16 w-16 text-purple-600 mx-auto mb-8" />
              <h3 className="text-3xl font-bold mb-4 text-gray-900">
                Захист даних
              </h3>
              <p className="text-lg text-gray-700">
                Ваші фінансові дані захищені за допомогою передових технологій
                шифрування та багаторівневих протоколів безпеки.
              </p>
            </div>
            {/* Картка 4: Управління цілями */}
            <div className="p-10 rounded-2xl shadow-xl bg-gradient-to-br from-orange-50 to-red-50 transform hover:-translate-y-3 transition-transform duration-300 ease-out border border-orange-100">
              <RocketLaunchIcon className="h-16 w-16 text-orange-600 mx-auto mb-8" />
              <h3 className="font-bold text-3xl mb-4 text-gray-900">
                Управління цілями
              </h3>
              <p className="text-lg text-gray-700">
                Встановлюйте та відстежуйте свої фінансові цілі – від великих
                покупок до пенсії – з нашими інтуїтивно зрозумілими
                інструментами.
              </p>
            </div>
            {/* Картка 5: Відстеження транзакцій */}
            <div className="p-10 rounded-2xl shadow-xl bg-gradient-to-br from-yellow-50 to-amber-50 transform hover:-translate-y-3 transition-transform duration-300 ease-out border border-yellow-100">
              <CheckCircleIcon className="h-16 w-16 text-yellow-600 mx-auto mb-8" />
              <h3 className="font-bold text-3xl mb-4 text-gray-900">
                Відстеження транзакцій
              </h3>
              <p className="text-lg text-gray-700">
                Легко відстежуйте всі свої транзакції, категоризуйте їх та
                отримуйте повний огляд своїх витрат.
              </p>
            </div>
            {/* Картка 6: Спільне використання */}
            <div className="p-10 rounded-2xl shadow-xl bg-gradient-to-br from-pink-50 to-fuchsia-50 transform hover:-translate-y-3 transition-transform duration-300 ease-out border border-pink-100">
              <UserGroupIcon className="h-16 w-16 text-fuchsia-600 mx-auto mb-8" />
              <h3 className="font-bold text-3xl mb-4 text-gray-900">
                Спільне використання
              </h3>
              <p className="text-lg text-gray-700">
                Спільне управління фінансами з партнером або сім'єю для
                досягнення спільних цілей.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Секція "Про нас говорять" */}
      <section className="py-24 bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-16">
            Про нас говорять
          </h2>
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-3xl mx-auto text-gray-700">
            APEX FINANCE високо оцінили як у вітчизняних, так і в міжнародних
            виданнях за інноваційність та зручність.
          </p>

          <div className="mb-16">
            <h3 className="text-3xl font-bold text-gray-800 mb-8">
              В українських виданнях
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-10">
              {/* Логотипи українських видань */}
              <img
                src="https://placehold.co/150x60/ADD8E6/000000?text=Forbes.ua"
                alt="Forbes Ukraine Logo"
                className="h-16 cursor-pointer transform hover:scale-110 transition-transform duration-200"
              />
              <img
                src="https://placehold.co/150x60/ADD8E6/000000?text=NV.ua"
                alt="NV Ukraine Logo"
                className="h-16 cursor-pointer transform hover:scale-110 transition-transform duration-200"
              />
              <img
                src="https://placehold.co/150x60/ADD8E6/000000?text=Економічна+Правда"
                alt="Ekonomichna Pravda Logo"
                className="h-16 cursor-pointer transform hover:scale-110 transition-transform duration-200"
              />
              <img
                src="https://placehold.co/150x60/ADD8E6/000000?text=Finance.ua"
                alt="Finance.ua Logo"
                className="h-16 cursor-pointer transform hover:scale-110 transition-transform duration-200"
              />
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-gray-800 mb-8">
              У зарубіжних виданнях
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-10">
              {/* Логотипи зарубіжних видань */}
              <img
                src="https://placehold.co/150x60/ADD8E6/000000?text=TechCrunch"
                alt="TechCrunch Logo"
                className="h-16 cursor-pointer transform hover:scale-110 transition-transform duration-200"
              />
              <img
                src="https://placehold.co/150x60/ADD8E6/000000?text=Bloomberg"
                alt="Bloomberg Logo"
                className="h-16 cursor-pointer transform hover:scale-110 transition-transform duration-200"
              />
              <img
                src="https://placehold.co/150x60/ADD8E6/000000?text=The+Fintech+Times"
                alt="The Fintech Times Logo"
                className="h-16 cursor-pointer transform hover:scale-110 transition-transform duration-200"
              />
              <img
                src="https://placehold.co/150x60/ADD8E6/000000?text=Financial+Times"
                alt="Financial Times Logo"
                className="h-16 cursor-pointer transform hover:scale-110 transition-transform duration-200"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Секція "Від відомих особистостей" */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-16">
            Що говорять про нас відомі особистості
          </h2>
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-3xl mx-auto text-gray-700">
            Дізнайтеся, чому лідери галузі та впливові особи довіряють APEX
            FINANCE для управління своїми фінансами.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Відгук 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transform hover:scale-[1.03] transition-transform duration-300">
              <p className="text-lg text-gray-700 mb-6 italic">
                "APEX FINANCE дозволив мені зосередитись на інноваціях, не
                турбуючись про дрібниці у фінансах. Це змінює правила гри для
                підприємців!"
              </p>
              <div className="flex items-center justify-center">
                <img
                  src="https://placehold.co/60x60/87CEEB/FFFFFF?text=В.д.Б."
                  alt="Аватар Ван ден Брінк."
                  className="h-14 w-14 rounded-full mr-4 border-2 border-indigo-400"
                />
                <div>
                  <p className="font-bold text-lg text-gray-900">
                    Ван ден Брінк
                  </p>
                  <p className="text-gray-600">Технологічний візіонер</p>
                </div>
              </div>
            </div>
            {/* Відгук 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transform hover:scale-[1.03] transition-transform duration-300">
              <p className="text-lg text-gray-700 mb-6 italic">
                "Я вражений тим, наскільки APEX FINANCE спрощує складні
                фінансові дані. Це обов'язково для кожного, хто прагне
                фінансової майстерності."
              </p>
              <div className="flex items-center justify-center">
                <img
                  src="https://placehold.co/60x60/87CEEB/FFFFFF?text=Н.Н.Т."
                  alt="Аватар Нассім Ніколас Талеб."
                  className="h-14 w-14 rounded-full mr-4 border-2 border-indigo-400"
                />
                <div>
                  <p className="font-bold text-lg text-gray-900">
                    Нассім Ніколас Талеб
                  </p>
                  <p className="text-gray-600">Фінансовий експерт</p>
                </div>
              </div>
            </div>
            {/* Відгук 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transform hover:scale-[1.03] transition-transform duration-300">
              <p className="text-lg text-gray-700 mb-6 italic">
                "Як інвестор, мені потрібен чіткий і точний огляд. APEX FINANCE
                надає мені інструменти, необхідні для прийняття розумних
                рішень."
              </p>
              <div className="flex items-center justify-center">
                <img
                  src="https://placehold.co/60x60/87CEEB/FFFFFF?text=С.Д."
                  alt="Стенлі Друкенміллер."
                  className="h-14 w-14 rounded-full mr-4 border-2 border-indigo-400"
                />
                <div>
                  <p className="font-bold text-lg text-gray-900">
                    Стенлі Друкенміллер
                  </p>
                  <p className="text-gray-600">Відомий інвестор</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Секція CTA */}
      <section className="bg-gradient-to-br from-indigo-700 to-purple-800 text-white py-20 rounded-t-3xl shadow-2xl">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Готові взяти під контроль свої фінанси?
          </h2>
          <p className="text-xl opacity-90 mb-12">
            Приєднуйтесь до тисяч задоволених користувачів, які вже змінили своє
            фінансове життя.
          </p>
          <form className="flex flex-col sm:flex-row justify-center items-center space-y-6 sm:space-y-0 sm:space-x-6">
            <input
              type="email"
              placeholder="Введіть свій email"
              className="w-full sm:w-96 p-4 rounded-xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-inner"
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-green-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-600 transition duration-300 shadow-lg transform hover:scale-105"
            >
              Почати безкоштовно
            </button>
          </form>
          <p className="text-sm opacity-80 mt-6">
            Я прочитав і згоден з{" "}
            <Link to="/terms-of-use" className="underline hover:text-white">
              Умовами та положеннями
            </Link>
          </p>
        </div>
      </section>

      {/* Футер */}
      <footer className="bg-gray-900 text-gray-300 py-12 rounded-b-3xl shadow-xl">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h4 className="font-bold text-gray-100 text-xl mb-5">
              APEX FINANCE
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about-us"
                  className="hover:text-white transition-colors duration-200"
                >
                  Про нас
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="hover:text-white transition-colors duration-200"
                >
                  Кар'єра
                </Link>
              </li>
              <li>
                <Link
                  to="/contact-us"
                  className="hover:text-white transition-colors duration-200"
                >
                  Контакти
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-100 text-xl mb-5">Спільнота</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/blog"
                  className="hover:text-white transition-colors duration-200"
                >
                  Блог
                </Link>
              </li>
              <li>
                <Link
                  to="/forum"
                  className="hover:text-white transition-colors duration-200"
                >
                  Форум
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="hover:text-white transition-colors duration-200"
                >
                  Поширені запитання
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-100 text-xl mb-5">Юридичні</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:text-white transition-colors duration-200"
                >
                  Політика конфіденційності
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-use"
                  className="hover:text-white transition-colors duration-200"
                >
                  Умови використання
                </Link>
              </li>
              <li>
                <Link
                  to="/cookie-policy"
                  className="hover:text-white transition-colors duration-200"
                >
                  Політика файлів cookie
                </Link>
              </li>
            </ul>
          </div>
          <div className="text-right md:text-left">
            <h4 className="font-bold text-gray-100 text-xl mb-5">
              Завантажте додаток
            </h4>
            <div className="space-y-4">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/2560px-Download_on_the_App_Store_Badge.svg.png"
                alt="App Store"
                className="h-14 cursor-pointer mx-auto md:mx-0 transition-transform duration-220 hover:scale-105"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/2560px-Google_Play_Store_badge_EN.svg.png"
                alt="Google Play"
                className="h-14 cursor-pointer mx-auto md:mx-0 transition-transform duration-220 hover:scale-105"
              />
            </div>
            <div className="flex justify-center md:justify-start space-x-6 mt-8">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transform hover:scale-110 transition-transform duration-200"
              >
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.505 1.492-3.899 3.777-3.899 1.094 0 2.238.195 2.238.195v2.46h-1.262c-1.226 0-1.628.767-1.628 1.563V12h2.773l-.443 2.89h-2.33V22C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transform hover:scale-110 transition-transform duration-200"
              >
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07c3.252.148 4.793 1.968 4.904 4.859.062 1.266.077 1.646.077 4.85s-.015 3.584-.077 4.85c-.111 2.891-1.652 4.711-4.904 4.859-1.266.058-1.646.073-4.85.073s-3.584-.015-4.85-.073c-3.252-.148-4.793-1.968-4.904-4.859-.062-1.266-.077-1.646-.077-4.85s.015-3.584.077-4.85c.111-2.891 1.652-4.711 4.904-4.859 1.266-.058 1.646-.073 4.85-.073zm0 1.837c-3.266 0-3.64.014-4.872.073-2.891.132-3.951 1.463-4.043 4.043-.059 1.232-.073 1.606-.073 4.872s.014 3.64.073 4.872c.092 2.58 1.152 3.911 4.043 4.043 1.232.059 1.606.073 4.872.073s3.64-.014 4.872-.073c2.891-.132 3.951-1.463 4.043-4.043.059-1.232.073-1.606.073-4.872s-.014-3.64-.073-4.872c-.092-2.58-1.152-3.911-4.043-4.043-1.232-.059-1.606-.073-4.872-.073zm0 3.65a3.65 3.65 0 100 7.3a3.65 3.65 0 000-7.3zm0 1.837a1.813 1.813 0 110 3.626 1.813 1.813 0 010-3.626zM18.326 5.86a.913.913 0 11-1.826 0 .913.913 0 011.826 0z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transform hover:scale-110 transition-transform duration-200"
              >
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 4.84 3.43 8.87 8 9.8V15H8v-3h2v-2.2c0-2.72 1.66-4.2 4.05-4.2.96 0 1.86.17 2.1.2v2.16h-1.28c-1.13 0-1.35.53-1.35 1.32V12h2.69l-.45 3h-2.24v6.79c4.57-.93 8-4.96 8-9.8C22 6.48 17.52 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 text-center text-gray-500 text-base">
          <p>
            &copy; {new Date().getFullYear()} APEX FINANCE. Всі права захищені.
          </p>
        </div>
      </footer>
      {/* Tailwind CSS keyframes для анімацій */}
      <style>
        {`
                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }

                .animate-blob {
                    animation: blob 7s infinite;
                }

                .animation-delay-2000 {
                    animation-delay: 2s;
                }

                .animation-delay-4000 {
                    animation-delay: 4s;
                }

                @keyframes fadeInTop {
                    0% {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in-up {
                    animation: fadeInTop 0.8s ease-out forwards;
                }

                .animation-delay-500 {
                    animation-delay: 0.5s;
                }

                .animation-delay-1000 {
                    animation-delay: 1s;
                }

                .animation-delay-1500 {
                    animation-delay: 1.5s;
                }

                @keyframes bounceSlow {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }

                .animate-bounce-slow {
                    animation: bounceSlow 2s infinite ease-in-out;
                }

                .animation-delay-200 {
                    animation-delay: 0.2s;
                }

                .animation-delay-400 {
                    animation-delay: 0.4s;
                }
                `}
      </style>
    </div>
  );
}

export default LandingPage;
