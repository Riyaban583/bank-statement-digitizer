const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");

setGlobalOptions({ maxInstances: 10 });

exports.helloWorld = onRequest((req, res) => {
  res.send("Hello from Bank Statement Digitizer!");
});