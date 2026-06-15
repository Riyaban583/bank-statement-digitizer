const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");

setGlobalOptions({ maxInstances: 10 });

exports.helloWorld = onRequest((req, res) => {
  res.send("Hello from Bank Statement Digitizer!");
});

exports.logUpload =
  onRequest(
    (req, res) => {

      const {
        uploadId,
        userId,
        bank,
        transactionCount,
        errorType,
      } = req.body;

      console.log(
        "UPLOAD LOG",
        {
          uploadId,
          userId,
          bank,
          transactionCount,
          errorType,
        }
      );

      res.json({
        success: true,
      });
    }
  );