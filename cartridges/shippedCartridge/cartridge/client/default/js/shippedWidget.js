document.addEventListener('DOMContentLoaded', function () {
  const shippedWidget = new Shipped.Widget(shippedConfig);

  function subtotalValue(subtotal) {
    if (subtotal === null || subtotal === undefined) return 0;

    return subtotal.replace('$', '').replace(',', '');
  }

  var widget = document.getElementsByClassName('shipped-widget')[0];
  shippedWidget.updateOrderValue(subtotalValue(widget.dataset.subtotal));

  // update order value when cart items change
  $('body').on('cart:update promotion:success', function(e, data) {
    var totals;
    if (data.basket === undefined) {
      totals = data.totals;
    } else {
      totals = data.basket.totals;
    }
    if (totals === undefined) return;

    shippedWidget.updateOrderValue(subtotalValue(totals.subTotal));
  });

  shippedWidget.onChange(function(details) {
    console.log(details)
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

    fetch(path, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'same-origin',
    }).then(function(response) {
      console.log(response);
    });
  });
});
