'use strict'

const express = require('express')
const app = express()
const expressWs = require('express-ws')(app)


app.listen(8080, function () {
  console.log('Example app listening on port 8080!')
});

app.post('/register', function(req, res) {
  const {device} = req.body

  if (!device) {
    return res.status(400).send({error: 'Missing device ID.'})
  }

  res.json({
    code: 'test code'
  })
});
