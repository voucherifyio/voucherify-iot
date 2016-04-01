'use strict'

const express = require('express')
const bodyParser = require('body-parser');
const app = express()
app.use(bodyParser.json())
require('express-ws')(app)

const Redis = require('ioredis');
const redis = new Redis();

// TOOD load vouchers via API
redis.set('voucherify:campaign:0', 'test code');
redis.set('voucherify:campaign:1', 'test code 1');
redis.del('voucherify:nextId')
redis.del('voucherify:device:test')

app.listen(8080, function () {
  console.log('Example app listening on port 8080!')
});

app.post('/register', function(req, res) {
  const device = req.body.device

  if (!device) {
    return res.status(400).send({error: 'Missing device ID.'})
  }
  console.info(`Register Device - ${device}`)

  redis.get(`voucherify:device:${device}`).then((voucher) => {
    if (!voucher) {
      return redis.get('voucherify:nextId').then((id) => {
        id = id || 0
        console.log(`Next ID - ${id}`)

        return redis.set('voucherify:nextId', id + 1)
          .then((a) => redis.get(`voucherify:campaign:${id}`))
          .then((newVoucher) => {
            if (!newVoucher) {
              console.info(`Critical Error, no more available vouchers.`)
              return res.status(500).send({error: 'No more vouchers.'})
            }

            console.info(`Assigning Voucher - "${newVoucher}", Device - ${device}`)
            redis.set(`voucherify:device:${device}`, newVoucher)
              .then(() => res.json({code: newVoucher}))
          })
      });
    }

    console.info(`Already registered. Device - "${device}", Voucher - "${voucher}"`)
    res.json({code: voucher})
  });
});
