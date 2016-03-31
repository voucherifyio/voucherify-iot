'use strict'

const nfc = require('explorenfc')
const voucherify = require('voucherify')
const voucherifyClient = voucherify({
    applicationId: "c70a6f00-cf91-4756-9df5-47628850002b",
    clientSecretKey: "3266b9f8-e246-4f79-bdf0-833929b1380c"
});

const db = {
  '04C00DEAFC3880': 'piwo-RQ-vArGTfO'
}

function startListening () {
  nfc.init('/usr/bin/explorenfc-basic')
  nfc.read((nfcEvent) => {
    if (nfcEvent) {
      console.log('id', nfcEvent.id)
      console.log('value', nfcEvent.value)

      voucherifyClient.get(db[nfcEvent.id])
        .then(function (result) {
            console.log(result);
        })
        .catch(function (error) {
            console.error("Error: %s", error);
        });

    } else {
      console.log('no NFC Event')
    }

    startListening()
  })
}

startListening()
