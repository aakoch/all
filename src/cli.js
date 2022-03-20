import path from 'path';
import debugFunc from 'debug'
const debug = debugFunc('all:cli')
import chalk from 'chalk';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
import { exists, parseArguments } from '@foo-dog/utils'
import concat from 'concat-stream'
import util from 'util'

import fs from 'fs'
import stream from 'stream'
import indentTransformer from 'indent-transformer';
import WrapLine from '@jaredpalmer/wrapline'
import LexingTransformer from '@foo-dog/lexing-transformer';
import { PostLexingTransformer } from '@foo-dog/post-lexing-transformer'
import { inspect } from '@foo-dog/utils';

import AttrsCliTransformer from '../../attrs/src/cliTransformer.js'
import GeneratorCliTransformer from '../../generator/src/cliTransformer.js'
import { AttrsResolver } from '@foo-dog/attrs'


function printUsage() {
  const help = [''];
  const p = str => help.push(str ?? '')
  const b = str => help.push(chalk.bold(str))
  b("End-to-end tester")
  p('Parses a Pug file and outputs the HTML')
  p()
  b('Usage')
  p(chalk.blue('node ' + path.basename(__filename) + ' [-h] [-f override_filename] [inFile] [outFile]'))
  p('inFile and outFile are both optional and will default to stdin and stdout if omitted.')
  p('You can also use "-" for inFile and outFile for their respective streams.')
  p()
  b('Options')
  p('  --allow-digits-to-start-css-classes=[true|false]')
  p('  -f       = Override the given filename for path correction')
  p('  -h       = Print this message')
  p()

  console.log(help.join('\n'))
}


const options = await parseArguments(process, printUsage);
debug('options=', inspect(options, false, 2));
await run(options);

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
  }
}

const attrsResolver = new AttrsResolver()

function walk(arr) {
  debug('walk: arr=', util.inspect(arr, false, 10))
  if (Array.isArray(arr)) {
    attrsResolver.resolve(arr)
    arr.forEach(element => {
      debug('loop: element=', util.inspect(element, false, 10))
      if (element.hasOwnProperty('children')) {
        debug('loop: element has children=', util.inspect(element.children, false, 10))
        walk(element.children)
      }
    })
  }
  return arr
}

var alreadyParsed = []

async function processFile(options) {
  debug('options=', inspect(options, false, 2));
  let fullFilename;
  try {
    fullFilename = path.resolve(options.in.name);
    const lexingTransformer = new LexingTransformer({ inFile: fullFilename, override: options.override, allowDigitToStartClassName: options.allowDigitToStartClassName ?? false });
    const postLexingTransformer = new PostLexingTransformer()
    const attrsCliTransformer = new AttrsCliTransformer()
    const generatorCliTransformer = new GeneratorCliTransformer(false)
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
      // .pipe(concat({ encoding: 'string' }, body => {
      //   try {
      //     let obj = JSON.parse(body)
      //     debug('walking obj=', obj)
      //     const returnObj = walk(obj) || '<nothing returned>';
      //     debug('returnObj=', returnObj)
      //     return stream.Readable.from(util.inspect(returnObj, false, 55))
      //   } catch (e) {
      //     console.error(e)
      //   }
      // }))
      .pipe(attrsCliTransformer)
      .pipe(generatorCliTransformer)
      .pipe(options.out.createStream());

    stream.finished(fullStream, async (err) => {
      if (err) {
        throw err;
      } else if (lexingTransformer.filesToAlsoParse.length) {
        console.log(chalk.blue(chalk.bold("Files to also parse:")));

        // if (topLevel()) {
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
            // console.log(options)
            await run(options);

            // await run({
            //   _: [
            //     filename,
            //     path.resolve('build' + filename + '.json')
            //   ]
            // });
            alreadyParsed.push(filename)
          }
        }
        // }
        // else {
        //   console.error('Not top level so not parsing these files: ' + lexingTransformer.filesToAlsoParse.join('\n\t'))
        // }
      }
    });
  }
  catch (e) {
    console.error(e);
    throw new Error(`Could not parse ${options.in.name}`, { cause: e }, fullFilename);
  }
}