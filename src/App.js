import React, { useState } from 'react';
import { Input, Button, Row, Col, Form, Select, Alert } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
// import { executeTireSearch } from './services/supplier4tochki'; // заглушка
import { getTiresStock } from './services/shipnService';

const { Option } = Select;

function App() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [shipnServiceLoading, setShipnServiceLoading] = useState(false);
  const [error, setError] = useState(null);

  // Заглушка для первого поставщика - НЕ МЕНЯЕМ
  const handleSearch = async (values) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Заглушка 4tochki:', values);
      alert('Запрос к 4tochki (заглушка)');
    } catch (err) {
      console.error('Ошибка:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Простой запрос к Шинсервис
  const handleShipnServiceStock = async () => {
    setShipnServiceLoading(true);
    setError(null);

    try {
      await getTiresStock();
    } catch (err) {
      console.error('Ошибка:', err);
      setError(err.message);
    } finally {
      setShipnServiceLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Тестирование API поставщиков</h1>
      
      <Form
        form={form}
        onFinish={handleSearch}
        initialValues={{
          width: 185,
          height: 65,
          diameter: 15,
          season: 'w'
        }}
        layout="vertical"
      >
        <Row gutter={16}>
          <Col xs={24} sm={6}>
            <Form.Item label="Ширина" name="width" rules={[{ required: true }]}>
              <Input type="number" placeholder="185" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item label="Профиль" name="height" rules={[{ required: true }]}>
              <Input type="number" placeholder="65" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item label="Диаметр" name="diameter" rules={[{ required: true }]}>
              <Input type="number" placeholder="15" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Form.Item label="Сезон" name="season" rules={[{ required: true }]}>
              <Select>
                <Option value="w">Зимняя</Option>
                <Option value="s">Летняя</Option>
                <Option value="a">Всесезонная</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Button 
          type="primary" 
          htmlType="submit" 
          icon={<SearchOutlined />}
          size="large"
          loading={loading}
          style={{ marginRight: 10 }}
        >
          Тестировать запрос (4tochki)
        </Button>

        <Button 
          type="default" 
          icon={<SearchOutlined />}
          size="large"
          loading={shipnServiceLoading}
          onClick={handleShipnServiceStock}
        >
          Остатки шин (Шинсервис)
        </Button>
      </Form>

      {error && (
        <Alert
          message="Ошибка"
          description={error}
          type="error"
          showIcon
          style={{ marginTop: 20 }}
        />
      )}
    </div>
  );
}

export default App;