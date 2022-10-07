'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const shippedWidget = new Shipped.Widget(shippedConfig);

  function subtotalValue(subtotal) {
    if (subtotal === null || subtotal === undefined) return 0;

    return subtotal.replace('$', '').replace(',', '');
  }

  var existingDetails;

  function shouldRefreshUI(existingDetails, details) {
    if (existingDetails === undefined) return true;
    if (existingDetails.isSelected == details.isSelected && details.isSelected === false) return false;
    if (existingDetails.totalFee === details.totalFee && existingDetails.isSelected == details.isSelected) return false;

    return true;
  }

  function handleShippedChange(details) {
    let path;
    if (details.isSelected) {
      // add shield
      path = '/on/demandware.store/Sites-RefArch-Site/default/ShippedSuite-Add'
      console.log('adding...')
    } else {
      // remove shield
      path = '/on/demandware.store/Sites-RefArch-Site/default/ShippedSuite-Remove'
      console.log('removing...')
    }

    var shouldRefresh = shouldRefreshUI(existingDetails, details);
    console.log('should refresh UI?', shouldRefresh);
    existingDetails = details;

    fetch(path, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'same-origin',
    }).then(function(response) {
      return response.json();
    }).then(function(data) {
      if (shouldRefresh) {
        // for checkout page
        $('body').trigger(
          'checkout:updateCheckoutView', { order: data.order, customer: data.customer }
        );
        // for cart page
        // $('.quantity-form > .quantity').first().change();
      }
    });
  }

  var widget = document.getElementsByClassName('shipped-widget')[0];
  var existingSubtotal = widget.dataset.subtotal;
  shippedWidget.updateOrderValue(subtotalValue(widget.dataset.subtotal));

  // update order value when cart items change
  // only applicable on cart page
  // $('body').on('cart:update promotion:success', function(e, data) {
  //   var totals;
  //   if (data.basket === undefined) {
  //     totals = data.totals;
  //   } else {
  //     totals = data.basket.totals;
  //   }
  //   if (totals === undefined) return;
  //
  //   console.log('change total?', existingSubtotal !== totals.subTotal);
  //   if (existingSubtotal !== totals.subTotal) {
  //     shippedWidget.updateOrderValue(subtotalValue(totals.subTotal));
  //   }
  //
  //   existingSubtotal = totals.subTotal;
  // });

  shippedWidget.onChange(details => handleShippedChange(details));
});
