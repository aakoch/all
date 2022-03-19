import fs, { link, readFileSync } from 'fs'
import path from 'path'
import debugFunc from 'debug'
const debug = debugFunc('all')
import { inspect } from 'util'
import stream from 'stream'
import LexingTransformer from 'lexing-transformer'
import { PostLexingTransformer } from 'post-lexing-transformer'
import concat from 'concat-stream'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
debug("__dirname=" + __dirname)
import indentTransformer from 'indent-transformer';
import WrapLine from '@jaredpalmer/wrapline'
import { exists } from '@foo-dog/utils'
import chalk from 'chalk';
import util from 'util'
import { AttrsResolver } from 'foo-dog-attrs'
const attrsResolver = new AttrsResolver()
import generator from '@aakoch/generator';


function walkLookingForAttributes(arr) {
  debug('walk: arr=', util.inspect(arr, false, 10))
  if (Array.isArray(arr)) {
    attrsResolver.resolve(arr)
    arr.forEach(element => {
      debug('loop: element=', util.inspect(element, false, 10))
      if (element.hasOwnProperty('children')) {
        debug('loop: element has children=', util.inspect(element.children, false, 10))
        walkLookingForAttributes(element.children)
      }
    })
  }
  return arr
}

async function run(options) {
  try {
      await processFile(options);
      debug("Exiting main");
  } catch (e) {
    if (chalk.stderr.supportsColor)
      console.error(chalk.stderr(chalk.red(e.message)) + '\n', e);
    else {
      console.error('*'.repeat(30) + '\n' + e.message);
    }
    throw e
  }
}

async function processFile(options) {

  debug(`piping streams together`);
  debug(`options.in=${inspect(options.in, false, 0)}`);
  let fullFilename;
  var outputObj
  try {
    fullFilename = path.resolve(options.in.name);
    const lexingTransformer = new LexingTransformer({ inFile: fullFilename, override: options.override })
    const postLexingTransformer = new PostLexingTransformer()
    const fullStream = options.in.createStream()
      .pipe(WrapLine('|'))
      .pipe(WrapLine(function (pre, line) {
        // add 'line numbers' to each line
        pre = pre || 0;
        return pre + 1;
      }))
      .pipe(indentTransformer())
      .pipe(lexingTransformer)
      .pipe(postLexingTransformer)
      .pipe(concat({}, (body) => {
        // fs.writeFileSync('build/' + path.basename(options.in.name) + '.json', body, { flag: 'w' });
        debug('body=', body)
        let jsonObj = JSON.parse(body)
        walkLookingForAttributes(jsonObj)
        // walk(jsonObj)
        const out = generator.fromObject(jsonObj)
        // fs.writeFileSync('build/' + path.basename(options.in.name) + ".html", out);
        stream.Readable.from(out).pipe(options.out.createStream())
      }));


    stream.finished(fullStream, async (err) => {
      debug("Entering stream finished");
      if (err) {
        throw err;
      } else if (lexingTransformer.filesToAlsoParse.length) {
        console.log(chalk.blue(chalk.bold("Files to also parse:")));

          for (const filename of lexingTransformer.filesToAlsoParse) {
            const prefix = '  ' + chalk.magenta(filename) + ' -- ';
            if (exists(path.resolve('build' + filename + '.json'))) {
              console.log(prefix + 'skipping');
            }
            else if (alreadyParsed.includes(filename)) {
              console.log(prefix + 'skipping (already parsed)');
            }
            else {
              console.log(prefix + chalk.green('parsing to ' + path.resolve('build' + filename + '.json')));

              const options = await parseArguments(process, printUsage);
              console.log(options)
              await run(options);
              alreadyParsed.push(filename)
            }
          }
      }
    });
  }
  catch (e) {
    console.error(e);
    throw new Error(`Could not parse ${options.in.name}`, { cause: e }, fullFilename);
  }
}


var alreadyParsed = []

export default run