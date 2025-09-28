import React from 'react';
import './TireTable.scss';

const TireTable = ({ tires, onTireClick }) => {
  if (!tires || tires.length === 0) {
    return (
      <div className="tire-table empty">
        <p>Нет данных для отображения</p>
      </div>
    );
  }

  return (
    <div className="tire-table">
      <h2>📊 Каталог шин ({tires.length} позиций)</h2>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Артикул</th>
              <th>Бренд</th>
              <th>Название</th>
              <th>Размер</th>
              <th>Сезон</th>
              <th>Тип</th>
              <th>Цена (руб)</th>
              <th>Остаток</th>
            </tr>
          </thead>
          <tbody>
            {tires.map((tire) => (
              <tr 
                key={tire.id} 
                onClick={() => onTireClick && onTireClick(tire)}
                className={tire.stock === 0 ? 'out-of-stock' : ''}
              >
                <td className="article">{tire.article || '-'}</td>
                <td className="brand">{tire.brand}</td>
                <td className="name">{tire.name}</td>
                <td className="size">
                  {tire.size ? `${tire.size.width}/${tire.size.height} R${tire.size.diameter}` : '-'}
                </td>
                <td className="season">
                  <span className={`season-badge ${tire.season || 'unknown'}`}>
                    {tire.season === 'winter' ? '❄️ Зима' : 
                     tire.season === 'summer' ? '☀️ Лето' : '❓'}
                  </span>
                </td>
                <td className="type">
                  {tire.type === 'studded' ? '⭐ Шипованная' :
                   tire.type === 'friction' ? '🔰 Фрикционная' : '-'}
                </td>
                <td className="price">{tire.price.toLocaleString('ru-RU')}</td>
                <td className={`stock ${tire.stock === 0 ? 'zero' : tire.stock < 5 ? 'low' : 'normal'}`}>
                  {tire.stock > 0 ? tire.stock : 'Нет'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TireTable;