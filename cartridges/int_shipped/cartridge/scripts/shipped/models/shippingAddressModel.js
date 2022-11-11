'use strict';

/**
 * Builds shipping address payload for Shipped Suite API
 * @param {dw.order.OrderAddress} shippingAddress - Shipping address
 * @returns {Object} object containing shipping address payload in Shipped Suite API format
 */

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
