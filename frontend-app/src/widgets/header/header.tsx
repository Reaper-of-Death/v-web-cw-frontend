import React, { useState, useRef, useEffect } from 'react';

interface MenuItem {
  title: string;
  items: string[];
}

export const Header: React.FC = () => {
  const [projectName, setProjectName] = useState<string>('Новый проект');
  const menuItems: MenuItem[] = [
    {
      title: 'Файл',
      items: ['Новый проект', 'Открыть проект', 'Сохранить', 'Сохранить как...', 'Экспорт', 'Выход']
    },
    {
      title: 'Вид',
      items: ['Панель инструментов', 'Свойства', 'Масштаб', 'Полноэкранный режим', 'Сбросить вид']
    },
    {
      title: 'Справка',
      items: ['Документация', 'Примеры', 'О программе', 'Проверить обновления']
    }
  ];

  const handleFileAction = (action: string) => {
    console.log(`Выбрано действие: ${action}`);
    if (action === 'Новый проект') {
      setProjectName('Новый проект');
    }
  };

  return (
    <header id="header">
      {/* Верхняя строка - название конструктора */}
      <div className="constructor-title">
        <h1>Логический конструктор</h1>
      </div>
      
      {/* Основная панель */}
      <div className="header-main">
        <div className="project-info">
          <div className="project-icon">📁</div>
          <input 
            type="text" 
            className="project-name-input"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Название проекта"
          />
          {projectName === 'Новый проект' && (
            <span className="project-status new">Не сохранено</span>
          )}
        </div>
        
        <nav className="menu-bar">
          {menuItems.map((menu, index) => (
            <MenuItemComponent 
              key={index}
              menu={menu}
              onItemSelect={handleFileAction}
              isLast={index === menuItems.length - 1}
            />
          ))}
        </nav>
      </div>
    </header>
  );
};

interface MenuItemProps {
  menu: MenuItem;
  onItemSelect: (action: string) => void;
  isLast: boolean;
}

const MenuItemComponent: React.FC<MenuItemProps> = ({ menu, onItemSelect, isLast }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getShortcut = (item: string): string => {
    const shortcuts: Record<string, string> = {
      'Новый проект': 'Ctrl+N',
      'Открыть проект': 'Ctrl+O',
      'Сохранить': 'Ctrl+S',
      'Сохранить как...': 'Ctrl+Shift+S',
      'Выход': 'Ctrl+Q',
      'Отменить': 'Ctrl+Z',
      'Повторить': 'Ctrl+Y',
      'Копировать': 'Ctrl+C',
      'Вставить': 'Ctrl+V',
      'Полноэкранный режим': 'F11'
    };
    return shortcuts[item] || '';
  };

  return (
    <div 
      className="menu-item-container" 
      ref={menuRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button 
        className="menu-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {menu.title}
        <span className="menu-arrow">▾</span>
      </button>
      
      {isOpen && (
        <div 
          className={`dropdown-menu ${isLast ? 'dropdown-right' : ''}`}
          style={{
            position: 'absolute',
            top: '100%',
            left: isLast ? 'auto' : '0',
            right: isLast ? '0' : 'auto'
          }}
        >
          {menu.items.map((item, index) => (
            <React.Fragment key={index}>
              <button
                className="dropdown-item"
                onClick={() => {
                  onItemSelect(item);
                  setIsOpen(false);
                }}
              >
                <span className="dropdown-text">{item}</span>
                {getShortcut(item) && (
                  <span className="dropdown-shortcut">{getShortcut(item)}</span>
                )}
              </button>
              {index < menu.items.length - 1 && (
                <div className="dropdown-divider" />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};