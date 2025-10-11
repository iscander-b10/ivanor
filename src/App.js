import React from 'react';
import { Input, Button, Row, Col, Form, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { XMLParser } from 'fast-xml-parser';

const { Option } = Select;

function App() {
  const [form] = Form.useForm();

  const createSoapEnvelope = (values) => {
    const { width, height, diameter, season } = values;
    
    return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope 
    xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
    xmlns:wcf="Wcf.ClientService.Client.WebAPI.TS3" 
    xmlns:ts3="http://schemas.datacontract.org/2004/07/TS3.Domain.Models.Client.ClientSoapService.SearchTires" 
    xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">
   <soapenv:Header/>
   <soapenv:Body>
      <wcf:GetFindTyre>
         <wcf:login>sa38896</wcf:login>
         <wcf:password>9))eSU@rzA</wcf:password>
         <wcf:filter>
            <ts3:diameter_max>${diameter}</ts3:diameter_max>
            <ts3:diameter_min>${diameter}</ts3:diameter_min>
            <ts3:height_max>${height}</ts3:height_max>
            <ts3:height_min>${height}</ts3:height_min>
            <ts3:season_list>
               <arr:string>${season}</arr:string>
            </ts3:season_list>
            <ts3:width_max>${width}</ts3:width_max>
            <ts3:width_min>${width}</ts3:width_min>
            <ts3:wrh_list>
               <arr:int>2057</arr:int>
            </ts3:wrh_list>
         </wcf:filter>
      </wcf:GetFindTyre>
   </soapenv:Body>
</soapenv:Envelope>`;
  };

  const handleSearch = async (values) => {
    try {
      const soapRequest = createSoapEnvelope(values);
      console.log('SOAP запрос:', soapRequest);

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
      console.log('RAW XML ответ:', responseText);

      // Простой парсер XML
      const parser = new XMLParser({
        ignoreAttributes: false,
        parseTagValue: true,
        parseAttributeValue: true,
        trimValues: true
      });

      const jsonResult = parser.parse(responseText);
      console.log('JSON результат:', jsonResult);

    } catch (err) {
      console.error('Ошибка:', err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Тестирование SOAP запроса</h1>
      
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
                <Option value="W">Зимняя</Option>
                <Option value="S">Летняя</Option>
                <Option value="A">Всесезонная</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Button 
          type="primary" 
          htmlType="submit" 
          icon={<SearchOutlined />}
          size="large"
        >
          Тестировать запрос
        </Button>
      </Form>
    </div>
  );
}

export default App;