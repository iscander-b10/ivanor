import React, { useState } from 'react';
import FileUploader from './components/FileUploader/FileUploader';
import TireTable from './components/TireTable/TireTable';
import { parseTireData } from './utils/parseTireData';
import './App.scss';

function App() {
  const [excelData, setExcelData] = useState(null);
  const [tires, setTires] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleDataLoaded = (data) => {
    console.log('Данные из Excel:', data);
    setExcelData(data);
    
    // Парсим данные
    const parsedTires = parseTireData(data);
    console.log('Распарсенные шины:', parsedTires);
    setTires(parsedTires);
    
    setIsLoading(false);
  };

  const handleFileUploadStart = () => {
    setIsLoading(true);
    setTires([]); // Очищаем предыдущие данные
  };

  const handleTireClick = (tire) => {
    console.log('Выбрана шина:', tire);
    // Здесь можно добавить модальное окно с деталями
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>{'🏁 Магазин шин и дисков'}</h1>
        <p>{'Загрузите файл с остатками для просмотра каталога'}</p>
      </header>

      <main>
        <FileUploader 
          onDataLoaded={handleDataLoaded}
          onUploadStart={handleFileUploadStart}
          isLoading={isLoading}
        />
        
        {tires.length > 0 ? (
          <TireTable tires={tires} onTireClick={handleTireClick} />
        ) : (
          excelData && (
            <div className="data-preview">
              <h2>Предпросмотр данных (первые 5 строк):</h2>
              <pre>{JSON.stringify(excelData.slice(0, 5), null, 2)}</pre>
              <p className="preview-note">
                ⚠️ Данные в сыром виде. Парсер пока не нашел структурированных записей о шинах.
              </p>
            </div>
          )
        )}
      </main>
    </div>
  );
}

export default App;