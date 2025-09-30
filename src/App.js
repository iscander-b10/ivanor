import React, { useState } from 'react';
import { 
  Input, 
  Button, 
  Row, 
  Col, 
  Card, 
  Form, 
  Spin, 
  Alert, 
  Typography,
  Space,
  message,
  Image,
  Select
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

function App() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Функция для создания правильного SOAP запроса
  const createSoapEnvelope = (values) => {
    const { width, height, diameter, season } = values;
    
    // Правильный SOAP запрос согласно WSDL
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" 
               xmlns:tns="http://tempuri.org/" 
               xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">
  <soap:Header/>
  <soap:Body>
    <tns:GetFindTyre>
      <tns:login>sa38896</tns:login>
      <tns:password>9))eSU@rzA</tns:password>
      <tns:filter>
        <tns:width_min>${width}</tns:width_min>
        <tns:width_max>${width}</tns:width_max>
        <tns:height_min>${height}</tns:height_min>
        <tns:height_max>${height}</tns:height_max>
        <tns:diameter_min>${diameter}</tns:diameter_min>
        <tns:diameter_max>${diameter}</tns:diameter_max>
        <tns:season_list>
          <arr:Season>${season}</arr:Season>
        </tns:season_list>
      </tns:filter>
      <tns:page>0</tns:page>
      <tns:pageSize>50</tns:pageSize>
    </tns:GetFindTyre>
  </soap:Body>
</soap:Envelope>`;
  };

  // Функция для извлечения данных из SOAP ответа
  const parseSoapResponse = (xmlText) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      // Проверяем на наличие SOAP ошибок
      const fault = xmlDoc.getElementsByTagName("s:Fault")[0] || 
                   xmlDoc.getElementsByTagName("Fault")[0] ||
                   xmlDoc.getElementsByTagName("soap:Fault")[0];
      
      if (fault) {
        const faultString = fault.getElementsByTagName("faultstring")[0]?.textContent || 
                           fault.getElementsByTagName("faultString")[0]?.textContent ||
                           "Unknown SOAP fault";
        throw new Error(`SOAP Error: ${faultString}`);
      }

      // Ищем результат
      const resultElements = xmlDoc.getElementsByTagName("GetFindTyreResult");
      if (resultElements.length > 0) {
        const resultText = resultElements[0].textContent;
        
        if (resultText.trim()) {
          try {
            return JSON.parse(resultText);
          } catch (jsonError) {
            console.log("Ответ не в JSON формате, пробуем парсить XML структуру");
            return extractDataFromXml(xmlDoc);
          }
        } else {
          return { price_rest_list: [] };
        }
      }
      
      throw new Error("Не удалось найти данные в ответе");
    } catch (error) {
      console.error("Ошибка парсинга SOAP ответа:", error);
      throw error;
    }
  };

  // Функция для извлечения данных из XML структуры
  const extractDataFromXml = (xmlDoc) => {
    const result = {
      price_rest_list: []
    };

    // Ищем элементы TypePriceRest
    const typePriceRestElements = xmlDoc.getElementsByTagName("TypePriceRest");
    
    for (let i = 0; i < typePriceRestElements.length; i++) {
      const element = typePriceRestElements[i];
      const tyre = {};
      
      // Извлекаем все поля из структуры TypePriceRest
      const fields = [
        'code', 'img_big_my', 'img_big_pish', 'img_small', 
        'marks', 'model', 'name', 'season', 'thorn', 'type', 'whpr'
      ];
      
      fields.forEach(field => {
        const fieldElement = element.getElementsByTagName(field)[0];
        if (fieldElement) {
          tyre[field] = fieldElement.textContent;
        }
      });
      
      result.price_rest_list.push(tyre);
    }

    return result;
  };

  const handleSearch = async (values) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log('Начинаем поиск с параметрами:', values);
      
      const soapRequest = createSoapEnvelope(values);
      console.log('SOAP запрос:', soapRequest);

      // Прямой запрос к API через proxy
      const response = await fetch('/WCF/ClientService.svc', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://tempuri.org/IClientService/GetFindTyre'
        },
        body: soapRequest
      });

      console.log('Статус ответа:', response.status);
      console.log('Заголовки ответа:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('Полный ответ сервера:', responseText);

      const resultData = parseSoapResponse(responseText);
      console.log('Распарсенные данные:', resultData);

      if (resultData && Array.isArray(resultData.price_rest_list)) {
        setResults(resultData);
        message.success(`Найдено товаров: ${resultData.price_rest_list.length}`);
      } else {
        throw new Error('Не удалось получить данные о товарах');
      }

    } catch (err) {
      console.error('Ошибка поиска:', err);
      setError(`Ошибка при поиске: ${err.message}`);
      message.error('Ошибка при поиске товаров');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Title level={1} style={{ textAlign: 'center', marginBottom: '30px' }}>
          Поиск шин
        </Title>
        
        <Card>
          <Form
            form={form}
            onFinish={handleSearch}
            layout="vertical"
            initialValues={{
              width: 185,
              height: 65,
              diameter: 15,
              season: 'W' // По умолчанию зимняя
            }}
          >
            <Row gutter={16} justify="center">
              <Col xs={24} sm={8} md={6}>
                <Form.Item
                  label="Ширина"
                  name="width"
                  rules={[{ required: true, message: 'Введите ширину' }]}
                >
                  <Input placeholder="185" type="number" min={100} max={400} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Form.Item
                  label="Высота"
                  name="height"
                  rules={[{ required: true, message: 'Введите высоту' }]}
                >
                  <Input placeholder="65" type="number" min={30} max={100} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Form.Item
                  label="Диаметр"
                  name="diameter"
                  rules={[{ required: true, message: 'Введите диаметр' }]}
                >
                  <Input placeholder="15" type="number" min={10} max={25} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Form.Item
                  label="Сезон"
                  name="season"
                  rules={[{ required: true, message: 'Выберите сезон' }]}
                >
                  <Select placeholder="Выберите сезон">
                    <Option value="W">Зимняя</Option>
                    <Option value="S">Летняя</Option>
                    <Option value="A">Всесезонная</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item style={{ textAlign: 'center', marginTop: '20px' }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SearchOutlined />}
                size="large"
                loading={loading}
                style={{ minWidth: '200px' }}
              >
                Найти шины
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {loading && (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: '10px' }}>Идёт поиск...</div>
          </div>
        )}

        {error && (
          <Alert
            message="Ошибка"
            description={
              <div>
                <div>{error}</div>
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                  Проверьте:
                  <ul>
                    <li>Настройки proxy в package.json</li>
                    <li>Доступность API сервиса</li>
                    <li>Правильность логина и пароля</li>
                    <li>Консоль браузера для подробных логов</li>
                  </ul>
                </div>
              </div>
            }
            type="error"
            showIcon
            style={{ margin: '20px 0' }}
          />
        )}

        {results && (
          <Card 
            title={
              <div>
                Результаты поиска 
                <span style={{ fontSize: '14px', fontWeight: 'normal', marginLeft: '10px' }}>
                  (Найдено: {results.price_rest_list.length})
                </span>
              </div>
            } 
            style={{ marginTop: '20px' }}
          >
            {results.price_rest_list.length > 0 ? (
              <Row gutter={[16, 16]}>
                {results.price_rest_list.map((tyre, index) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={index}>
                    <Card 
                      size="small" 
                      style={{ height: '100%' }}
                      cover={
                        tyre.img_small ? (
                          <div style={{ padding: '10px', textAlign: 'center' }}>
                            <Image
                              alt={tyre.name}
                              src={tyre.img_small}
                              preview={false}
                              style={{ 
                                height: '120px', 
                                width: 'auto',
                                maxWidth: '100%',
                                objectFit: 'contain' 
                              }}
                            />
                          </div>
                        ) : null
                      }
                    >
                      <Card.Meta
                        title={tyre.name || 'Шина'}
                        description={
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <div><strong>Бренд:</strong> {tyre.marks || 'Не указан'}</div>
                            <div><strong>Модель:</strong> {tyre.model || 'Не указана'}</div>
                            <div><strong>Код:</strong> {tyre.code || 'Не указан'}</div>
                            <div><strong>Сезон:</strong> {tyre.season === 'W' ? 'Зимняя' : tyre.season === 'S' ? 'Летняя' : tyre.season || 'Не указан'}</div>
                            <div><strong>Тип:</strong> {tyre.type || 'Не указан'}</div>
                            {tyre.thorn && <div><strong>Шипы:</strong> {tyre.thorn === '1' ? 'Да' : 'Нет'}</div>}
                            {tyre.whpr && <div><strong>Цена/Остаток:</strong> {tyre.whpr}</div>}
                          </Space>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Alert message="Товары по заданным параметрам не найдены" type="info" showIcon />
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

export default App;