import React, { useState, useRef, useEffect } from 'react';

export const Header = () => {
  const menuItems = [
    {
      title: 'Файл',
      items: ['Новый проект', 'Открыть проект', 'Сохранить', 'Сохранить как...', 'Экспорт']
    },
    {
      title: 'Правка',
      items: ['Отменить', 'Повторить', 'Вырезать', 'Копировать', 'Вставить']
    },
    {
      title: 'Вид',
      items: ['Панель инструментов', 'Свойства', 'Масштаб', 'Полноэкранный режим']
    },
    {
      title: 'Справка',
      items: ['Документация', 'О программе', 'Проверить обновления']
    }
  ];

  return (
    <header id="header">
      <div className="header-wrapper">
        <div className="header-container">
          <div className="logo">
            <h1>Логический конструктор</h1>
          </div>
          <nav className="menu-bar">
            {menuItems.map((menu, index) => (
              <MenuItem 
                key={index}
                title={menu.title}
                items={menu.items}
                isLast={index >= menuItems.length - 2} // Для крайних 2 элементов
              />
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

const MenuItem = ({ title, items, isLast }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Закрытие меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      className="menu-item" 
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      ref={menuRef}
    >
      <span>{title}</span>
      {isOpen && (
        <div className={`dropdown-content ${isLast ? 'dropdown-right' : ''}`}>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <div className="dropdown-item">{item}</div>
              {index < items.length - 1 && <div className="dropdown-divider" />}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};