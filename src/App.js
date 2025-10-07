import React, { useState } from 'react';
import { Input, Button, Row, Col, Card, Form, Spin, Alert, Typography, Space, message, Image, Select, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { XMLParser } from 'fast-xml-parser';

const { Title } = Typography;
const { Option } = Select;

function App() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Функция для создания SOAP запроса
  const createSoapEnvelope = (values) => {
    const { width, height, diameter, season } = values;
    
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" 
               xmlns:tns="Wcf.ClientService.Client.WebAPI.TS3"
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

  const handleSearch = async (values) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log('Поиск с параметрами:', values);
      
      const soapRequest = createSoapEnvelope(values);

      const response = await fetch('/WCF/ClientService.svc', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'Wcf.ClientService.Client.WebAPI.TS3/ClientService/GetFindTyre'
        },
        body: soapRequest
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('Полный XML ответ сервера:', responseText);

      // Создаем парсер XML с настройками
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        allowBooleanAttributes: true,
        parseAttributeValue: true,
        trimValues: true,
        ignoreDeclaration: true,
        ignorePiTags: true,
        removeNSPrefix: true // Убираем namespace префиксы для удобства
      });

      // Парсим XML в JSON
      const jsonObj = parser.parse(responseText);
      console.log('Преобразованный JSON:', jsonObj);

      // Извлекаем данные о шинах из JSON структуры
      let tyres = [];
      
      // Получаем доступ к данным через правильный путь
      const priceRestList = jsonObj?.Envelope?.Body?.GetFindTyreResponse?.GetFindTyreResult?.PriceRestList;
      
      if (priceRestList && priceRestList.TypePriceRest) {
        // Если это массив объектов
        if (Array.isArray(priceRestList.TypePriceRest)) {
          tyres = priceRestList.TypePriceRest;
        } else {
          // Если это один объект
          tyres = [priceRestList.TypePriceRest];
        }
      }

      console.log('Извлеченные шины из JSON:', tyres);

      // ФИЛЬТРАЦИЯ: оставляем только шины нужного размера
      const { width, height, diameter } = values;
      
      const filteredTyres = tyres.filter(tyre => {
        if (!tyre.name) return false;
        
        // Создаем регулярное выражение для точного поиска размера
        // Ищем формат: 185/65R15, 185/65 R15 и т.д.
        const sizePattern = new RegExp(
          `\\b${width}\\/${height}\\s?R?${diameter}\\b`,
          'i'
        );
        
        return sizePattern.test(tyre.name);
      });

      console.log('После фильтрации по размеру:', filteredTyres.length);
      console.log('Отфильтрованные шины:', filteredTyres);

      if (filteredTyres.length > 0) {
        setResults({ price_rest_list: filteredTyres });
        message.success(`Найдено товаров: ${filteredTyres.length}`);
      } else {
        setResults({ price_rest_list: [] });
        message.info('Товары по заданным параметрам не найдены');
      }

    } catch (err) {
      console.error('Ошибка:', err);
      setError(`Ошибка: ${err.message}`);
      message.error('Ошибка при поиске');
    } finally {
      setLoading(false);
    }
  };

  // Колонки для таблицы
  const columns = [
    {
      title: 'Изображение',
      dataIndex: 'img_small',
      key: 'img_small',
      width: 100,
      render: (img) => img ? (
        <Image
          width={60}
          src={img}
          alt="Шина"
          preview={false}
          style={{ objectFit: 'contain' }}
        />
      ) : 'Нет изображения'
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Бренд',
      dataIndex: 'marka',
      key: 'marka'
    },
    {
      title: 'Модель',
      dataIndex: 'model',
      key: 'model'
    },
    {
      title: 'Код',
      dataIndex: 'code',
      key: 'code',
      width: 120
    },
    {
      title: 'Сезон',
      dataIndex: 'season',
      key: 'season',
      width: 100,
      render: (season) => {
        const seasonMap = {
          'S': 'Летняя',
          'W': 'Зимняя', 
          'A': 'Всесезонная',
          '5': 'Всесезонная'
        };
        return seasonMap[season] || season;
      }
    },
    {
      title: 'Шипы',
      dataIndex: 'thorn',
      key: 'thorn',
      width: 80,
      render: (thorn) => thorn ? 'Да' : 'Нет'
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => {
        const typeMap = {
          'car': 'Легковая',
          'vmed': 'Внедорожник'
        };
        return typeMap[type] || type;
      }
    }
  ];

  return (
    <div className="App">
      <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
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
              season: 'W'
            }}
          >
            <Row gutter={16} justify="center">
              <Col xs={24} sm={8} md={6}>
                <Form.Item label="Ширина" name="width" rules={[{ required: true }]}>
                  <Input placeholder="185" type="number" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Form.Item label="Высота" name="height" rules={[{ required: true }]}>
                  <Input placeholder="65" type="number" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Form.Item label="Диаметр" name="diameter" rules={[{ required: true }]}>
                  <Input placeholder="15" type="number" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Form.Item label="Сезон" name="season" rules={[{ required: true }]}>
                  <Select>
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
            <div>Идёт поиск...</div>
          </div>
        )}

        {error && (
          <Alert
            message="Ошибка"
            description={error}
            type="error"
            showIcon
            style={{ margin: '20px 0' }}
          />
        )}

        {results && (
          <Card 
            title={`Результаты поиска (Найдено: ${results.price_rest_list.length})`}
            style={{ marginTop: '20px' }}
          >
            {results.price_rest_list.length > 0 ? (
              <Table 
                dataSource={results.price_rest_list}
                columns={columns}
                rowKey={(record, index) => record.code || index}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `Показано ${range[0]}-${range[1]} из ${total} записей`
                }}
                scroll={{ x: 800 }}
              />
            ) : (
              <Alert message="Товары не найдены" type="info" showIcon />
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

export default App;