

'use strict';




function Zink (...args) {
  
  // define this.props, this.methods here
  // props set by main
  // this.main(args);
  
  // can we define setter/getter on the this object ???
  // Object.defineProperty('srcConn', this, {
  
  // });
  
  let arity = args.length;
  
  let
    config,
    srcPath,
    srcLogin,
    dstPath,
    dstLogin;
    
  let
    srcType, // local | remote
    dstType;
    
  let isString = function (value) {
    return value.constructor === String;
  };
  
  let isObject = function (value) {
    return value.constructor === Object;
  };
  
  if (arity === 1) {
    [config] = args;
  }
  else if (arity === 2) {
    [srcLogin, dstLogin] = args;
  }
  else if (arity === 3) {
    if (isString(args[0]) && args[0].indexOf('local') !== 0) {
      [srcLogin, dstPath, dstLogin] = args;
    }
    else {
      [srcPath, srcLogin, dstLogin] = args;
    }
  }
  else if (arity === 4) {
    [srcPath, srcLogin, dstPath, dstLogin] = args;
  }
  else if (arity === 0) {
    // we have no login data
    // error out on failure
  }
  else {
    // we have too many args
    // error out on failure
  }
  
  if (config) {
    if (isString(config)) {
      // test and parse path to object
      // error out on failure
    }
    if (isObject(config)) {
      // test and parse object
      // error out on failure
    }
    else {
      // could not parse config
      // error out on failure
    }
  }
  
  if (srcPath) {
    
  }
  
  if (dstPath) {
    
  }
  
  if (isString(srcLogin)) {
    if (srcLogin.indexOf('local') === 0) {
      // set srcType, test srcPath when defined
    }
    else {
      // error out on failure
    }
  }
  else {
    // try to connect via srcLogin
    // set srcConn to conn object
  }
  
  if (isString(dstLogin)) {
    if (dstLogin.indexOf('local') === 0) {
      // set srcType, test srcPath when defined
    }
    else {
      // error out on failure
    }
  }
  else {
    // try to connect via srcLogin
    // set srcConn to conn object
  }
  
  // set this.* after definitions
  
  console.log(config, srcLogin, dstLogin);
  
  
  
  // apply all above setup to main
  // export main as prototype
  // call main with args argument
  let main = (function () {
    
  
      
    
  })();
}

Zink.prototype.main = function (args) {
  
};

Zink.prototype.sync = function (opts) {
  
};

Zink.prototype.diff = function (opts) {
  
};

Zink.prototype.copy = function (opts) {
  
};

Zink.prototype.test = function (opts) {
  
};




var z = new Zink ('one', 'two');


let rules = `

Must provide logins on instantiation

srcLogin = object with
  host: IP|domain|'local*' ||
  string with 'local*'
  
dstLogin = object with
  host: IP|domain|'local*' ||
  string with 'local*'

config = object with
  srcLogin object, as above
  dstLogin object, as above
  
  [optionally]
  srcPath
  dstPath
  
config = string with path to config file
  config.yaml, config.yml, config.json
  with same values as defined
  
Optional paramaters include
  srcPath = string of path to working directory
  dstPath = string of path to working directory

Signatures
var z = new Zink(config);
var z = new Zink('path/to/config.yaml|yml|json');
var z = new Zink(srcLogin, dstLogin);
var z = new Zink(srcPath, srcLogin, dstLogin);
var z = new Zink(srcLogin, dstPath, dstLogin);
var z = new Zink(srcPath, srcLogin, dstPath, dstLogin);

Methods
z.sync(opts); // perform checksum diff sync
z.diff(opts); // perform checksum diff report
z.test(opts); // perform permissions dry run
z.copy(opts); // perform (compressed if remote) copy of entire file or dir

z.srcExec('cmd', cb); // uses ssh2, not conn.sftp
z.dstExec('cmd', cb); // uses ssh2, not conn.sftp

Setters/Getters
z.srcConn; // getter only, returns ssh2 conn object or 'local'
z.dstConn; // getter only, returns ssh2 conn object or 'local'
z.srcPath | srcPath = 'path';
z.dstPath | dstPath = 'path';

Options
nuke:     bool   // remove destination before z.copy (WARNING !!!)
sanitize: bool   // remove detached files and dirs after z.sync (WARNING !!!) // tidy: bool
sudo:     bool   // attempt sudo, only if perms need to be elevated (WARNGING !!!)
report:   bool   // create diff report and return at end of z.sync or z.copy (only, not z.diff) // diff: bool
ignore:   []     // do not include list of file|dir names, paths relative to working dir, absolute paths during z.sync only // omit: []
backup:   'name' // rename existing destination before z.copy only // back: bool

`;
