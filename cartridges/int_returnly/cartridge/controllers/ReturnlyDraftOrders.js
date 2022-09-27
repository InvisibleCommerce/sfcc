const ReturnlyOrderMgr = require("~/cartridge/scripts/ReturnlyOrderMgr");
const ReturnlySerializer = require("~/cartridge/scripts/ReturnlySerializer");
const ReturnlyRequestUtil = require("~/cartridge/scripts/ReturnlyRequestUtil");

function create() {
  response.setHttpHeader("Content-Type", "application/json");
  try {
    const params = JSON.parse(
      request.httpParameterMap.getRequestBodyAsString()
    );
    const order = ReturnlyOrderMgr.createDraft(params);
    response.getWriter().print(ReturnlySerializer.draftToJSON(order));
    response.setStatus(201);
  } catch (e) {
    ReturnlyRequestUtil.respondWithError(e);
  }
}

function cancel() {
  response.setHttpHeader("Content-Type", "application/json");
  try {
    ReturnlyOrderMgr.cancelDraft(
      request.httpParameterMap.get("draft_order_id").stringValue
    );
    response.setStatus(200);
  } catch (e) {
    ReturnlyRequestUtil.respondWithError(e);
  }
}

function complete() {
  response.setHttpHeader("Content-Type", "application/json");
  try {
    const order = ReturnlyOrderMgr.completeDraft(
      request.httpParameterMap.get("draft_order_id").stringValue
    );
    response.getWriter().print(ReturnlySerializer.orderToJSON(order));
    response.setStatus(202);
  } catch (e) {
    ReturnlyRequestUtil.respondWithError(e);
  }
}

module.exports.Create = ReturnlyRequestUtil.ensure(
  ["postRequest", "authenticated"],
  create
);

module.exports.Cancel = ReturnlyRequestUtil.ensure(
  ["postRequest", "authenticated"],
  cancel
);

module.exports.Complete = ReturnlyRequestUtil.ensure(
  ["postRequest", "authenticated"],
  complete
);
