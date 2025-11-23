export const Header = () => {
  return (
    <div id="header">
      <div className="header-container">
        <h1>New project</h1>
        <nav className="menu-bar">
          <div className="menu-item">
            <span>Файл</span>
            <div className="dropdown-content">
              <div className="dropdown-item">Новый</div>
              <div className="dropdown-item">Открыть</div>
              <div className="dropdown-item">Сохранить</div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item">Выход</div>
            </div>
          </div>
          <div className="menu-item">
            <span>Вид</span>
            <div className="dropdown-content">
              <div className="dropdown-item">Панель инструментов</div>
              <div className="dropdown-item">Статус бар</div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item">Увеличить</div>
              <div className="dropdown-item">Уменьшить</div>
              <div className="dropdown-item">Сбросить масштаб</div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};