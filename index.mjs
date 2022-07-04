import { dirname, join } from 'node:path';
import { program, Option } from 'commander';
import iconv from 'iconv-lite'
const { decode } = iconv;
import sx from 'shelljs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const __dirname = dirname(import.meta.url.replace('file:///', ''))
const { rm, cd, echo, exec, mkdir, cp } = sx;

const pwd = process.cwd();

const sxExecAsync = async function(command) {
    return new Promise(resolve=> {  
        options.async = true;
        let child = exec(command, {
            async: true,
            silent: true,
            encoding: 'binary'
        }, resolve);
        child.stdout.on('data', function(data) {
            console.log(decode(data, process.platform == 'win32' ? "gb2312" : 'utf-8'));
        })
        child.stderr.on('data', function(data) {
            console.error(decode(data, process.platform == 'win32' ? "gb2312" : 'utf-8'));
        })
    })
}

program.addOption(
    new Option("--version <version>", "the v8 version")
        .default("")
);
program.addOption(
    new Option("--workpath <workpath>", "the v8 version")
        .default(process.env.HOMEPATH)
);
program.addOption(
    new Option("--debug", "the v8 version")
    .default(false)
);
program.parse(process.argv);

const options = program.opts();

const VERSION = options.version;
const WORKPATH = join(pwd, options.workpath);
const IS_DEBUG = options.debug;

(async function() {
    rm('-rf', WORKPATH);
    mkdir('-p', WORKPATH);
    cd(WORKPATH);
    await sxExecAsync('git clone https://github.com/nodejs/node.git')
    cd('node')
    await sxExecAsync('git fetch origin v' + VERSION)
    await sxExecAsync('git checkout v' + VERSION)

    echo("=====[ Patching Node.js ]=====")
    require('./CRLF2LF.js')(__dirname + '/nodemod.patch');
    await sxExecAsync('git apply --cached --reject ' + __dirname + '/nodemod.patch');
    require('./CRLF2LF.js')(__dirname + '/lib_uv_add_on_watcher_queue_updated.patch');
    await sxExecAsync('git apply --cached --reject ' + __dirname + '/lib_uv_add_on_watcher_queue_updated.patch')
    await sxExecAsync('git checkout -- .')
    mkdir('-p', WORKPATH);
    cp(__dirname + "/zlib.def", WORKPATH + "/deps/zlib/win32/zlib.def")

    echo('=====[ Building Node.js ]=====');
    await sxExecAsync('.\\vcbuild.bat dll openssl-no-asm' + (IS_DEBUG ? ' debug' : ''));

    cd(WORKPATH);
    mkdir('-p', 'puerts-node/nodejs/include')
    mkdir('-p', 'puerts-node/nodejs/deps/uv/include')
    mkdir('-p', 'puerts-node/nodejs/deps/v8/include')

    cp('node/src/node.h', './puerts-node/nodejs/include');
    cp('node/src/node_version.h', './puerts-node/nodejs/include');

    cp('node/deps/uv/include/**/*', './puerts-node/nodejs/deps/uv');
    cp('node/deps/v8/include/**/*', './puerts-node/nodejs/deps/v8');

    mkdir('-p', 'puerts-node/nodejs/Lib/Win64/');

    cp('node/out/Release/libnode.dll', './puerts-node/nodejs/Lib/Win64/');
    cp('node/out/Release/libnode.exp', './puerts-node/nodejs/Lib/Win64/');
    cp('node/out/Release/libnode.lib', './puerts-node/nodejs/Lib/Win64/');
})();