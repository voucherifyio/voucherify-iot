'use strict'

const express = require('express')
const Promise = require('bluebird')
const bodyParser = require('body-parser')
const voucherify = require('voucherify')
const _ = require('lodash')

const app = express()
app.use(bodyParser.json())
require('express-ws')(app)

const Redis = require('ioredis');
const REDIS_URL = process.env.REDISCLOUD_URL
const PORT = process.env.PORT || 8080
const ADMIN_PWD = process.env.ADMIN_PWD
const VOUCHERIFY_APP_ID = process.env.VOUCHERIFY_APP_ID
const VOUCHERIFY_CLIENT_SECRET = process.env.VOUCHERIFY_CLIENT_SECRET

const redis = new Redis(REDIS_URL, {no_ready_check: true});
const voucherifyClient = voucherify({
    applicationId: VOUCHERIFY_APP_ID,
    clientSecretKey: VOUCHERIFY_CLIENT_SECRET
});

app.listen(PORT, function () {
  console.log(`Example app listening on port ${PORT}!`)
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

        return redis.set('voucherify:nextId', +id + 1)
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

app.post('/gift', function(req, res) {
  const device = req.body.device
  const code = req.body.code

  if (!device || !code) {
    return res.status(400).send({error: 'Missing device ID and/or voucher code.'})
  }

  return res.status(200).send({})
})

app.get('/next-id', function(req, res) {
  const device = req.body.device
  const code = req.body.code

  return redis.get('voucherify:nextId')
    .then((nextId) => req.status(200).send(nextId))
})

app.post('/campaign', function(req, res) {
  const name = req.body.name
  const password = req.body.password

  if (!name) {
    return res.status(400).send({error: 'Missing Campaign name.'})
  }

  if (password !== ADMIN_PWD) {
    return res.status(403).send({error: 'Go away.'})
  }

  redis.del('voucherify:campaign:*')
    .then(() => {
      return voucherifyClient.list({ limit: 200, campaign: name })
        .then((vouchers) => _.map(vouchers, 'code'))
        .then((codes) => Promise.map(codes, (code, id) => redis.set(`voucherify:campaign:${id}`, code)))
        .then(() => redis.set('voucherify:nextId', 0))
        .then(() => res.status(200).send({}))
    })
})
