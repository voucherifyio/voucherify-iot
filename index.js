'use strict'

const nfc = require('explorenfc')

const db = {
  '04C00DEAFC3880': 'piwo-RQ-vArGTfO'
}

function startListening () {
  nfc.init('/usr/bin/explorenfc-basic')
  nfc.read((nfcEvent) => {
    if (nfcEvent){
      console.log('id', nfcEvent.id)
      console.log('value', nfcEvent.value)
    } else {
      console.log('no NFC Event')
    }

    startListening()
  })
}

startListening()
