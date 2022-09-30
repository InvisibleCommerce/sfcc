'use strict';

var logger = require('dw/system/Logger').getLogger('Shipped', 'Shipped');
var webService = require('~/cartridge/scripts/services/rest');

function buildCustomerPayload(order, customer) {
  var customerObj = {};
  var profile = customer.getProfile();

  customerObj.external_id = customer.getID();
  customerObj.first_name = getFirstName(order, profile);
  customerObj.last_name = getLastName(order, profile);
  customerObj.email = empty(profile) ? order.getCustomerEmail() : profile.getEmail();
  customerObj.phone = getCustomerPhone(profile);
  customerObj.notes = customer.getNote();
  customerObj.accepts_email_marketing = false;
  customerObj.accepts_sms_marketing = false;

  return customerObj;
}

function getFirstName(order, profile) {
  if (!empty(profile)) return profile.getFirstName();

  return order.getCustomerName().split('')[0];
}

function getLastName(order, profile) {
  if (!empty(profile)) return profile.getLastName();

  return order.getCustomerName().split('')[1];
}

function getCustomerPhone(profile) {
  if (empty(profile)) {
    return null;
  }

  if (empty(profile.getPhoneMobile())) {
    if (empty(profile.getPhoneHome())) {
      return profile.getPhoneBusiness();
    } else {
      return profile.getPhoneHome();
    }
  } else {
    return profile.getPhoneMobile();
  }
}

module.exports = {
  buildCustomerPayload: buildCustomerPayload
};
