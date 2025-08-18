// src/index.js (або ваш основний файл)
import React from 'react';
import ReactDOM from 'react-dom/client'; // Використовуйте createRoot для React 18+
import App from './App'; // Імпортуйте ваш основний компонент App
import './index.css'; // Переконайтеся, що ви імпортуєте глобальні стилі

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App /> {/* Ваша програма має бути обгорнута тут */}
  </React.StrictMode>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

