const Returnly = require("~/cartridge/scripts/libReturnly");
const ReturnlySerializer = require("~/cartridge/scripts/ReturnlySerializer");
const ReturnlyExceptions = require("~/cartridge/scripts/ReturnlyExceptions");

function ensurePostRequest() {
  if (request.httpMethod !== "POST") {
    throw new ReturnlyExceptions.BadRequest("Invalid request method");
  }
}

function ensureGetRequest() {
  if (request.httpMethod !== "GET") {
    throw new ReturnlyExceptions.BadRequest("Invalid request method");
  }
}

function ensureAuthenticated() {
  const auth = request.httpParameterMap.get("auth").stringValue;
  if (!Returnly.checkAuthentication(auth)) {
    throw new ReturnlyExceptions.Unauthorized("Authentication failed");
  }
}

const Filters = {
  postRequest: ensurePostRequest,
  getRequest: ensureGetRequest,
  authenticated: ensureAuthenticated
};

function respondWithError(e) {
  response.getWriter().print(ReturnlySerializer.errorToJSON(e));
  if (empty(e.status)) {
    response.setStatus(500);
    return;
  }

  response.setStatus(e.status);
}

function ensure(filters, callback) {
  const exposedFunction = function() {
    try {
      filters.forEach(function(filter) {
        Filters[filter]();
      });
    } catch (e) {
      response.setHttpHeader("Content-Type", "application/json");
      respondWithError(e);
      return;
    }

    callback();
  };

  exposedFunction.public = true;
  return exposedFunction;
}

module.exports = {
  respondWithError: respondWithError,
  ensure: ensure
};
