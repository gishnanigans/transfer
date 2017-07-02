

const zinc = require('../zinc');

var config = zinc.yaml('sync.yaml');

var src = zinc.set({
  root: config.root.local,
  ignore: config.ignore
});

var dst = zinc.node({
  root: config.root.remote,
  login: config.login,
  ignore: config.ignore
});

var srcTree = zinc.map(src);
var dstTree = zinc.tree(dst);

var diff = zinc.diff(srcTree, dstTree);

var rems = diff.remove.filter(path => {
  return path.abs;
});

zinc.remove(dst, rems);

var rels = diff.upload.filter(path => {
  return path.rel;
});

zinc.copy(src, dst, rels);

zinc.sync(src, dst); // does all that



// const path = require('path');
// // const yaml = require('js-yaml');
// const fs = require('fs');

// const root = '/home/ubuntu';

// const dirs = {
//   'public' : '',
//   'styles' : ''
// };

// var dir = process.argv[2] || false;

// if (dirs.hasOwnProperty(dir)) {
//   console.log('Syncing path:', `${root}/${dir}`);
// }
// else {
//   console.log('Invalid path. Select one...');
//   console.log(Object.keys(dirs).join('\n'));
// }

// [node, self, ...args] = process.argv;

// console.log(node, self, args)