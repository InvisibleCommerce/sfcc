const server = require('server');

server.post('Add', function (req, res, next) {
  // let's add a variable to session indicating user opted in
  let session = req.session;
  // console.log(session);
  session.privacyCache.shippedSuite = true;
  res.json({ status: 'added', session: session });
  next();
});

server.post('Remove', function (req, res, next) {
  // let's add a variable to session indicating user opted out
  let session = req.session;
  // console.log(session);
  session.privacyCache.shippedSuite = false;
  res.json({ status: 'removed', session: session });
  next();
});

module.exports = server.exports();
