'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _vinylFs = require('vinyl-fs');

var _vinylFs2 = _interopRequireDefault(_vinylFs);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _through = require('through2');

var _through2 = _interopRequireDefault(_through);

var _emptyDir = require('empty-dir');

var _leftPad = require('left-pad');

var _leftPad2 = _interopRequireDefault(_leftPad);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// << console message shower;
function info(type, message) {
  console.log(_chalk2.default.green.bold((0, _leftPad2.default)(type, 12)) + '  ' + message);
}

function error(message) {
  console.error(_chalk2.default.red(message));
}

function success(message) {
  console.error(_chalk2.default.green(message));
}
// >>

// type = 'typescript'
function copyFile(_ref) {
  var type = _ref.type,
      install = _ref.install;


  console.log(type);
  // 获取模板的位置;
  var cwd = (0, _path.join)(__dirname, '../boilerplates', type);

  // 目标位置;
  var dest = process.cwd();

  // 建立的项目目录名字
  var projectName = (0, _path.basename)(dest);

  if (!(0, _emptyDir.sync)(dest)) {
    error('Existing files here, please run init command in an empty folder!');
    process.exit(1);
  }

  console.log('Creating a working place in ' + dest + '.');
  console.log();

  // copy files to dest;
  _vinylFs2.default.src(['**/*', '!node_modules/**/*'], { cwd: cwd, cwdbase: true, dot: true }).pipe(LogFileCutCwd(dest, cwd)).pipe(_vinylFs2.default.dest(dest)).on('end', function () {
    if (_fs2.default.existsSync((0, _path.join)(dest, 'gitignore'))) {
      _fs2.default.renameSync((0, _path.join)(dest, 'gitignore'), (0, _path.join)(dest, '.gitignore'));
      info('rename', 'gitignore -> .gitignore');
    } else {
      // 不存在的 gitignore,提供默认的.gitignore
      // gitignore
      _fs2.default.writeFileSync((0, _path.join)(dest, '.gitignore'), 'node_modules');
      info('create', '.gitignore');
    }
    if (install) {
      info('run', 'npm install');
      require('./install')(printSuccess);
    } else {
      printSuccess();
    }
  }).resume();

  function printSuccess() {
    success('Success! Created ' + projectName + ' at ' + dest + '.');
  }
}

// 打印复制时的日志; 提供当前的地址以简化输入
function LogFileCutCwd(dest, cwd) {
  return _through2.default.obj(function (file, enc, cb) {
    if (!file.stat.isFile()) {
      return cb();
    }
    info('create', file.path.replace(cwd + '/', ''));
    this.push(file);
    cb();
  });
}

exports.default = copyFile;
module.exports = exports['default'];