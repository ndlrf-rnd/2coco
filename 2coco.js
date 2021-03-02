/**
 * @module 2coco
 */
const fs = require('fs');
const path = require('path');
const argparse = require('argparse');
const jsonata = require('jsonata');
const glob = require('glob');
const sharp = require('sharp');
const {xml2js} = require('xml-js');

/**
 * @module Constants
 */
const PACKAGE_METADATA_PATH = './package.json'
const PACKAGE_METADATA = fs.readFileSync(PACKAGE_METADATA_PATH)
const VERSION = PACKAGE_METADATA.version
const DEFAULT_IMAGE_EXTENSION = '.tif'
const IMAGE_NAME_ID_SIZE = 8
const REPORT_EVERY = 1000;
const DEFAULT_CONCURRENCY = 1;
const CONVERTORS = {
  tif: 'png',
  tiff: 'png',
  bmp: 'png'
}

/**
 * @example: Sleep down with increasing delays of naps
 *
 * await cpMap(
 *   [1, 2, 4, 8],
 *   (delaySec) => new Promise((resolve) => {
 *     setTimeout(resolve, delaySec * 1000);
 *   })
 * );
 *
 * console.warning('ANCHOR? Chto?! Skolko vremeni?');
 */

/**
 *
 * @param functionsReturningPromise {Array<function>}
 * @param concurrency
 * @returns {Promise<Array>}
 * @private
 */
const _parallelPromises = (
  functionsReturningPromise,
  concurrency,
) => new Promise((resolve, reject) => {
  if ((functionsReturningPromise || []).length === 0) {
    resolve([]);
  }

  const results = new Array(functionsReturningPromise.length);
  let executingCount = 0;
  const waitingFunctions = [...functionsReturningPromise].reverse();
  let enqueue;

  const dequeue = () => {
    executingCount -= 1;
    enqueue();
    if ((waitingFunctions.length === 0) && (executingCount === 0)) {
      resolve(results);
    }
  };
  enqueue = () => {
    // Enqueue to fill concurrency pool
    const limit = Math.min(concurrency || DEFAULT_CONCURRENCY, waitingFunctions.length);
    for (let i = executingCount; i < limit; i += 1) {
      const resultId = functionsReturningPromise.length - waitingFunctions.length;
      results[resultId] = undefined;
      const f = waitingFunctions.pop();
      if (f) {
        executingCount += 1;
        f().then(
          (result) => {
            results[resultId] = result;
            dequeue(resultId, result);
          },
        ).catch(
          (err) => {
            if (process.env.DEBUG) {
              process.stderr.write(`[cpMap]${err}\n`);
            }
            reject(err);
          },
        );
      }
    }
  };
  enqueue();
});

/**
 * Mapper + chainer
 * @param values - array of values
 * @param fn - function returning promises
 * @param concurrency {int} - parallel execution concurrency (default: 1)
 * @returns {Promise<Array>}
 */
const cpMap = async (
  values,
  fn,
  concurrency = DEFAULT_CONCURRENCY,
) => _parallelPromises(
  values.map(
    (value, idx) => (
      (v, i) => () => fn(v, i)
    )(value, idx),
  ),
  concurrency || DEFAULT_CONCURRENCY,
);

const prettyBytes = (num, decimals = 2) => {
  num = parseInt(num, 10);
  if ((typeof num === 'undefined') || (isNaN(num)) || (num === null)) {
    throw new TypeError('Expected a number-like');
  }

  const neg = num < 0;
  const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  if (neg) {
    num = -num;
  }

  if (num < 1) {
    return `${(neg ? '-' : '') + num} B`;
  }

  const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1);
  num = (num / (1000 ** exponent)).toFixed(decimals);
  return `${(neg ? '-' : '') + num} ${units[exponent]}`;
};


/**
 * Pad string on left side
 * @param str
 * @param len
 * @param sym
 * @returns {string}
 */
const padLeft = (str, len, sym = ' ') => [
  `${sym}`.repeat(Math.max(len - `${str}`.length, 0)),
  str,
].join('');

// noinspection JSUnusedLocalSymbols
/**
 * Pad string on right side
 * @param str
 * @param len
 * @param sym
 * @returns {string}
 */
const padRight = (str, len, sym = ' ') => [
  str,
  `${sym}`.repeat(Math.max(len - `${str}`.length, 0)),
].join('');


const transformExpression = jsonata(`
(
    $ID_PREC := {
        'PURL': 1,
        'URN': 2,
        'DOI': 3,
        'URL': 4
    };
    $files := $merge(
        $
          .**[$match($.name, /fileGrp$/)]
          .elements[$match($.name, /file$/)]{
              $.attributes.ID: {
                'id': $.attributes.ID,
                'mediaType': $.attributes.MIMETYPE,
                'url': $.elements[$match($.name, /FLocat$/)].attributes.'xlink:href',
                'type': $.elements[$match($.name, /FLocat$/)].attributes.LOCTYPE
              }
          }
    );
    {
        'id': $sort(
            elements.elements.elements.elements.elements.elements[$match(name, /identifier$/)], 
            function($l, $r) {
                $lookup($ID_PEC, $uppercase($l.attributes.type)) < $lookup($ID_PEC, $uppercase($r.attributes.type))
            }
        )[0].elements.text,
        'dmd': $.**[$match($.name, /dmdSec$/)].{
            $.attributes.ID: $.elements[$match($.name, /mdWrap$/)].{
                'type': [$.attributes.MDTYPE, $.attributes.OTHERMDTYPE],
                'els': $.elements[$match($.name, /xmlData$/)].elements.{
                    $.name:[$.attributes, $.elements]
                }
            }
        },
        'files': $files,
        'physical': $.[
          $sort(
              $
                .**[$match($.name, /structMap$/) and ($.attributes.TYPE = 'PHYSICAL')]
                /* .elements[$match($.name, /div$/) and ($.attributes.TYPE = 'physSequence')] */
                .**
                .elements[$match($.name, /div$/) and ($.attributes.TYPE = 'page')],
              function($l, $r) {
                  $number($l.attributes.ORDER) < $number($r.attributes.ORDER)
              }
            ).{
                'files': $sort(
                  $.elements[$match($.name, /fptr$/)].$lookup($files, $.attributes.FILEID),
                  function($l, $r) {
                      $lookup($ID_PREC, $uppercase($l.type)) < $lookup($ID_PREC, $uppercase($r.type))
                  }
                ).url,
                'id': $.attributes.ID,
                'dmdid': $.attributes.DMDID,
                'order': $.attributes.ORDER.$number($)
            }
          ]
    };
)
`);
//https://cocodataset.org/#format-data
/*
"id": int,
"image_id": int,
 "category_id": int,
 "segmentation": RLE or [polygon],
  "area": float,
  "bbox": [x,y,width,height],
  "iscrowd": 0 or 1,


categories = {
"id": int, "name": str, "supercategory": str,
}
 */
// Polygon stored as [[x1 y1 x2 y2...],[x1 y1 ...],...] (2D list)
const pageToCocoExpression = jsonata(`
(
  $blocks := $
    .elements[$match($.name, /PcGts$/)]
    .elements[$match($.name, /Page$/)]
    .**
    .elements[$match($.name, /(Border|PrintSpace|Word|TextLine|Region)$/)]
    .$merge([$, {'file_name': %.attributes.imageFilename}]);
  {  
    'annotations': $merge(
      $blocks.{
        ($.attributes.id ? $.attributes.id : $.name) : {
          'id': $.attributes.id,
          'file_name': $.file_name,
          'category': $join([$split($.name, ':')[-1], $.attributes.type], ':'),
          'iscrowd': 0,
          'keypoints': [
              $.elements[$match($.name, /Baseline$/)]
              .attributes
              .points
              .$split($, / /)
              .$append($split($, /,/).$number($), [2])
          ],
          'segmentation': [[
            $.elements[$match($.name, /Coords$/)] ? 
              $.elements[$match($.name, /Coords$/)].[
                $.attributes.points.$split($, /[ ,]/).$number($)
              ].*
            : undefined,
            
            $.elements[$match($.name, /Coords$/)] ?
              $.elements[$match($.name, /Coords$/)].[
                $.elements.[$.attributes.x.$number($), $.attributes.y.$number($)].*
              ].*  : undefined
          ]]
          /*
              'text': $.elements[$match($.name, /TextEquiv$/)].**.text,
              'conf': $.attributes.conf,
          */
        }
      }
    ),
    /* Border|PrintSpace */
    'categories': $merge(
      $blocks.{
        $join([$split($.name, ':')[-1], $.attributes.type], ':'): {
          'name': $join([$split($.name, ':')[-1], $.attributes.type], ':'),
          'supercategory': $split($.name, ':')[-1]
          /*
          'keypoints': $match($.name, /TextLine$/) ? ['baseline_left', 'baseline_right'] : [],
          'skeleton': $match($.name, /TextLine$/) ? [[1, 2]] : []
          */
        }
      }
    ), 
    'images': $merge(
      $.elements[$match($.name, /PcGts$/)].**[$match($.name, /Page$/)].[{
        $.attributes.imageFilename: {
          'file_name': $.attributes.imageFilename,
          'width': $.attributes.imageWidth.$number($),
          'height': $.attributes.imageHeight.$number($),
          'imageXResolution': $.attributes.imageXResolution.$replace($, /[.][0]*$/, '.0'),
          'imageYResolution': $.attributes.imageYResolution.$replace($, /[.][0]*$/, '.0')
        }
      }]
    )
  };
)
`);

const processPagePath = async (p) => {
  const pageData = fs.readFileSync(p, 'utf-8');
  const pageJsData = xml2js(pageData, {alwaysChildren: true, compact: false});
  const res = pageToCocoExpression.evaluate(pageJsData);
  const fileObj = res.images[Object.keys(res.images).sort()[0]];
  let file_name = fileObj ? path.join(path.dirname(p), fileObj.file_name) : null
  if (!fs.existsSync(file_name)) {
    const alter = p.replace(
      /\.[a-z]+$/ui,
      (file_name ? path.extname(file_name) : DEFAULT_IMAGE_EXTENSION)
    );
    if (fs.existsSync(alter)) {
      process.stderr.write(` WARNING! Suggesting alternate image: ${fileObj ? `${fileObj.file_name} -> ` : ''}${alter} `);
      file_name = alter
    }
  }

  return {
    categories: res.categories || {},
    annotations: Object.keys(res.annotations || {}).reduce(
      (a, k) => ({
        ...a,
        [`${p}#${k}`]: {
          ...res.annotations[k],
          file_name: file_name
        }
      }),
      {}
    ),
    images: Object.keys(res.images || {}).reduce(
      (ima, imageKey) => ({
        ...ima,
        [file_name]: {
          ...res.images[imageKey],
          file_name: file_name
        }
      }),
      {}
    )
  }

}

const processMetsPath = async (p) => {
  const data = xml2js(fs.readFileSync(p, 'utf-8'), {alwaysChildren: true, compact: false});
  const {physical} = transformExpression.evaluate(data);
  return mergeObjects(
    await cpMap(
      physical,
      async ({files, id}) => {
        const xmlPaths = files.filter(
          elUrl => elUrl.match(/^[^:]+\.xml$/uig)
        );
        const images = files.filter(
          elUrl => elUrl.match(/^[^:]+\.(jpg|jpeg|tiff|tif|jp2|gif|webp|bmp)$/ui)
        );
        const res = mergeObjects(
          await cpMap(
            xmlPaths,
            async elUrl => await processXmlPath(
              path.join(path.dirname(p), elUrl),
              path.dirname(p),
            )
          )
        )

        const file_name = [
          ...images.sort().map(
            imRelPath => path.join(path.dirname(p), imRelPath)
          ),
          ...Object.keys(res.images).sort(),
        ].filter(
          fn => fs.existsSync(fn)
        )[0];
        return {
          categories: res.categories,
          images: {
            [file_name]: {
              ...res.images[Object.keys(res.images).sort()[0]],
              file_name
            },
          },
          annotations: Object.keys(res.annotations).sort().reduce(
            (accc, ak) => ({
              ...accc,
              [`${p}#${id}#${ak}`]: {
                ...res.annotations[ak],
                id: `${id}#${ak}`,
                file_name,
              }
            }),
            {},
          )
        }
      }
    )
  )
}

const processXmlPath = async (p, parentPath) => {
  const t1 = (new Date()).getTime();

  const fileText = fs.readFileSync(p, 'utf-8');
  let res = {}
  let format = 'unknown'
  if (fileText.match(/PcGts/u)) {
    format = 'Page.xml'
    res = await processPagePath(p, parentPath)
  } else if (fileText.match(/www\.loc\.gov\/METS/ig)) {
    format = 'METS'

    res = await processMetsPath(p, parentPath);
  } else {
    process.stderr.write(` Warning: Unknown format of file: ${p}, ignoring`)
  }
  const t2 = (new Date()).getTime();

  process.stderr.write(
    `${
      [
        ` ${format}`,
        ...Object.keys(res).sort().reverse().map(
          k => padLeft(`${Object.keys(res[k]).length} ${k.substr(0, 2)}`, 6)
        ),
        p,
        padLeft(` ${prettyBytes(fs.statSync(p).size, 1)}`, 13),
        padLeft(` ${Math.floor(t2 - t1)} ms`, 13)
      ].join(' ')
    }\n`
  );
  return res;
}

const makeCoco = (input) => {
  if (Array.isArray(input)) {
    process.stderr.write(`Merging input...`);
    input = mergeObjects(input)
    process.stderr.write(` done\n`)

  }
  const categoriesCount = Object.keys(input.categories).length
  process.stderr.write(`Merging ${categoriesCount}  categories...`)
  const categories = Object.keys(input.categories).sort().reduce(
    (a, o, id) => ({
      ...a,
      [o]: {
        ...input.categories[o],
        id: id + 1,
        keypoints: ['baseline_left', 'baseline_right'],
        skeleton: [[1, 2]]
      }
    }),
    {}
  )
  process.stderr.write(` done\n`)
  const imagesCount = Object.keys(input.images).length

  process.stderr.write(`Merging ${imagesCount} images...`)
  const notFound = {}
  const images = Object.keys(input.images).sort().reduce(
    (a, k, id) => {
      if (((id + 1) % REPORT_EVERY) === 0) {
        process.stderr.write(`[${padLeft(id + 1, Math.ceil(Math.log10(imagesCount)))}/${imagesCount}]\n`)
      }

      const fileName = input.images[k].file_name
      if (fs.existsSync(fileName)) {
        a[fileName] = {
          ...input.images[k],
          id: id + 1
        }
        return a;
      } else {
        notFound[fileName] = notFound[fileName] || []
        return a;
      }
    },
    {}
  )
  process.stderr.write(` done\n`)

  const annCount = Object.keys(input.annotations).length
  process.stderr.write(`Merging ${annCount} annotations...\n`)

  const annotations = Object.keys(input.annotations).sort().reduce(
    (a, annotationId, idx) => {
      const annotation = input.annotations[annotationId];
      const imageObj = images[annotation.file_name];
      if (((idx + 1) % REPORT_EVERY) === 0) {
        process.stderr.write(`[${padLeft(idx + 1, Math.ceil(Math.log10(annCount)))}/${annCount}]\n`)
      }
      if (imageObj) {
        a[annotationId] = {
          id: idx + 1,
          category_id: categories[annotation.category].id,
          image_id: imageObj.id,
          iscrowd: annotation.iscrowd,
          segmentation: annotation.segmentation.map(seg => seg.map(n => Math.round(n))),
          ...(
            annotation.keypoints && (annotation.keypoints.length > 0)
              ? {keypoints: annotation.keypoints,}
              : {}
          ),
        }
      } else {
        notFound[annotation.file_name] = notFound[annotation.file_name] || []
        notFound[annotation.file_name].push(annotationId)
      }
      return a;
    },
    {}
  )
  if (Object.keys(notFound).length > 0) {
    process.stderr.write(`Missing ${Object.keys(notFound).length} image files:\n`)
    Object.keys(notFound).sort().map(fk => {
      process.stderr.write(`  - ${fk}, ${notFound[fk].length} dependant annotations excluded\n`)
    });
  } else {
    process.stderr.write(`All image files found\n`)
  }

  const resultObj = {
    categories,
    images,
    annotations,
  }
  return Object.keys(resultObj).reduce(
    (a, k) => ({
      ...a,
      [k]: Object.keys(resultObj[k]).sort().map(
        kk => resultObj[k][kk]
      ).sort((a, b) => a.id - b.id)
    }),
    {},
  )
}


const parseArgs = (args) => {
  const parser = new argparse.ArgumentParser({
    // version: '0.0.1',
    description: 'cocodu',
    add_help: true,
  });

  parser.add_argument(
    '-v', '--version',
    {
      action: 'version',
      version: VERSION
    }
  )

  parser.add_argument(
    '-f', '--force', '--overwrite',
    {
      help: 'force re-create existing files',
      action: ['store_true'],
    },
  );

  parser.add_argument(
    '-o', '--output',
    {
      help: 'output path',
    },
  );

  parser.add_argument(
    'input',
    {
      help: 'input .pdf file path',
      type: String,
      nargs: '+'
    },
  );

  parser.add_argument(
    '--no-images', '-I',
    {
      help: 'don\'t export resource images',
      action: ['store_true'],
    },
  );

  parser.add_argument(
    '--no-metadata', '-M',
    {
      help: 'don\' create metadata JSON',
      action: ['store_true']
    },
  );

  parser.add_argument(
    '--jobs', '--threads', '-j',
    {
      help: 'jobs count',
      default: 8,
      type: 'int',
    },
  );

  return parser.parse_args(args);
};

const mergeObjects = (objects) => objects.reduce(
  (a, o) => Object.keys(o).reduce(
    (aa, kk) => ({
      ...aa,
      [kk]: {
        ...(aa[kk] || {}),
        ...o[kk]
      }
    }),
    a
  ),
  {}
)

const run = async (conf) => {
  const {noImages, jobs, noMetadata, input, output, force} = conf
  sharp.concurrency(jobs)
  const jsonPath = path.join(output, 'train.json')
  const imagesDir = path.join(output, 'images')
  if (!fs.existsSync(output)) {
    fs.mkdirSync(output)
  }
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir)
  }

  const parsed = await cpMap(
    input,
    async (inputGlob) => {
      process.stderr.write(`Processing: ${inputGlob} -> ${jsonPath}\n`);
      const inputFiles = glob.sync(inputGlob).sort()
      return mergeObjects(
        await cpMap(
          inputFiles,
          async (p, idx) => {
            process.stderr.write(`[${padLeft(idx + 1, Math.ceil(Math.log10(inputFiles.length)))}/${inputFiles.length}]`)
            return await processXmlPath(p, path.dirname(p));
          },
        )
      )
    },
  )
  process.stderr.write(`Making COCO file...\n`);

  const result = makeCoco(parsed, conf)
  result.images = (
    await cpMap(
      result.images,
      async (im, idx) => {
        const fileId = padLeft(idx, IMAGE_NAME_ID_SIZE, 0)

        const t1 = (new Date()).getTime();
        const ext = path.extname(im.file_name || '').substr(1);
        let outputPath = path.join(imagesDir, `${fileId}-${path.basename(im.file_name)}`);
        process.stderr.write(
          `[${
            padLeft(idx + 1, Math.ceil(Math.log10(result.images.length)))
          }/${
            result.images.length
          }] ${
            im.file_name
          }`,
        )
        if (fs.existsSync(im.file_name)) {
          if (noImages) {
            process.stderr.write(` -[SKIP]-X due --no-images`);
          } else {
            const image = sharp(im.file_name);
            const {format, space, channels, width, height} = await image.metadata();
            process.stderr.write(
              [
                padLeft(` ${format} ${space}:${channels}ch`, 13),
                padLeft(` ${width} X ${height} px`, 13)
              ].join(' ')
            )
            let convert = false
            if (fs.existsSync(outputPath)) {
              if (force) {
                fs.unlinkSync(outputPath)
                convert = true;
              }
            } else {
              convert = true;
            }
            if (convert) {
              if (CONVERTORS[ext]) {
                outputPath = outputPath.replace(/\.[^.\/]+$/u, `.${CONVERTORS[ext]}`)
                process.stderr.write(` -[CONVERT]->`)
                await image.toFormat(CONVERTORS[ext], channels === 1 ? {palette: true} : {}).toFile(outputPath)
              } else {
                process.stderr.write(` --[COPY]-->`)
                fs.copyFileSync(im.file_name, outputPath)
              }
            } else {
              process.stderr.write(` -[EXISTS]-X`)
            }
            process.stderr.write(` ${path.relative(output, outputPath)}`)

            const srcSize = fs.statSync(im.file_name).size
            if (!fs.existsSync(outputPath)) {
              process.stderr.write(` ERROR: failed to convert\n`)
              return null;
            }
            const dstSize = fs.statSync(outputPath).size
            im = {
              ...im,
              width,
              height,
              file_name: path.relative(output, outputPath)
            };
            process.stderr.write(` ${
              padLeft(prettyBytes(srcSize, 1), 13)
            } - ${
              padLeft(((dstSize / srcSize) * 100).toFixed(1), 6)
            }% -> ${
              padLeft(prettyBytes(dstSize, 1), 13)
            }`)

          }
          const t2 = (new Date()).getTime();
          process.stderr.write(` done ${padLeft(` ${Math.floor(t2 - t1)} ms`, 13)}\n`);
          return im;
        } else {
          process.stderr.write(` file not found\n`);
          return null;
        }
      }
    )
  ).filter(v => !!v)
  if (!noMetadata) {
    process.stderr.write(`Serializing metadata to JSON and saving to:\n${jsonPath}\n`);

    const resultJson = JSON.stringify(result, null, 2);
    fs.writeFileSync(jsonPath, resultJson, 'utf-8')

    const jsonSize = fs.statSync(jsonPath).size;
    process.stderr.write(`Done, ${prettyBytes(jsonSize)} (${jsonSize}) saved\n`);
  }

  process.stderr.write(
    [
      `Annotations: ${result.annotations.length}`,
      `Images: ${result.images.length}`,
      `Categories: ${result.categories.length}`
    ].map(
      l => `${l}\n`
    ).join('')
  )
  return `Done`;
}

const conf = parseArgs(process.argv.slice(2));
process.stderr.write(`${JSON.stringify(conf, null, 2)}\n`)

run(conf).catch(
  err => {
    process.stderr.write(`\n\nERROR:${err.message}\n${err.stack}\n`)
    process.exit(-1)
  }
).then(
  (message) => {
    process.stderr.write(message + '\n');
    process.exit(0)
  }
)
