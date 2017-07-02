

// https://stackoverflow.com/questions/20643470/execute-a-command-line-binary-with-node-js

'use strict';

// export client|server, local|remote, source|destin

const
  path = require('path'),
  fs = require('fs'),
  exec = require('child_process').execSync,
  cli = require.main === module;

var
  confFile = 'sync.json',
  conf = (fs.existsSync(confFile)) ? require(confFile) : {};
  
conf.ignore = conf.ignore || [];
conf.ignore = ['node_modules', '.git'];

if (cli) {
  var root = process.argv[2] || conf.root;
  
  var tree = buildTree(root);
  // var rtree = sshTree();
  // console.log(tree)
  // console.log(rtree)
  process.stdout.write(JSON.stringify(tree));
  
}
else {
  // var rtree = sshTree();
  // console.log(rtree);
  var stree = buildTree('publish');
  var dtree = JSON.parse(sshTree());
  // console.log(tree)
  // console.log(rtree);
  
  if (stree && dtree) {
    diffTree(stree, dtree);
  }
  
  module.exports = {
    build: buildTree,
    diff: diffTree,
    sync: sync,
    conf: conf
  }
}


function diffTree (source, destin) {
  
  // rebuild to only include one array for source | destin
  // sort to src | dst
  
  // do we need two arrays ???
  
  var sdir = source.dirs.sort((A, B) => A.depth - B.depth);
  var ddir = destin.dirs.sort((A, B) => A.depth - B.depth);
  var sfile = source.files.sort((A, B) => A.depth - B.depth);
  var dfile = destin.files.sort((A, B) => A.depth - B.depth);
  var sall = sdir.concat(sfile);
  var dall = ddir.concat(dfile);
  var diff = {upload: [], remove: []};
  
  // process uploads
  sall.forEach(item => {
    
    // if (diff.upload.some(test => item.rel.indexOf(test) === 0)) {
    //   return;
    // }
    
    var saved = diff.upload.some(test => {
      return item.rel.indexOf(test) === 0;
    });
    
    if (saved) {
      return;
    }
    
    if (!dall.some(test => item.rel === test.rel)) {
      diff.upload.push(item.rel); // push whole object not just rels
    }
    
    // var found = ddir.some(test => {
    //   return item.rel === test.rel;
    // });
    
    // if (!found) {
    //   diff.upload.push(item.rel);
    // }
  });
  
  // process removes
  dall.forEach(item => {
    
    var saved = diff.remove.some(test => {
      return item.rel.indexOf(test) === 0;
    });
    
    if (saved) {
      return;
    }
    
    var trash = true;
    sall.forEach(test => {
      // if dir we can just remove dir and skip files and child dirs
      if (item.rel === test.rel) {
        trash = false;
        return;
      }
    });
    if (trash) {
      diff.remove.push(item.rel);
    }
  });
  
  console.log(diff)
}

function buildTree (absolute, relative, tree, depth, init = true) {
  
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
      relative = '';
      tree = {dirs: [], files: []};
      depth = 0;
      init = false;
    }
  }
  
  fs.readdirSync(absolute).forEach(item => {
    
    if (conf.ignore.indexOf(item) > -1) {
      // might include paths, not just items
      return;
    }
    
    var abs = path.join(absolute, item);
    var rel = path.join(relative, item);
    
    var stats = fs.statSync(abs);
    
    if (stats.isFile()) {
      tree.files.push({
        abs: abs,
        rel: rel,
        crc: crc(abs),
        depth: depth
      });
    }
    else if (stats.isDirectory()) {
      tree.dirs.push({
        abs: abs,
        rel: rel,
        depth: depth
      });
      buildTree(abs, rel, tree, depth + 1, init);
    }
  });
  
  return tree;
}

function crc (file) {
  // linux only ...
  return exec(`cksum ${file}`).toString().split(' ')[0];
}

function sshTree () {
  var path = 'pubx';
  var tree = exec(`node ../zinc ${path}`).toString();
  // return JSON.parse(tree);
  return tree; // json
}

// function diffTree (root, source, destin) {
//   if (root.constructor !== Array) {
//     // https://stackoverflow.com/questions/767486/how-do-you-check-if-a-variable-is-an-array-in-javascript
//     root = root.split('/'); // test on root length
//   }
// }

function sync (root, diff) { // remote root
  diff.remote = path.resolve(root);
  return JSON.stringify(diff);
}