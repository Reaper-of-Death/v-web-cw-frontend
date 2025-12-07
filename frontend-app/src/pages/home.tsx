import { type FC } from 'react';
import { Header } from '../widgets/index.js';
import "../widgets/index.js";

export const HomePage: FC = () => {
  return (
    <div className="home-page">
      <Header />
      
      <main className="main-area">
        {/* 1) Список логических блоков */}
        <section className="logic-blocks-panel">
          <h2 className="panel-title">Логические блоки</h2>
          <div className="blocks-list">
            <div className="empty-state">
              <p>Список блоков пуст</p>
              <p>Добавьте логические блоки для начала работы</p>
            </div>
          </div>
        </section>

        {/* 2) Рабочая область с сеткой */}
        <section className="workspace-area">
          <h2 className="panel-title">Рабочая область</h2>
          <div className="workspace-content">           
            {/* Состояние пустой рабочей области (скрыто при наличии сетки) */}
            <div className="workspace-empty-state" style={{ display: 'none' }}>
              <p>Перетащите логические блоки сюда</p>
              <p>или выберите блок из списка слева</p>
            </div>
          </div>
        </section>

        {/* 3) Свойства выбранного блока */}
        <section className="properties-panel">
          <h2 className="panel-title">Свойства блока</h2>
          <div className="properties-content">
            <div className="properties-empty-state">
              <p>Выберите логический блок</p>
              <p>для просмотра и редактирования свойств</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};