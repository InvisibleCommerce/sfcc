'use strict';

function getFirstName(order, profile) {
  if (!empty(profile)) return profile.getFirstName();

  return order.getCustomerName().split(' ')[0];
}

function getLastName(order, profile) {
  if (!empty(profile)) return profile.getLastName();
  var names = order.getCustomerName().split(' ');

  return names[names.length - 1];
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

function buildCustomerPayload(order, orderCustomer) {
  var customerObj = {};
  var profile = orderCustomer.getProfile();

  customerObj.external_id = orderCustomer.getID();
  customerObj.first_name = getFirstName(order, profile);
  customerObj.last_name = getLastName(order, profile);
  customerObj.email = empty(profile) ? order.getCustomerEmail() : profile.getEmail();
  customerObj.phone = getCustomerPhone(profile);
  customerObj.notes = orderCustomer.getNote();
  customerObj.accepts_email_marketing = false;
  customerObj.accepts_sms_marketing = false;

  return customerObj;
}

module.exports = {
  buildCustomerPayload: buildCustomerPayload
};
