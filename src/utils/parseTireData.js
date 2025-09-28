export const parseTireData = (excelData) => {
  const tires = [];
  let currentCategory = '';
  let currentSeason = '';

  if (!excelData || !Array.isArray(excelData)) {
    return tires;
  }

  excelData.forEach((row, index) => {
    // Пропускаем пустые строки и заголовки
    if (!row || row.length < 3) return;

    // Определяем категории по тексту в ячейках
    const firstCell = String(row[0] || '').toLowerCase();
    const secondCell = String(row[1] || '').toLowerCase();

    // Обновляем текущую категорию
    if (firstCell.includes('легковые') || secondCell.includes('легковые')) {
      currentCategory = 'passenger';
    }

    // Обновляем текущий сезон
    if (firstCell.includes('зимние') || secondCell.includes('зимние')) {
      currentSeason = 'winter';
    } else if (firstCell.includes('летние') || secondCell.includes('летние')) {
      currentSeason = 'summer';
    }

    // Парсим данные о шине (примерная логика - нужно адаптировать под ваш формат)
    const tireData = parseTireRow(row, currentCategory, currentSeason);
    if (tireData) {
      tires.push({
        id: `tire-${index}-${Date.now()}`,
        ...tireData
      });
    }
  });

  return tires;
};

const parseTireRow = (row, category, season) => {
  try {
    // Пример парсинга строки - нужно адаптировать под ваш формат данных
    const name = String(row[1] || '').trim();
    const price = parseFloat(String(row[5] || '0').replace(',', '.')) || 0;
    const stock = parseFloat(String(row[6] || '0').replace(',', '.')) || 0;

    // Пропускаем строки без названия или цены
    if (!name || price === 0) return null;

    // Определяем тип зимней резины
    let type = null;
    if (season === 'winter') {
      const lowerName = name.toLowerCase();
      if (lowerName.includes('шип') || lowerName.includes('stud')) {
        type = 'studded';
      } else if (lowerName.includes('фрикцион') || lowerName.includes('friction')) {
        type = 'friction';
      }
    }

    // Парсим размер из названия (пример: "185/65/15")
    const sizeMatch = name.match(/(\d+)\/(\d+)\/(\d+)/);
    const size = sizeMatch ? {
      width: parseInt(sizeMatch[1]),
      height: parseInt(sizeMatch[2]),
      diameter: parseInt(sizeMatch[3])
    } : null;

    // Извлекаем бренд из названия
    const brand = extractBrand(name);

    return {
      article: String(row[0] || '').trim(),
      name,
      brand,
      size,
      price,
      stock,
      season,
      type,
      category
    };
  } catch (error) {
    console.warn('Ошибка парсинга строки:', row, error);
    return null;
  }
};

const extractBrand = (name) => {
  const brands = [
    'continental', 'formula', 'accelera', 'kama', 'michelin', 
    'bridgestone', 'pirelli', 'goodyear', 'yokohama', 'toyo'
  ];
  
  const lowerName = name.toLowerCase();
  const foundBrand = brands.find(brand => lowerName.includes(brand));
  return foundBrand ? foundBrand.charAt(0).toUpperCase() + foundBrand.slice(1) : 'Other';
};