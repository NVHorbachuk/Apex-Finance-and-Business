import React, { useState, useEffect } from 'react';

const NFTProjectPage = () => {
    // State to manage FAQ accordion
    const [openFaq, setOpenFaq] = useState(null);

    // Додаємо console.log, щоб перевірити, чи монтується компонент
    useEffect(() => {
        console.log("NFTProjectPage component has mounted and is trying to render.");
    }, []);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const SpiggyPersonality = ({ image, name }) => (
        <div className="text-center">
            <img src={image} alt={name} className="w-24 h-24 rounded-full mx-auto mb-2 shadow-md" />
            <p className="text-gray-700 text-sm font-medium">{name}</p>
        </div>
    );

    // Оновлений компонент TeamMember
    const TeamMember = ({ name, role, avatar, linkedinUrl }) => ( // Додано linkedinUrl як пропс
        <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <img src={avatar} alt={name} className="w-24 h-24 rounded-full mb-3 object-cover border-4 border-blue-100" />
            <h4 className="text-lg font-semibold text-gray-800">{name}</h4>
            <p className="text-blue-600 text-sm">{role}</p>
            {/* Використовуємо linkedinUrl, якщо надано, інакше використовуємо '#' */}
            <a href={linkedinUrl || '#'} target="_blank" rel="noopener noreferrer" className="mt-2 text-gray-500 hover:text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.879a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
                </svg>
                LinkedIn
            </a>
        </div>
    );

    const FaqItem = ({ question, answer, index }) => (
        <div className="border-b border-gray-200 py-4">
            <button
                className="flex justify-between items-center w-full text-left font-semibold text-lg text-gray-800 hover:text-blue-600 focus:outline-none"
                onClick={() => toggleFaq(index)}
            >
                {question}
                <svg
                    className={`w-5 h-5 transition-transform ${openFaq === index ? 'rotate-180' : 'rotate-0'}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            {openFaq === index && (
                <p className="mt-3 text-gray-600 leading-relaxed">
                    {answer}
                </p>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 font-['Inter'] text-gray-800 p-4">
            <h1 className="text-4xl font-bold text-center text-blue-600 my-8">NFT Project Page - Знову перевіряємо!</h1>
            {/* Header / NFT Collection Section */}
            <header className="relative bg-white pt-16 pb-20 px-4 md:px-8 shadow-md rounded-lg">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0 md:space-x-12">
                    <div className="md:w-1/2 text-center md:text-left">
                        <p className="text-sm uppercase tracking-wider text-gray-500 mb-2">Spiggy</p>
                        <h1 className="text-5xl font-extrabold leading-tight mb-6">
                            Spendee NFT Collection
                        </h1>
                        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto md:mx-0">
                            Підключіть свій гаманець, щоб створити Spendee Piggy.
                        </p>
                        <button className="bg-emerald-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-emerald-600 transition-transform transform hover:scale-105 shadow-lg">
                            ПІДКЛЮЧИТИ ГАМАНЕЦЬ
                        </button>
                    </div>
                    <div className="md:w-1/2 grid grid-cols-3 gap-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-xl">
                        {[
                            'https://placehold.co/100x100/A7F3D0/065F46?text=NFT',
                            'https://placehold.co/100x100/FEE2E2/991B1B?text=NFT',
                            'https://placehold.co/100x100/DBEAFE/1E40AF?text=NFT',
                            'https://placehold.co/100x100/D1FAE5/065F46?text=NFT',
                            'https://placehold.co/100x100/FCE7F3/BE185D?text=NFT',
                            'https://placehold.co/100x100/E0E7FF/4338CA?text=NFT',
                            'https://placehold.co/100x100/FFF7ED/D97706?text=NFT',
                            'https://placehold.co/100x100/F3E8FF/7C3AED?text=NFT',
                            'https://placehold.co/100x100/DCFCE7/15803D?text=NFT',
                        ].map((src, index) => (
                            <img key={index} src={src} alt={`Spendee NFT ${index + 1}`} className="w-full h-auto rounded-xl object-cover shadow-sm" />
                        ))}
                    </div>
                </div>
                <div className="mt-16 text-center">
                    <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg">
                        КУПИТИ НА OPENSEA
                    </button>
                </div>
            </header>

            {/* Hi! I'm Spiggy Section */}
            <section className="py-20 px-4 md:px-8 bg-gradient-to-b from-gray-100 to-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-12 md:space-y-0 md:space-x-16">
                    <div className="md:w-1/2 text-center md:text-left">
                        <p className="text-sm uppercase tracking-wider text-gray-500 mb-2">НЕ ЗВИЧАЙНА СКАРБНИЧКА</p>
                        <h2 className="text-4xl font-extrabold leading-tight mb-6">
                            Привіт! Я Спіґґі <span className="text-pink-500 text-5xl">🐷</span>
                        </h2>
                        <p className="text-lg text-gray-700 mb-6">
                            Моя місія — безперешкодно з'єднати світ криптовалют і традиційних грошей. Я вже подбала про ваші фінанси, дозвольте мені провести вас у світ криптовалют.
                        </p>
                        <div className="flex justify-center md:justify-start space-x-8 text-center mt-8">
                            <div className="p-4 bg-white rounded-lg shadow-sm">
                                <p className="text-2xl font-bold text-blue-600">0.06 ETH</p>
                                <p className="text-sm text-gray-500">У відкритому продажі</p>
                            </div>
                            <div className="p-4 bg-white rounded-lg shadow-sm">
                                <p className="text-2xl font-bold text-purple-600">8</p>
                                <p className="text-sm text-gray-500">Особистостей</p>
                            </div>
                            <div className="p-4 bg-white rounded-lg shadow-sm">
                                <p className="text-2xl font-bold text-green-600">60</p>
                                <p className="text-sm text-gray-500">Мальованих рис</p>
                            </div>
                        </div>
                    </div>
                    <div className="md:w-1/2 flex justify-center">
                        {/*  */}
                        <img src="https://placehold.co/600x400/D1FAE5/065F46?text=Three+Piggies" alt="Three Piggies" className="rounded-xl shadow-lg max-w-full h-auto" />
                    </div>
                </div>
            </section>

            {/* Personalities Section */}
            <section className="py-20 px-4 md:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-10">У нашого Спіґґі 8 особистостей, яка ваша?</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
                        <SpiggyPersonality image="https://placehold.co/100x100/F0F9FF/0C4A6E?text=NFT" name="Художник" />
                        <SpiggyPersonality image="https://placehold.co/100x100/FEF2F2/7F1D1D?text=NFT" name="Мрійник" />
                        <SpiggyPersonality image="https://placehold.co/100x100/F0FDF4/166534?text=NFT" name="Науковець" />
                        <SpiggyPersonality image="https://placehold.co/100x100/ECFDF5/047857?text=NFT" name="Контролер" />
                        <SpiggyPersonality image="https://placehold.co/100x100/FFF7ED/9A3412?text=NFT" name="Дослідник" />
                        <SpiggyPersonality image="https://placehold.co/100x100/F5F3FF/5B21B6?text=NFT" name="Майстер" />
                        <SpiggyPersonality image="https://placehold.co/100x100/F0F9FF/0C4A6E?text=NFT" name="Мандрівник" />
                        <SpiggyPersonality image="https://placehold.co/100x100/FEF2F2/7F1D1D?text=NFT" name="Новатор" />
                    </div>
                </div>
            </section>

            {/* Holder Benefits Section */}
            <section className="py-20 px-4 md:px-8 bg-white">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl font-extrabold mb-12">Переваги для власників</h2>
                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg text-left">
                            <h3 className="text-2xl font-bold mb-4">Розблокуйте силу Spendee</h3>
                            <p className="text-gray-700 mb-4">
                                Отримайте необмежений доступ до всіх поточних та майбутніх функцій існуючої програми Spendee. Це більше, ніж просто скарбничка; це повна інтеграція Spendee Family! Ніколи не обмежуйте себе.
                            </p>
                            <p className="text-sm text-gray-500">✔️ 03/2022</p>
                            {/*  */}
                            <img src="https://placehold.co/400x250/C7D2FE/3730A3?text=Unlock+Spendee" alt="Unlock Spendee" className="mt-6 rounded-lg shadow-md" />
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-lg text-left">
                            <h3 className="text-2xl font-bold mb-4">Отримайте ексклюзивний доступ до Spendee</h3>
                            <p className="text-lg text-gray-700 mb-4">
                                Насолоджуйтесь пріоритетним доступом до мерчу Spendee, дропів, розіграшів, квестів та ексклюзивних подій, що зарезервовані лише для власників токенів. І ви не просто власник токена, ви — один з нас!
                            </p>
                            <p className="text-sm text-gray-500">✔️ Після 100% мінту</p>
                            {/*  */}
                            <img src="https://placehold.co/400x250/D1FAE5/065F46?text=Exclusive+Access" alt="Exclusive Access" className="mt-6 rounded-lg shadow-md" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Crypto Future Section */}
            <section className="py-20 px-4 md:px-8 bg-gray-100">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl font-extrabold mb-12">Будьте частиною нашого крипто-майбутнього</h2>
                    <div className="relative flex flex-col items-center">
                        {/* Timeline line */}
                        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-300"></div>

                        <div className="grid md:grid-cols-2 gap-16 w-full max-w-5xl">
                            {/* Item 1 */}
                            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-right md:justify-end">
                                <div className="md:w-1/2 order-2 md:order-1 p-4">
                                    <h3 className="text-2xl font-bold mb-3">Аналізуйте свої криптовалюти так, як ви знаєте</h3>
                                    <p className="text-gray-700">
                                        Ми віримо, що криптовалюти мають бути такими ж легкими для розуміння, як і традиційні фінанси. Вам потрібно їх аналізувати так, як ви знаєте.
                                    </p>
                                </div>
                                <div className="md:w-1/2 order-1 md:order-2 flex justify-center p-4">
                                    {/*  */}
                                    <img src="https://placehold.co/200x400/E0F2FE/0B5D9F?text=App+Screen+1" alt="App Screen 1" className="rounded-xl shadow-lg" />
                                </div>
                            </div>
                            {/* Spacer for timeline dot */}
                            <div className="hidden md:block"></div>

                            {/* Item 2 */}
                            <div className="hidden md:block"></div> {/* Spacer for timeline dot */}
                            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
                                <div className="md:w-1/2 p-4">
                                    {/*  */}
                                    <img src="https://placehold.co/200x400/E0F2FE/0B5D9F?text=App+Screen+2" alt="App Screen 2" className="rounded-xl shadow-lg" />
                                </div>
                                <div className="md:w-1/2 p-4">
                                    <h3 className="text-2xl font-bold mb-3">Регулярні інвестиції</h3>
                                    <p className="text-gray-700">
                                        Повні гаманці щомісяця і заробляйте з кожною іншою криптою, але в потрібний час. Ми використовуємо DCA (усереднення доларової вартості).
                                    </p>
                                </div>
                            </div>

                            {/* Item 3 */}
                            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-right md:justify-end">
                                <div className="md:w-1/2 order-2 md:order-1 p-4">
                                    <h3 className="text-2xl font-bold mb-3">Колекція Crosschain NFT</h3>
                                    <p className="text-gray-700">
                                        У вас коли-небудь був Spiggy? NFT на Ethereum, Solana, Cardano? Як їх відстежити?
                                    </p>
                                </div>
                                <div className="md:w-1/2 order-1 md:order-2 flex justify-center p-4">
                                    {/*  */}
                                    <img src="https://placehold.co/200x400/E0F2FE/0B5D9F?text=App+Screen+3" alt="App Screen 3" className="rounded-xl shadow-lg" />
                                </div>
                            </div>
                            {/* Spacer for timeline dot */}
                            <div className="hidden md:block"></div>

                            {/* Item 4 */}
                            <div className="hidden md:block"></div> {/* Spacer for timeline dot */}
                            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
                                <div className="md:w-1/2 p-4">
                                    {/*  */}
                                    <img src="https://placehold.co/200x400/E0F2FE/0B5D9F?text=App+Screen+4" alt="App Screen 4" className="rounded-xl shadow-lg" />
                                </div>
                                <div className="md:w-1/2 p-4">
                                    <h3 className="text-2xl font-bold mb-3">Доступ до світу DeFi</h3>
                                    <p className="text-gray-700">
                                        Світ DeFi дозволяє вам інвестувати та збільшувати свої гроші. Ви можете заблокувати свою криптографію в смарт-контрактах.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Super easy buying and swapping cryptos */}
            <section className="py-20 px-4 md:px-8 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-12 md:space-y-0 md:space-x-16">
                    <div className="md:w-1/2 flex justify-center">
                        {/*  */}
                        <img src="https://placehold.co/400x250/C7D2FE/3730A3?text=Easy+Crypto" alt="Easy Crypto" className="rounded-xl shadow-lg max-w-full h-auto" />
                    </div>
                    <div className="md:w-1/2 text-center md:text-left">
                        <h2 className="text-4xl font-extrabold leading-tight mb-6">
                            Надзвичайно легка купівля та обмін криптовалют
                        </h2>
                        <p className="text-lg text-gray-700 mb-6">
                            Чи думали ви коли-небудь, як купити біткойн? Або швидко обміняти одну криптовалюту на іншу через Spendee for Crypto — у вас буде все. Обміняйте свої існуючі криптовалюти на інші або купуйте криптовалюти за допомогою картки? Все це можна зробити всього за кілька кроків.
                        </p>
                    </div>
                </div>
            </section>

            {/* Spendee Team Section */}
            <section className="py-20 px-4 md:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl font-extrabold mb-12">Команда Spendee</h2>
                    <p className="text-lg text-gray-600 mb-10">
                        Ми працюємо над створенням дивовижного фінансового світу для всіх
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Приклади використання компонента TeamMember з і без linkedinUrl */}
                        <TeamMember name="Девід" role="CEO & Засновник" avatar="https://placehold.co/100x100/F0F9FF/0C4A6E?text=D" linkedinUrl="https://ua.linkedin.com/in/david-profile" />
                        <TeamMember name="Якуб" role="CTO & Співзасновник" avatar="https://placehold.co/100x100/FEF2F2/7F1D1D?text=J" linkedinUrl="https://ua.linkedin.com/in/jakub-profile" />
                        <TeamMember name="Павла" role="Дизайнер" avatar="https://placehold.co/100x100/F0FDF4/166534?text=P" linkedinUrl="https://ua.linkedin.com/in/pavla-profile" />
                        <TeamMember name="Людмила" role="Маркетолог" avatar="https://placehold.co/100x100/ECFDF5/047857?text=L" /> {/* Без конкретного URL, буде використовувати '#' */}
                    </div>
                    <p className="text-gray-500 mt-8">та 8 інших членів команди</p>
                </div>
            </section>

            {/* Mint NFT CTA Section */}
            <section className="py-20 px-4 md:px-8 bg-emerald-500 text-white text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl font-extrabold mb-6">Отримайте свій #1 NFT для особистих фінансів</h2>
                    <p className="text-lg opacity-90 mb-10">Не чекайте</p>
                    <button className="bg-white text-emerald-600 px-10 py-5 rounded-full text-xl font-bold hover:bg-gray-100 transition-transform transform hover:scale-105 shadow-lg">
                        МИНТИТИ ЗАРАЗ
                    </button>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 px-4 md:px-8 bg-white">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-5xl font-extrabold text-center text-gray-300 mb-4">FAQ</h2>
                    <p className="text-lg text-gray-600 text-center mb-12">
                        Цікаво? Тут ви можете знайти відповідь.
                    </p>
                    <div className="space-y-4">
                        <FaqItem
                            index={1}
                            question="Як мені створити Spendee NFT?"
                            answer="Для створення Spendee NFT вам потрібно підключити свій крипто-гаманець (наприклад, MetaMask) до нашої платформи та слідувати інструкціям з мінтингу. Переконайтеся, що у вас достатньо ETH для покриття комісій за газ."
                        />
                        <FaqItem
                            index={2}
                            question="Чому я повинен купити Spendee Piggy NFT?"
                            answer="Придбання Spendee Piggy NFT надає вам доступ до преміум-функцій програми Spendee, ексклюзивних переваг для власників, раннього доступу до нових функцій, а також можливість стати частиною спільноти, орієнтованої на крипто-фінанси."
                        />
                        {/* Коментар був переміщений на окремий рядок, щоб уникнути синтаксичної помилки JSX */}
                        <FaqItem
                            index={3}
                            question="Чим це відрізняється від звичайної преміум-ліцензії на все життя?"
                            answer="Spendee Piggy NFT – це більше, ніж просто ліцензія. Це цифровий актив, який надає вам володіння та утиліту в екосистемі Spendee, включаючи доступ до ексклюзивного вмісту, голосування за функції та можливості заробітку, що не пропонує традиційна ліцензія."
                        />
                        <FaqItem
                            index={4}
                            question="Чи будуть ті ж колекції знову в майбутньому?"
                            answer="Кожна колекція NFT є унікальною і має обмежену кількість. Хоча можуть бути випущені нові колекції з різними художніми стилями та функціями, ця конкретна колекція Spendee Piggy NFT є лімітованим випуском."
                        />
                         <FaqItem
                            index={5}
                            question="Що я можу робити зі Spendee Piggy NFT?"
                            answer="Ви можете демонструвати його як свій аватар, торгувати ним на вторинних ринках, використовувати його для розблокування функцій Spendee Premium та брати участь в ексклюзивних подіях спільноти. Потенційні можливості для P2E (Play-to-Earn) та стейкінгу можуть бути додані в майбутньому."
                        />
                        <FaqItem
                            index={6}
                            question="Яка токеноміка проекту?"
                            answer="Токеноміка проекту розроблена для створення цінності та стійкості. Вона включає обмежену пропозицію NFT, роялті з вторинних продажів, які йдуть на розвиток проекту, та потенційні механізми стейкінгу, які надаватимуть власникам винагороди."
                        />
                        <FaqItem
                            index={7}
                            question="Чи отримую я повне право власності на свій NFT?"
                            answer="Так, коли ви купуєте Spendee Piggy NFT, ви отримуєте повне право власності на токен NFT, який зберігається у вашому гаманці. Це включає право торгувати, дарувати або продавати його на вторинних ринках."
                        />
                         <FaqItem
                            index={8}
                            question="Що таке NFT?"
                            answer="NFT (незмінний токен) – це унікальний криптографічний токен, що існує в блокчейні і представляє унікальний предмет. NFT можуть бути чим завгодно: від цифрових картин до віртуальних нерухомості."
                        />
                         <FaqItem
                            index={9}
                            question="Що таке Metamask?"
                            answer="MetaMask – це крипто-гаманець та шлюз до додатків на основі блокчейну. Він дозволяє користувачам керувати своїми обліковими записами Ethereum, зберігати ETH та інші токени ERC-20, а також взаємодіяти з децентралізованими додатками (DApps)."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-10 px-4 md:px-8 text-center">
                <div className="max-w-7xl mx-auto">
                    <p className="mb-4">Smart Contract Address: 0xBeAcBdeA00000000000000000000000000000000</p>
                    <p className="mb-6">
                        Spendee NFT створено з ❤️ за SYSDOCT.
                        <br />
                        Колекція ілюстрована Анастасією Орловою (AnDiDi).
                    </p>
                    <div className="flex justify-center space-x-6 mb-6">
                        {/* Використовуємо placeholder URL для соціальних мереж */}
                        <a href="https://twitter.com/spendee" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                            <i className="fab fa-twitter text-2xl"></i> {/* Twitter icon */}
                        </a>
                        <a href="https://instagram.com/spendee" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                            <i className="fab fa-instagram text-2xl"></i> {/* Instagram icon */}
                        </a>
                        <a href="https://facebook.com/spendee" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                            <i className="fab fa-facebook-f text-2xl"></i> {/* Facebook icon */}
                        </a>
                    </div>
                    <p>&copy; 2024 Spendee NFT. Усі права захищені.</p>
                </div>
            </footer>
        </div>
    );
};

export default NFTProjectPage;
