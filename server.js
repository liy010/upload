const express = require('express');
const ejs = require('ejs');
const upload = require('./upload');
const app = express();

app.engine('html', ejs.__express);

app.set('view engine', 'html');
app.use(express.static('static'));
app.post('/upload', (req, res) => {
  upload(req, res);
})

app.get('/', (req, res) => {
  res.render('client');
  res.end();
}).listen(8000);