const server = require('server');

server.post('Add', function (req, res, next) {
  // let's add a variable to session indicating user opted in
  res.json({ status: 'added' });
  next();
});

server.post('Remove', function (req, res, next) {
  // let's add a variable to session indicating user opted out
  res.json({ status: 'removed' });
  next();
});

module.exports = server.exports();
