
'use strict';

var ssh2 = require('ssh2').Client;
var fs = require('fs');
var join = require('path').join;
var crypto = require('crypto');


// md5sum <file>
// CertUtil -hashfile <file> MD5
// certutil -hashfile <file> MD5


var key = fs.readFileSync('ibis.pem');

var login = {
  port: 22,
  host: '52.20.143.110',
  username: 'ubuntu',
  privateKey: key
};

var srcRoot = '/home/chronos/user/Downloads/transfer/public';
var dstRoot = '/home/ubuntu/public';

var dirA = '/home/chronos/user/Downloads/example/publish';
var dirB = '/home/chronos/user/Downloads/example/pubx';


var opts = {
  ignore: ['.gitignore', '.git', 'node_modules', '/index.html'] // /home/chronos/user/Downloads/example/publish/include/css
};

var diff = diffDir(dirA, dirB, opts);
console.log(diff);


///////// STILL HAVE TO COMPLET IS-DIRECTORY ON DETACHED AND RELATED

function diffDir (srcRoot, dstRoot, opts, path, diff) {
  
  if (!diff) {
    diff = {
      ignoring: [],
      detached: [],
      notfound: [],
      modified: [],
      nochange: []
    };
  }
  
  if (!path) {
    path = '';
  }
  
  let srcList = listDir(srcRoot);
  let dstList = listDir(dstRoot);
  
  srcList.forEach(srcItem => {
    
    let item = {
      itemName: srcItem,
      srcRoot: srcRoot,
      dstRoot: dstRoot,
      isDir: false
    };
    
    if (ignore(srcRoot, path, srcItem, opts.ignore)) {
      diff.ignoring.push(item);
      return;
    }
    
    let dstIdx = dstList.indexOf(srcItem);
    
    if (dstIdx > -1) {
      let found = dstList.splice(dstIdx, 1);
      
      let srcPath = join(srcRoot, srcItem);
      let dstPath = join(dstRoot, srcItem);
      
      let srcInfo = info(srcPath);
      let dstInfo = info(dstPath);
      
      if (srcInfo.cksum && srcInfo.cksum === dstInfo.cksum) {
        diff.nochange.push(item);
        return; // next item
      }
      else if (srcInfo.isFile) {
        // upload modified here
        diff.modified.push(item);
      }
      else if (srcInfo.isDir) {
        if (dstInfo.isDir) {
          // recursive traverse here
          diffDir(srcPath, dstPath, opts, join(path, srcItem), diff);
        }
        else {
          // upload modified here
          diff.modified.push(item);
        }
      }
      else {
        // src is not file or dir
        // we do not handle others
      }
    }
    else {
      // upload missing here
      diff.notfound.push(item);
    }
  });
  
  // process detached (remaining) dst items
  dstList.forEach(dstItem => {
    if (ignore(srcRoot, path, dstItem, opts.ignore)) {
      return;
    }
    // remove detached here
    let item = {
      itemName: dstItem,
      srcRoot: srcRoot,
      dstRoot: dstRoot,
      isDir: false
    };
    
    diff.detached.push(item);
  });
  
  return diff;
}


function ignore (root, path, item, ignores) {
  
  let isolated = item;
  let relative = join(path, item);
  let absolute = join(root, item);
  let prefixed = join('/', path, item);
  let trailing = join(path, item, '/');
  let enclosed = join('/', path, item, '/');
  
  return false ||
    ignores.indexOf(isolated) > -1 ||
    ignores.indexOf(relative) > -1 ||
    ignores.indexOf(absolute) > -1 ||
    ignores.indexOf(prefixed) > -1 ||
    ignores.indexOf(trailing) > -1 ||
    ignores.indexOf(enclosed) > -1;
}

function listDir (path) {
  return fs.readdirSync(path);
}


function info (path) {
  
  let stat = fs.statSync(path);
  let isFile = stat.isFile();
  let isDir = stat.isDirectory();
  let cksum = (isFile) ? crc(path) : false; // (isDir ? 'DIR' : 'NON')
  
  return {
    isFile: isFile,
    isDir: isDir,
    cksum: cksum
  };
}


function crc (file, algo, enc) {
  
  let data = fs.readFileSync(file);
  
  let cksum = crypto
    .createHash(algo || 'md5')
    .update(data, 'utf8')
    .digest(enc || 'hex');
    
  // console.log('checksum', file, cksum);
  return cksum;
}
