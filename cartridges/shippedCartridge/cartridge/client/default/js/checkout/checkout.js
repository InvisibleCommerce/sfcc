'use strict';

var baseCheckout = require('base/checkout/checkout');
var customerHelpers = require('base/checkout/customer');
var shippingHelpers = require('base/checkout/shipping');
var billingHelpers = require('base/checkout/billing');
// SHIPPED EXTENSION START
var summaryHelpers = require('./summary');
// SHIPPED EXTENSION END

baseCheckout.updateCheckoutView = function () {
  $('body').on('checkout:updateCheckoutView', function (e, data) {
    if (data.csrfToken) {
      $("input[name*='csrf_token']").val(data.csrfToken);
    }
    customerHelpers.methods.updateCustomerInformation(data.customer, data.order);
    shippingHelpers.methods.updateMultiShipInformation(data.order);
    summaryHelpers.updateTotals(data.order.totals);
    data.order.shipping.forEach(function (shipping) {
      shippingHelpers.methods.updateShippingInformation(
        shipping,
        data.order,
        data.customer,
        data.options
      );
    });
    billingHelpers.methods.updateBillingInformation(
      data.order,
      data.customer,
      data.options
    );
    billingHelpers.methods.updatePaymentInformation(data.order, data.options);
    summaryHelpers.updateOrderProductSummaryInformation(data.order, data.options);
  });
};

module.exports = baseCheckout;
