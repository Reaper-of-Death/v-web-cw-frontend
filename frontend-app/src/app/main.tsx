import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';
import './styles/styles.css';

// Получаем корневой элемент
const rootElement = document.getElementById('root');

// Проверяем, существует ли элемент перед рендерингом
if (!rootElement) {
  throw new Error('Root element not found. Please check your HTML file.');
}

// Создаем корневой элемент React
const root = ReactDOM.createRoot(rootElement);

// Рендерим приложение
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);