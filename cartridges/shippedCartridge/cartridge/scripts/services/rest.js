'use strict';

var Site = require('dw/system/Site').getCurrent();
var logger = require('dw/system/Logger').getLogger('ShippedAPI', 'Shipped');
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

function createRequestConfiguration(action) {
  var configObj = {};
  // default config
  configObj.api_version = 'v1';
  configObj.method = 'POST';

  switch (action) {
    case 'upsertProduct':
      configObj.endpoint = 'products';
      // configObj.mock = mocks.productsResponseMock;
      break;

    case 'upsertOrder':
      configObj.endpoint = 'orders';
      // configObj.mock = mocks.ordersResponseMock;
      break;

    default:
      break;
  }

  return configObj;
}

function createServiceCall(configObj) {
  return LocalServiceRegistry.createService('bm_shipped.http.auth', {
    createRequest: function(service, requestData) {
      var credential = service.configuration.credential;
      var path = '/' + configObj.api_version + '/' + configObj.endpoint;

      service.addHeader('Accept', 'application/json');
      service.addHeader('Content-Type', 'application/json');
      service.addHeader('Authorization', 'Bearer ' + credential.getPassword());

      service.setRequestMethod(configObj.method);
      service.setURL(credential.URL + path);

      logger.debug('Endpoint: {1} Request: {0}', requestData, path);

      return requestData;
    },
    parseResponse: function(service, client) {
      return client.text;
    },
    mockCall: function(service, client) {
      return {
        statusCode: 200,
        statusMessage: "Success",
        text: "MOCK RESPONSE (" + svc.URL + ")"
      };
    }
  });
}

function makeServiceRequest(action, body) {
  var configObj = createRequestConfiguration(action);
  var serviceRequest = createServiceCall(configObj);
  var serviceResponse = serviceRequest.call(JSON.stringify(body));

  if (!serviceResponse.ok) {
    logger.error(
      'Request failed! Error: {0}; Code: {1}; REQUEST: {2}',
      serviceResponse.errorMessage,
      serviceResponse.error,
      serviceRequest.URL
    );
    return {
      error: true,
      errorMessage: serviceResponse.errorMessage || 'No results found.',
      errorCode: serviceResponse.error
    };
  }

  return serviceResponse.object;
}

module.exports = {
  makeServiceRequest: makeServiceRequest
};
