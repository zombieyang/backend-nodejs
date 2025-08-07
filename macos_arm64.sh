[ -z "$GITHUB_WORKSPACE" ] && GITHUB_WORKSPACE="$( cd "$( dirname "$0" )"/.. && pwd )"
WORKSPACE=$GITHUB_WORKSPACE
HOMEPATH=~
VERSION=$1

cd $HOMEPATH
git clone https://github.com/nodejs/node.git

cd node
git fetch origin v$VERSION
git checkout v$VERSION

echo "=====[Patching Node.js]====="
node $WORKSPACE/node-script/do-gitpatch.js -p $WORKSPACE/patchs/lib_uv_add_on_watcher_queue_updated_v$VERSION.patch
node $WORKSPACE/node-script/add_arraybuffer_new_without_stl.js deps/v8
node $WORKSPACE/node-script/make_v8_inspector_export.js

echo "=====[Building Node.js]====="

export CXXFLAGS="-Wno-error=conversion -fpermissive -std=c++17 -Wno-c++20-compat -Wno-deprecated-declarations"
export CFLAGS="-Wno-error=conversion -Wno-deprecated-declarations"
CC_host="clang" CXX_host="clang++" CC_target="clang -arch arm64" CXX_target="clang++ -arch arm64" CC="clang -arch arm64" CXX="clang++ -arch arm64" ./configure --shared --cross-compiling --dest-cpu=arm64
make -j8

mkdir -p ../puerts-node/nodejs/include
mkdir -p ../puerts-node/nodejs/deps/uv/include
mkdir -p ../puerts-node/nodejs/deps/v8/include

cp src/node.h ../puerts-node/nodejs/include
cp src/node_version.h ../puerts-node/nodejs/include
cp -r deps/uv/include ../puerts-node/nodejs/deps/uv
cp -r deps/v8/include ../puerts-node/nodejs/deps/v8

mkdir -p ../puerts-node/nodejs/lib/macOS_arm64/
cp out/Release/libnode.*.dylib ../puerts-node/nodejs/lib/macOS_arm64/
