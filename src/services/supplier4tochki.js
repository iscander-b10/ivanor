import { XMLParser } from 'fast-xml-parser';

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

const parseResponse = (responseText) => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: true,
    parseAttributeValue: true,
    trimValues: true
  });

  const jsonResult = parser.parse(responseText);
  console.log('JSON результат:', jsonResult);
  
  return jsonResult;
};

export const executeTireSearch = async (values) => {
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

    return parseResponse(responseText);
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error);
    throw error;
  }
};