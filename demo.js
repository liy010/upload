var formidable = require('formidable'),
    http = require('http'),
    util = require('util');
    fs = require('fs');

http.createServer(function(req, res) {
  let buffers = [];
  if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
    // parse a file upload
    req.on('data', function(chunk) {
      buffers.push(chunk);
    });
    req.on('end', function() {
      let chunkBuffer = Buffer.concat(buffers);

      fs.writeFile('./stream.txt', chunkBuffer, function(err) {
        if(err) {
          console.log(err);
        }
      })
    })

    return;
  }

  // show a file upload form
  res.writeHead(200, {'content-type': 'text/html'});
  res.end(
    '<form action="/upload" enctype="multipart/form-data" method="post">'+
    '<input type="text" name="title"><br>'+
    '<input type="file" name="upload" multiple="multiple"><br>'+
    '<input type="submit" value="Upload">'+
    '</form>'
  );
}).listen(8080);