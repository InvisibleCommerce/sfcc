'use strict';

var logger = require('dw/system/Logger').getLogger('Shipped', 'Shipped');

function buildShippingAddressPayload(shippingAddress) {
  var shippingAddressObj = {};

  shippingAddressObj.first_name = shippingAddress.getFirstName();
  shippingAddressObj.last_name = shippingAddress.getLastName();
  shippingAddressObj.company = shippingAddress.getCompanyName();
  shippingAddressObj.address1 = shippingAddress.getAddress1();
  shippingAddressObj.address2 = shippingAddress.getAddress2();
  shippingAddressObj.city = shippingAddress.getCity();
  shippingAddressObj.state = shippingAddress.getStateCode();
  shippingAddressObj.zip = shippingAddress.getPostalCode();
  shippingAddressObj.country = shippingAddress.getCountryCode().getValue();
  shippingAddressObj.phone = shippingAddress.getPhone();

  return shippingAddressObj;
}

module.exports = {
  buildShippingAddressPayload: buildShippingAddressPayload
};
