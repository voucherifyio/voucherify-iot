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


function startListening (cb) {
  nfc.init('/usr/bin/explorenfc-basic')
  nfc.read((nfcEvent) => {
    if (nfcEvent) {
      console.log('id', nfcEvent.id)
      console.log('value', nfcEvent.value)

      voucherifyClient.redeem(nfcEvent.value)
        .then(function (result) {
            if (cb) {
              cb({code: nfcEvent.value})
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

app.get('/gift/:code', function(req, res) {
  const code = req.params.code


})

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


const WebSocket = require('ws');
const proxyWs = new WebSocket('ws://voucherify-iot-proxy.herokuapp.com/link')

proxyWs.on('message', function(data, flags) {
  const voucher = JSON.parse(data)
  const code = voucher.code
  const device = voucher.device

  return voucherifyClient.redeem(code)
    .then(function (result) {
      console.info('Successful voucher redeem of voucher from proxy')
      for (const ws of openWebSockets) {
        ws.send(JSON.stringify({code: code}, null, 2))
        proxyWs.send(JSON.stringify({device: device, status: 200}))
      }
    })
    .catch(function (error) {
      console.info(`Failed voucher redeem of voucher from proxy. Code - ${code}`)
      for (const ws of openWebSockets) {
        ws.send(JSON.stringify({code: null}, null, 2))
        proxyWs.send(JSON.stringify({device: device, status: 400}))
      }
    })
    .finally(() => res.status(200).send({}))
})
