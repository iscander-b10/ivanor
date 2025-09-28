import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import './FileUploader.scss';

const FileUploader = ({ onDataLoaded }) => {
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Берем первый лист
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Конвертируем в JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Передаем данные в родительский компонент
        onDataLoaded(jsonData);
        
      } catch (error) {
        console.error('Ошибка чтения файла:', error);
        alert('Ошибка при чтении файла. Проверьте формат.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-uploader">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xls,.xlsx,.csv"
        style={{ display: 'none' }}
      />
      <button onClick={handleClick} className="upload-button">
        📁 Загрузить Excel файл с шинами
      </button>
      <p className="upload-hint">
        Поддерживаются форматы: .xls, .xlsx, .csv
      </p>
    </div>
  );
};

export default FileUploader;