const ProductMgr = require("dw/catalog/ProductMgr");

const ReturnlyRequestUtil = require("~/cartridge/scripts/ReturnlyRequestUtil");
const ReturnlySerializer = require("~/cartridge/scripts/ReturnlySerializer");
const ReturnlyExceptions = require("~/cartridge/scripts/ReturnlyExceptions");

function show() {
  response.setHttpHeader("Content-Type", "application/json");

  try {
    const productID = request.httpParameterMap.get("product_id").value;

    if (empty(productID)) {
      throw new ReturnlyExceptions.BadRequest(
        "Bad Request: Product ID should be integer"
      );
    }

    const product = ProductMgr.getProduct(productID);

    if (empty(product)) {
      throw new ReturnlyExceptions.InvalidProductID(
        "Requested product doesn't exist",
        404
      );
    }

    const masterProduct = product.variationModel.master;

    response.getWriter().print(ReturnlySerializer.productToJSON(masterProduct));
    response.setStatus(200);
  } catch (e) {
    ReturnlyRequestUtil.respondWithError(e);
  }
}

module.exports.Show = ReturnlyRequestUtil.ensure(
  ["getRequest", "authenticated"],
  show
);
