const { parse } = require('querystring');
const Address4 = require("ip-address").Address4;
const crypto = require("crypto");
const json = { message: "OK" };

var appRouter = function (app, jsonParser) {
  
  app.get("/", function(req, res) {
    res.status(200).send({ message: "OK" });
  });

  app.post("/", jsonParser, function (req, res) {
    try
    {
      const ip = req.query["ip"];
      const port = req.query["port"];
      const phone = req.query["phone"];      
      const length = req.query["length"];
      const username = req.query["username"];
      const password = req.query["password"];
      const body = req.body;

      const jsonParameters = {};
      jsonParameters.ip = ip;
      jsonParameters.port = port;
      jsonParameters.phone = phone;
      jsonParameters.length = length;
      jsonParameters.username = username;
      jsonParameters.password = password;
      jsonParameters.body = body;

      let address;
      if (!(
        !!!ip || !!!ip.length || (ip.length <= 0) || (ip.length > 40) || !((address = new Address4(ip)).isValid()) || 
        !!!port || !!!port.length || (port.length <= 0) || (port.length > 4) || 
        !!!phone || !!!phone.length || !(phone.length === 11) || 
        !!!length || !!!length.length || (length.length < 1) || (length.length > 2) || parseInt(length) <= 3 || parseInt(length) > 16 ||
        !!!username || !!!username.length || (username.length <= 0) || (username.length > 16) || 
        !!!password || !!!password.length || (password.length <= 0) || (password.lengh > 16) || 
        !!!body || !!!body.message)) {

        const code_length = parseInt(length);
        const buf = crypto.randomBytes(256 * code_length);
        const possible = "0123456789";

        let code = "";
        for (var i = 0; i < code_length; i++)
          code += possible.charAt(buf[Math.floor(Math.random() * buf.length)] % possible.length);

        json.code = code;

        const smpp = require('smpp');
        const session = smpp.connect('smpp://' + ip + ':' + port);

        function bind_transceiver() {
          const bind_transceiver_promise = new Promise(function(resolve, reject) {
            session.bind_transceiver({
              system_id: username,
              password: password
            }, function(pdu) {
              if (pdu.command_status == 0) {
                resolve(pdu);
              } else {
                reject(pdu);
              }
            });
          });
          return bind_transceiver_promise;
        }

        function submit_sm() {
          const submit_sm_promise = new Promise(function(resolve, reject) {
            session.submit_sm({
              destination_addr: phone,
              short_message: body.message + ' ' + json.code
            }, function(pdu) {
                if (pdu.command_status == 0) {
                  resolve(pdu);
                } else {
                  reject(pdu);
                }
            });
          });
          return submit_sm_promise;
        }

        bind_transceiver().then(function(pdu) {
          submit_sm().then(function(pdu){
            session.close();
            json.json = JSON.stringify(pdu);
            res.status(200).send(json);
          }).catch(function(pdu){
            session.close();
            res.status(400).send({ message: 'Error', json: JSON.stringify(pdu) });
          });
        }).catch(function(pdu){
          session.close();
          json.json = JSON.stringify(pdu);
          res.status(400).send({ message: 'Error' });
        });
      } else {
        res.status(400).send({ message: 'Error', json: JSON.stringify(jsonParameters) });
      }
    } catch (ex) {
      res.status(400).send({ message: 'Error', json: JSON.stringify(ex) });
    } finally {
    }
  });
}

module.exports = appRouter;