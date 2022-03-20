# All

Combine steps

## Flow
lexing-transformer -> attrs -> generator

## Testing

### Directories

1. Input (the start)
${productRoot}/workspaces/test/in/*.json

1. Expected output (the end)
${productRoot}/workspaces/test/expected/*.html

Input must be processed by lexing-transformer first. The output is placed in ${productRoot}/workspaces/lexing-transformer/build/*.\[json|err\]

Input must be processed by attrs. The output is placed in ${productRoot}/workspaces/attrs/??

Last step is generating the HTML in generator. The output is placed in ${productRoot}/workspaces/generator/build/*.actual.html

**Standardization**

Create standard directory structure so we can more readily pipeline.

- build/in (was test/in)
- build/out

## Some Scripts

```
cd ../test
mkdir -p build/
for f in $(ls /*.); do node ../all/src/cli $f build/$f.json 2> build/$f.parser.err; done
find build/ -size 0c -exec rm {} \;

for f in $(ls /*.); do node ../attrs/src/cli $f build/$f.json 2> build/$f.attrs.err; done

find build/ -size 0c -exec rm {} \;

for f in $(ls build/*.json); do node ../generator/src/cli $f build/$f.html 2> $f.err; done
find build/ -size 0c -exec rm {} \;
rename -d ".json" build/test/*.json.html

/Users/aakoch/projects/new-foo/workspaces/test/build/attrs-data..err



pj lexing-transformer
mkdir -p build/test/
for f in $(ls test/*.); do node src/cli $f build/$f.json 2> build/$f.err; done
find build/test/ -size 0c -exec rm {} \;
mv build/test/*.json ../attrs/test/json/

pj attrs
for f in $(ls test/json/*.json); do node src/cli $f build/$f 2> $f.err; done
find test/json/ -size 0c -exec rm {} \;
mv build/test/json/*.json ../generator/test/json/

pj generator
for f in $(ls test/json/*.json); do node src/cli $f build/$f.html 2> $f.err; done
find build/test/json/ -size 0c -exec rm {} \;
```