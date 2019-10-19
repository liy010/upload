const Hash = require('crypto');
const formidable = require('formidable');
const Busboy = require('busboy');
const buffer_package = require('buffer');
const fs = require('fs');



const inspect = require('util').inspect;

let mine = function(req) {
  var str = req.headers['content-type'] || '';
  return str.split(';')[0]
}


/**
 * @namespace fileBuffers 缓存文件的所有块
 * @namespace fileMessage 初始化上传时, 所传入的文件信息
 *   @property name 文件名
 *   @property totalSize 文件总大小
 *   @property pieceCount 文件的总分片数量
 * @namespace 已上传的文件分片数量
 */
var fileBuffers = [];
let fileMessage = {};
let length = 0;

/**
 * @augments req 请求信息
 * @augments res 相应
 */
let upload = function(req, res) {
  var buffers = [];
  var type = mine(req);

  // 初始化上传, 将文件信息先传入
  if (type === 'application/json') {
    req.on('data', function(chunk) {
      buffers.push(chunk);
    });
    req.on('end', function() {
      fileBuffers = [];
      fileMessage = {};
      length = 0;
      let obj = JSON.parse(Buffer.concat(buffers).toString())
      fileMessage.name = obj.name;
      fileMessage.size = obj.totalSize;
      fileMessage.pieceCount = obj.pieceCount;
      console.log(fileMessage);
      buffers = []
      res.status(200).send(JSON.stringify({code: 3, message: 'init', piece: 0})).end();
    });
    return;
  }
  var busboy = new Busboy({ headers: req.headers });
  let hash = '';
  busboy.on('file', function(fieldname, file) {
    file.on('data', function(data) {
      buffers.push(data);
      
    });
    file.on('end', function() {
      let chunk = Buffer.concat(buffers);
      let fileHash = Hash.createHash('md5').update(chunk).digest('hex');
      if (fileHash === hash) {
        fileBuffers.push(chunk);
      } else {
        res.status(449).send(JSON.stringify({code: 0, msg: 'hash校验错误'}))
      }
    });
  });
  busboy.on('field', function(fieldname, val) {
    hash = val;
  });
  busboy.on('finish', function() {
    length++;
    if (length === fileMessage.pieceCount) {
      res.status(200).end(JSON.stringify({code: 1, msg: '上传成功'}));
      console.log(fileBuffers);
      return;
    }
    res.status(200).send(JSON.stringify({code: 2, message: 'continue', piece: length})).end();
  });
  req.pipe(busboy);
}


module.exports = upload;













  // if (type === "multipart/form-data") {
    // req.on('data', function(chunk) {
    //   buffers.push(chunk);
    // });
    // req.on('end', function() {
    //   let chunkBuffer = Buffer.concat(buffers);

    //   fs.writeFile('./stream.txt', chunkBuffer, function(err) {
    //     if(err) {
    //       console.log(err);
    //     }
    //   })
    //   let data, hash;
    //   console.log(data);
    //   console.log(data);
    //   if (Hash.digest(data) === hash) {
    //     fileBuffers.push(data);
    //     length++;
    //     if (length === fileMessage.pieceCount) {
    //       res.status(200).end(JSON.stringify({code: 1, msg: '上传成功'}));
    //     }
    //     res.status(200);
    //   } else {
    //     res.status(449).send(JSON.stringify({code: 0, msg: 'hash校验错误'}))
    //   }
    // })