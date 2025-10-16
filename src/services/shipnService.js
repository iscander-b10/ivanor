export const getTiresStock = async () => {
  try {
    const token = process.env.REACT_APP_SHIPNSERVICE_TOKEN;
    const url = '/api/shinservice/regular/stock/tires.json';
    
    console.log('URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Статус ответа:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Данные:', data);
    
    return data;

  } catch (error) {
    console.error('Ошибка:', error);
    throw error;
  }
};