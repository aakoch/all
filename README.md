# All

Combine steps

## Flow
pug-lexing-transformer -> foo-dog-attrs -> generator

## Testing

### Directories

1. Input (the start)
${productRoot}/workspaces/test/in/*.json

1. Expected output (the end)
${productRoot}/workspaces/test/expected/*.html

Input must be processed by pug-lexing-transformer first. The output is placed in ${productRoot}/workspaces/pug-lexing-transformer/build/*.\[json|err\]

Input must be processed by foo-dog-attrs. The output is placed in ${productRoot}/workspaces/foo-dog-attrs/??

Last step is generating the HTML in generator. The output is placed in ${productRoot}/workspaces/generator/build/*.actual.html

**Standardization**

Create standard directory structure so we can more readily pipeline.

- test/in
- build/out

## Some Scripts

```
cd ../test
mkdir -p build/pug
for f in $(ls pug/*.pug); do node ../all/src/cli $f build/$f.json 2> build/$f.parser.err; done
find build/pug/ -size 0c -exec rm {} \;

for f in $(ls pug/*.pug); do node ../foo-dog-attrs/src/cli $f build/$f.json 2> build/$f.attrs.err; done

find build/pug/ -size 0c -exec rm {} \;

for f in $(ls build/pug/*.json); do node ../generator/src/cli $f build/$f.html 2> $f.err; done
find build/ -size 0c -exec rm {} \;
rename -d ".json" build/test/*.json.html

/Users/aakoch/projects/new-foo/workspaces/test/build/pug/attrs-data.pug.err



pj pug-lexing-transformer
mkdir -p build/test/pug
for f in $(ls test/pug/*.pug); do node src/cli $f build/$f.json 2> build/$f.err; done
find build/test/pug/ -size 0c -exec rm {} \;
mv build/test/pug/*.json ../foo-dog-attrs/test/json/

pj foo-dog-attrs
for f in $(ls test/json/*.json); do node src/cli $f build/$f 2> $f.err; done
find test/json/ -size 0c -exec rm {} \;
mv build/test/json/*.json ../generator/test/json/

pj generator
for f in $(ls test/json/*.json); do node src/cli $f build/$f.html 2> $f.err; done
find build/test/json/ -size 0c -exec rm {} \;
```