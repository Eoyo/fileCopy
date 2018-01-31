import { join, basename } from 'path';
import vfs from 'vinyl-fs';
import { renameSync } from 'fs';
import through from 'through2';
import { sync as emptyDir } from 'empty-dir';
import leftPad from 'left-pad';
import chalk from 'chalk';

// << console message shower;
function info(type, message) {
  console.log(`${chalk.green.bold(leftPad(type, 12))}  ${message}`);
}

function error(message) {
  console.error(chalk.red(message));
}

function success(message) {
  console.error(chalk.green(message));
}
// >>

// type = 'typescript'
function copyFile({ type, install }) {

  // 获取模板的位置;
  const cwd = join(__dirname, '../boilerplates', type);

  // 目标位置;
  const dest = process.cwd();

  // 建立的项目目录名字
  const projectName = basename(dest);

  if (!emptyDir(dest)) {
    error('Existing files here, please run init command in an empty folder!');
    process.exit(1);
  }

  console.log(`Creating a working place in ${dest}.`);
  console.log();

  // copy files to dest;
  vfs.src(['**/*', '!node_modules/**/*'], { cwd: cwd, cwdbase: true, dot: true })
    .pipe(LogFileCutCwd(dest, cwd))
    .pipe(vfs.dest(dest))
    .on('end', function () {
      info('rename', 'gitignore -> .gitignore');
      renameSync(join(dest, 'gitignore'), join(dest, '.gitignore'));
      if (install) {
        info('run', 'npm install');
        require('./install')(printSuccess);
      } else {
        printSuccess();
      }
    })
    .resume();

  function printSuccess() {
    success(`
Success! Created ${projectName} at ${dest}.

Inside that directory, you can run several commands:
  * npm start: Starts the development server.
  * npm run build: Bundles the app into dist for production.
  * npm test: Run test.

We suggest that you begin by typing:
  cd ${dest}
  npm start

Happy hacking!`);
  }
}

// 打印复制时的日志; 提供当前的地址以简化输入
function LogFileCutCwd(dest, cwd) {
  return through.obj(function (file, enc, cb) {
    if (!file.stat.isFile()) {
      return cb();
    }
    info('create', file.path.replace(cwd + '/', ''));
    this.push(file);
    cb();
  });
}

export default init;
