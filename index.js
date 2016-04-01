'use strict'

const nfc = require('explorenfc')
const voucherify = require('voucherify')
const voucherifyClient = voucherify({
    applicationId: "c70a6f00-cf91-4756-9df5-47628850002b",
    clientSecretKey: "3266b9f8-e246-4f79-bdf0-833929b1380c"
});

const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
app.use(express.static('public'));

const db = {
  '04C00DEAFC3880': 'piwo-RQ-vArGTfO',
  '14878F01': 'piwo-RQ-jIyqKG'
}

function startListening (cb) {
  nfc.init('/usr/bin/explorenfc-basic')
  nfc.read((nfcEvent) => {
    if (nfcEvent) {
      console.log('id', nfcEvent.id)
      console.log('value', nfcEvent.value)

      voucherifyClient.get(db[nfcEvent.id])
        .then(function (result) {
            if (cb) {
              cb(result)
            }
            console.log(result);
        })
        .catch(function (error) {
          if (cb) {
            cb({code: null})
          }
          console.error("Error: %s", error);
        });

    } else {
      if (cb) {
        cb({code: null})
      }
      console.log('no NFC Event')
    }

    startListening(cb)
  })
}

const openWebSockets = new Set()

startListening((validate) => {
  for (const ws of openWebSockets) {
    ws.send(JSON.stringify(validate, null, 2))
  }
});

app.ws('/echo', function(ws, req) {
  const uid = Math.random()
  console.info(`Opened new connection. UID - ${uid}`)
  openWebSockets.add(ws)

  ws.on('close', () => {
    console.info(`Closed new connection. UID - ${uid}`)
    openWebSockets.delete(ws)
  })
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
