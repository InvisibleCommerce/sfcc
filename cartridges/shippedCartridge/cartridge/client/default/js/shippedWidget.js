document.addEventListener('DOMContentLoaded', function () {
  const shield = new Shipped.Widget(shippedConfig);

  // TODO: calculate actual order price here
  shield.updateOrderValue(430);
  shield.onChange(function(details) {
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
