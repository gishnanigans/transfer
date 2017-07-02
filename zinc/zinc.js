

// https://stackoverflow.com/questions/20643470/execute-a-command-line-binary-with-node-js

'use strict';

// export client|server, local|remote, source|destin

const
  // dependencies core
  path = require('path'),
  fs   = require('fs'),
  // exec = require('child_process').execSync, // only for cksum
  crypto = require('crypto'),
  
  // dependencies pkgs
  // yaml = require('js-yaml'),
  ssh  = require('ssh2'),
  
  // settings
  cli  = require.main === module;
  // conf = yaml.safeLoad(fs.readFileSync('zinc.yaml', 'utf8'));
  // conf.ignore = conf.ignore || [];


if (cli) {
  var root = process.argv[2];
  var tree = buildTree(root);
  process.stdout.write(JSON.stringify(tree));
}
else {
  module.exports = {
    build: build,
    diff:  diff,
    sync:  sync
  };
}

function build (root) {
  // root path or config object
  
  // var rtree = sshTree();
  // console.log(rtree);
  // var stree = buildTree('publish');
  // var dtree = JSON.parse(sshTree());
  // console.log(tree)
  // console.log(rtree);
  
  // if (stree && dtree) {
  //   diffTree(stree, dtree);
  // }
  
}

function diff (source, destin) {
  
}

function sync () {
  
}


// function sshTree () {
//   var path = 'pubx';
//   var tree = exec(`node ../zinc ${path}`).toString();
//   // return JSON.parse(tree);
//   return tree; // json
// }

// function sync (root, diff) { // remote root
//   diff.remote = path.resolve(root);
//   return JSON.stringify(diff);
// }


function buildTree (absolute, ignore, relative, tree, depth, init = true) {
  
  if (init) {
    if (!absolute) {
      console.log(`Zinc Error: specify a root directory`);
      return;
    }
    else if (!fs.existsSync(absolute)) {
      console.log(`Zinc Error: "${path.resolve(path.resolve(absolute))}" does not exist`);
      return;
    }
    else if (!fs.statSync(absolute).isDirectory()) {
      console.log(`Zinc Error: "${path.resolve(path.resolve(absolute))}" is not a directory`);
      return;
    }
    else {
      absolute = path.resolve(absolute);
      ignore = ignore || [],
      relative = '';
      tree = [];
      depth = 0;
      init = false;
    }
  }
  
  fs.readdirSync(absolute).forEach(item => {
    
    // might include paths, not just items
    // might include except(tions)
    if (ignore.indexOf(item) > -1) {
      return;
    }
    
    var abs = path.join(absolute, item);
    var rel = path.join(relative, item);
    
    var stats = fs.statSync(abs);
    
    if (stats.isFile()) {
      tree.push({
        abs: abs,
        rel: rel,
        crc: crc(abs),
        depth: depth
      });
    }
    else if (stats.isDirectory()) {
      tree.push({
        abs: abs,
        rel: rel,
        crc: 'dir',
        depth: depth
      });
      buildTree(abs, ignore, rel, tree, depth + 1, init);
    }
  });
  
  return tree;
}

function crc (file, algo, enc) {
  
  let data = fs.readFileSync(file);
  
  return crypto
    .createHash(algo || 'md5')
    .update(data, 'utf8')
    .digest(enc || 'hex');
  
  // https://blog.tompawlak.org/calculate-checksum-hash-nodejs-javascript
  
  // nix only ...
  // return exec(`cksum ${file}`).toString().split(' ')[0];
  
  // https://stackoverflow.com/questions/12276426/windows-equivalent-of-linux-cksum-command
  // let winSum = `CertUtil -hashfile  ${file} MD5`;
  // let nixSum = `md5sum  ${file}`; // native nix md5
}

function diffTree (source, destin) {
  
  let diff = {upload: [], remove: []};
  
  // We can safely skip including children of directories
  // that we've already found and added to upload|remove
  // Directories are processed first in our buildTree,
  // otherwise we could do...
  // source.sort((A, B) => A.depth - B.depth);
  // destin.sort((A, B) => A.depth - B.depth);
  
  // process uploads
  source.forEach(item => {
    
    // if (diff.upload.some(test => item.rel.indexOf(test.rel) === 0)) {
    //   return;
    // }
    
    var saved = diff.upload.some(test => {
      return item.rel.indexOf(test.rel) === 0;
    });
    
    if (saved) {
      return;
    }
    
    // if (!destin.every(test => item.rel === test.rel && item.crc === test.crc;)) {
    //   diff.upload.push(item);
    // }
    
    var found = destin.some(test => {
      return item.rel === test.rel && item.crc === test.crc;
    });
    
    if (!found) {
      diff.upload.push(item);
    }
  });
  
  // process removes
  destin.forEach(item => {
    
    // if (diff.upload.some(test => item.rel.indexOf(test.rel) === 0)) {
    //   return;
    // }
    
    var saved = diff.remove.some(test => {
      return item.rel.indexOf(test.rel) === 0;
    });
    
    if (saved) {
      return;
    }
    
    // if (source.every(test => item.rel !== test.rel)) {
    //   diff.remove.push(item);
    // }
    
    var trash = source.every(test => {
      return item.rel !== test.rel;
    });
    
    if (trash) {
      diff.remove.push(item);
    }
  });
  
  // console.log(diff)
  return diff;
}

