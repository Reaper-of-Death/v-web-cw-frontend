import React, { useState, useRef, useEffect, type FC } from 'react';

// Типы для элементов меню
interface MenuItemType {
  title: string;
  items: string[];
}

// Пропсы для компонента Header
interface HeaderProps {
  // Можно добавить дополнительные пропсы при необходимости
}

// Пропсы для компонента MenuItem
interface MenuItemProps {
  title: string;
  items: string[];
  isLast?: boolean;
}

export const Header: FC<HeaderProps> = () => {
  const menuItems: MenuItemType[] = [
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

const MenuItem: FC<MenuItemProps> = ({ title, items, isLast = false }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Закрытие меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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