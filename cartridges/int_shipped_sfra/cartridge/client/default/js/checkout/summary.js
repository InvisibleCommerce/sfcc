'use strict';

var base = require('base/checkout/summary');
var baseUpdateTotals = base.updateTotals;

/**
 * updates the totals summary
 * @param {Array} totals - the totals data
 */
function updateTotals(totals) {
  baseUpdateTotals.call(this, totals);

  if (totals.shippedTotal.value > 0) {
    $('.shipped-fees').removeClass('hide-order-discount');
    $('.shipped-fees-total').text(totals.shippedTotal.formatted);
  } else {
    $('.shipped-fees').addClass('hide-order-discount');
  }
}

base.updateTotals = updateTotals;

module.exports = base;
