console.log('345353453454');
document.addEventListener('DOMContentLoaded', function () {
  console.log('hahahahahah');
  var shield = new Shipped.Shield({
    publicKey: 'pk_development_9570b140f70c9c69865eb67f6dea91d4efbbc5d03adc4924e91a9b4c766ddc30',
    shieldDiv: '.shipped-shield-div'
  });

  shield.updateOrderValue(430);
});
