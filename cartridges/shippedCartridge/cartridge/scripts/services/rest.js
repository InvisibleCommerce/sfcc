'use strict';

var Site = require('dw/system/Site').getCurrent();
var logger = require('dw/system/Logger').getLogger('ShippedAPI', 'Shipped');
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

function upsertProduct(product) {
  var serviceRequest = LocalServiceRegistry.createService('bm_shipped.http.auth', {
    createRequest: function(service, requestData) {
      var credential = service.configuration.credential;

      service.addHeader('Accept', 'application/json');
      service.addHeader('Content-Type', 'application/json');
      service.addHeader('Authorization', "Bearer " + credential.getPassword());

      service.setRequestMethod("POST");
      service.setURL(credential.URL + "v1/products");

      logger.debug('Endpoint: {1} Request: {0}', requestData, "v1/products");

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

  var serviceResponse = serviceRequest.call(JSON.stringify(product));

  if (!serviceResponse.ok) {
    var serviceURL = LocalServiceRegistry.createService('bm_shipped.http.auth', {}).getURL();
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
};

module.exports = {
  upsertProduct: upsertProduct
};
