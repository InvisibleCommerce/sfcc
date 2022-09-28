document.addEventListener('DOMContentLoaded', function () {
  const shield = new Shipped.Shield({
    publicKey: 'pk_development_9570b140f70c9c69865eb67f6dea91d4efbbc5d03adc4924e91a9b4c766ddc30',
    shieldDiv: '.shipped-shield-div'
  });

  shield.updateOrderValue(430);
  shield.onChange(function(details) {
    console.log(details)
    let path;
    if (details.isShieldEnabled) {
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
