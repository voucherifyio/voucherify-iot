'use strict'

const express = require('express')
const bodyParser = require('body-parser');
const app = express()
app.use(bodyParser.json())
require('express-ws')(app)

const Redis = require('ioredis');
const redis = new Redis();

// TOOD load vouchers via API
redis.set('voucherify:code', 'test code');
redis.set('voucherify:used', 0);

app.listen(8080, function () {
  console.log('Example app listening on port 8080!')
});

app.post('/register', function(req, res) {
  const device = req.body.device

  if (!device) {
    return res.status(400).send({error: 'Missing device ID.'})
  }

  redis.get('voucherify:code', function (err, result) {
    res.json({
      code: result
    })
  });

});
