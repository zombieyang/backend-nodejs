cd %HOMEPATH%

md puerts-node\nodejs\include
md puerts-node\nodejs\deps\uv\include
md puerts-node\nodejs\deps\v8\include

md puerts-node\nodejs\Lib\Win64\
copy node\out\Debug\libnode.dll .\puerts-node\nodejs\Lib\Win64\
copy node\out\Debug\libnode.exp .\puerts-node\nodejs\Lib\Win64\
copy node\out\Debug\libnode.lib .\puerts-node\nodejs\Lib\Win64\
copy node\out\Debug\libnode.pdb .\puerts-node\nodejs\Lib\Win64\
