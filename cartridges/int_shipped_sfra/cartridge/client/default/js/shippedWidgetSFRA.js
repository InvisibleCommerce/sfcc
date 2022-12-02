'use strict';

var shippedWidgetHelpers = require('../../../../../int_shipped/cartridge/client/js/shippedWidgetHelpers');

document.addEventListener('DOMContentLoaded', function () {
  function shouldRefreshUI(existingDetails, details) {
    if (existingDetails === undefined) return true;
    if (existingDetails.isSelected == details.isSelected && details.isSelected === false) return false;
    if (existingDetails.totalFee === details.totalFee && existingDetails.isSelected == details.isSelected) return false;

    return true;
  }

  function refreshUI(data) {
    // for checkout page
    $('body').trigger(
      'checkout:updateCheckoutView', { order: data.order, customer: data.customer }
    );
    // for cart page
    $('.quantity-form > .quantity').first().change();
  }

  const shippedWidget = shippedWidgetHelpers.initializeWidget(shouldRefreshUI, refreshUI);

  var widget = document.getElementsByClassName('shipped-widget')[0];
  var existingSubtotal = widget.dataset.subtotal;

  // update order value when cart items change
  // only applicable on cart page
  $('body').on('cart:update promotion:success', function(e, data) {
    var totals;
    if (data.basket === undefined) {
      totals = data.totals;
    } else {
      totals = data.basket.totals;
    }
    if (totals === undefined) return;

    if (existingSubtotal !== totals.subTotal) {
      shippedWidget.updateOrderValue(shippedWidgetHelpers.subtotalValue(totals.subTotal), widget.dataset.currency);
    }

    existingSubtotal = totals.subTotal;
  });
});
