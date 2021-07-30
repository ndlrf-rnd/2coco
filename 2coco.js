// noinspection CssInvalidPropertyValue

/**
 * @module 2coco
 */

const fs = require('fs');
const path = require('path');
const cluster = require('cluster');

const mkdirp = require('mkdirp');
const glob = require('glob');
const sharp = require('sharp');
const compact = require('lodash.compact');
const sortBy = require('lodash.sortby');
const uniq = require('lodash.uniq');
const clone = require('lodash.clonedeep');
const { COLORS } = require('./colors');
const { CATEGORIES } = require('./categories');
const { CATEGORIES_MAPPING } = require('./categories');
const { CATEGORY_PRINT_SPACE } = require('./categories');
const { CATEGORY_TEXT_LINE } = require('./categories');
const { xml2js } = require('xml-js');
const { Canvas } = require('canvas');

const {
  bbox2seg,
  forceArray,
  seg2bbox,
  prettyBytes,
  padLeft,
  mergeObjects,
  hex2rgba,
} = require('./utils');
const { getFileHash } = require('./file-hash');
const { parseArgs } = require('./cli');
const { jsonataRunner } = require('./jsonata');
const { cpMap } = require('./promise.js');
const { initWorker, executeParallel } = require('./workers');

/**
 * @const
 */
// const TEMP_DIR_PATH = path.resolve('./.cache');
const OPENSEADRAGON_BUILD_DIR = path.join(__dirname, 'node_modules', 'openseadragon', 'build');
const DZI_DEFAULT_TILE_SIZE = 512;
const DEFAULT_IMAGE_EXTENSION = '.png';
const DEFAULT_DPI = 300;
const REPORT_EVERY = 1000;
``;
const METS_JSONATA_PATH = path.join(__dirname, 'mappings/mets.jsonata');
const PAGE_XML_TO_COCO_JSONATA_PATH = path.join(__dirname, 'mappings/page-xml-to-coco.jsonata');
const ALTO_TO_COCO_JSONATA_PATH = path.join(__dirname, 'mappings/alto-to-coco.jsonata');

const LOG_DIR = path.join(__dirname, 'logs');
const DEFAULT_SHARP_PARAMS = { limitInputPixels: false };
const DEFAULT_OPACITY = 0.333;

mkdirp.sync(LOG_DIR);

const LOG_PATH = path.join(
  LOG_DIR,
  ([
    `2coco`,
    Math.floor((new Date()).getTime()),
    cluster.isWorker ? 'worker' : 'master',
    `${process.pid}.log`,
  ]).join('-'),
);

const log = (message) => {
  process.stderr.write(message);
  fs.appendFileSync(LOG_PATH, message.replace(/([\n\r]+)/uig, `\$1[${cluster.isWorker ? 'worker' : 'master'}:${process.pid}] `), 'utf-8');
};

const parseMetsExpression = jsonataRunner(fs.readFileSync(METS_JSONATA_PATH, 'utf-8'));
const pageToCocoExpression = jsonataRunner(fs.readFileSync(PAGE_XML_TO_COCO_JSONATA_PATH, 'utf-8'));
const altoToCocoExpression = jsonataRunner(fs.readFileSync(ALTO_TO_COCO_JSONATA_PATH, 'utf-8'));

const processImages = async (images, ctx, workerId) => {
  const { colorToMaskId } = ctx;
  const processImage = async (im, idx) => {
    log(
      `\n[WORKER:${workerId}:${padLeft(idx + 1, Math.ceil(Math.log10(images.length)), '0')}/${images.length}] ${im.file_name}`,
    );
    const t1 = (new Date()).getTime();

    // const categoriesCount = (Array.isArray(ctx.categories) ? ctx.categories : Object.keys(ctx.categories || {})).length
    const imgAnnotations = (Array.isArray(ctx.annotations) ? ctx.annotations : Object.values(ctx.annotations || {})).filter(
      ({ image_id }) => image_id === im.id,
    );
    if (imgAnnotations.length === 0) {
      return null;
    }

    // const ext = path.extname(im.file_name || '').substr(1);
    const extension = ctx.output_format ? `.${ctx.output_format.toLocaleLowerCase()}` : DEFAULT_IMAGE_EXTENSION;
    const baseName = path.basename(im.file_name, path.extname(im.file_name));
    const outputFileName = `${baseName}${extension}`;
    let outputFilePath = path.join(ctx.imagesDir, outputFileName);

    if (fs.existsSync(im.file_name)) {
      const image = sharp(im.file_name, DEFAULT_SHARP_PARAMS);
      const { density, format, space, channels, width, height } = await image.metadata();
      if ((!width) || (!height) || (!fs.existsSync(im.file_name))) {
        return null;
      }
      // TIFF have much lower chances to contain
      // processing host screen DPI in metadata defined accidentally
      //  || (format === 'tiff')
      const srcDensity = density && (density > 72) && (density <= 1200)
        ? density
        : ctx.default_dpi || DEFAULT_DPI;

      const densityRatio = ctx.output_max_dpi / srcDensity;
      if (densityRatio < 1.0) {
        im.width = Math.ceil(width * densityRatio);
        im.height = Math.ceil(height * densityRatio);
      } else {
        im.width = width;
        im.height = height;
      }
      if (ctx.no_images) {
        log(` -[SKIP]-X due --no-images`);
      } else {
        let convert = true;
        if (fs.existsSync(outputFilePath)) {
          if (ctx.force) {
            fs.unlinkSync(outputFilePath);
          } else {
            convert = false;
          }
        }
        if (convert) {
          await sharp(im.file_name, DEFAULT_SHARP_PARAMS)
            .resize(im.width, im.height)
            .toFile(outputFilePath);
          if (!fs.existsSync(outputFilePath)) {
            log(` ERROR: failed to convert\n`);
            return null;
          }
        }

        //
        // if (!ctx.no_dzi) {
        //   await sharp(im.file_name)
        //     .resize(im.width, im.height)
        //     .tile({
        //       size: DZI_DEFAULT_TILE_SIZE,
        //       overlap: 0,
        //       angle: 0,
        //       container: 'zip', // container, with value fs (filesystem) or zip (compressed file).
        //       layout: 'dz',
        //       center: false,
        //       skipBlanks: -1,
        //     })
        //     .toFile(outputPath + '.dz');
        // }

        const srcSize = fs.statSync(im.file_name).size;
        const dstSize = fs.statSync(outputFilePath).size;
        const inputPath = im.file_name;
        im.file_name = path.relative(ctx.output, outputFilePath);

        const maskOutputPath = path.join(
          ctx.masksDir,
          im.file_name
            .split('/')
            .slice(-1)[0]
            .replace(/\.([^.\/\\]+)$/u, `_GT.png`),
        );
        mkdirp.sync(path.dirname(maskOutputPath));

        const textCategoryId = ctx.annotations.filter(({ name }) => name === CATEGORY_TEXT_LINE).id;
        const printSpaceCategoryId = ctx.annotations.filter(({ name }) => name === CATEGORY_PRINT_SPACE).id;
        // const textCategoryId = ctx.annotations.filter(({name}) => name === CATEGORY_PRINT_SPACE).id

        // const textLineAnnotations = imgAnnotations.filter(({category_id}) => category_id === textCategoryId);

        let annotations = imgAnnotations.filter(
          ({ category_id }) => [
            textCategoryId,
            printSpaceCategoryId,
          ].indexOf(category_id) === -1,
        ).map(
          (ann) => {
            const rescaleX = ann.width ? im.width / ann.width : 1;
            const rescaleY = ann.height ? im.height / ann.height : 1;
            const rescale = Math.min(rescaleX, rescaleY);
            ann.segmentation = (
              Array.isArray(ann.segmentation[0])
                ? ann.segmentation
                : [ann.segmentation]
            ).map(
              poly => poly.map(v => Math.round(v * rescale)),
            );
            if (ann.keypoints) {
              ann.keypoints = ann.keypoints.map(
                (v, idx) => (idx % 3 === 2) ? v : v * rescale,
              );
            }
            ann.bbox = (ann.bbox && (ann.bbox.length === 4) ? ann.bbox : seg2bbox(ann.segmentation)).map(
              v => Math.round(v * rescale),
            );
            ann.segmentation = ann.segmentation || bbox2seg(ann.bbox);
            ann.area = ann.bbox[2] * ann.bbox[3];
            return ann;
          },
        );

        const canvasBlock = new Canvas(im.width, im.height);
        const canvasBlockCtx = canvasBlock.getContext('2d', { alpha: true, pixelFormat: 'RGBA32' });
        canvasBlockCtx.antialias = 'none';
        canvasBlockCtx.lineJoin = 'miter';
        canvasBlockCtx.lineWidth = ctx.lines_width;
        canvasBlockCtx.strokeStyle = 'transparent';

        const binMaskCanvases = [];
        const binMaskCtxes = [];
        for (let i = 0; i < Object.keys(colorToMaskId).length; i += 1) {
          const bmc = new Canvas(im.width, im.height);
          binMaskCanvases.push(bmc);
          const bmctx = bmc.getContext('2d', { alpha: false });
          bmctx.antialias = 'none';
          bmctx.lineJoin = 'miter';
          bmctx.strokeStyle = COLORS.white;
          bmctx.lineWidth = ctx.lines_width;
          binMaskCtxes.push(bmctx);

        }
        // console.error('binMaskCtxes', binMaskCtxes);
        sortBy(annotations, ['category_id', 'id']).forEach(
          (ann) => {
            const annCat = Object.values(CATEGORIES).filter(
              ({ id }) => id === ann.category_id,
            )[0] || {}; // TODO: Rly need object default here?!

            ann.segmentation.forEach(
              (seg) => {
                const allSegEdges = [];
                const vSegEdges = [];
                const hSegEdges = [];

                for (let i = 0; i < seg.length; i += 2) {
                  const x1 = i < 2 ? seg[seg.length - 2] : seg[i - 2];
                  const y1 = i < 2 ? seg[seg.length - 1] : seg[i - 1];
                  const x2 = seg[i];
                  const y2 = seg[i + 1];

                  const edge = [[x1, y1], [x2, y2]];
                  allSegEdges.push(edge);
                  if (Math.abs(x1 - x2) >= Math.abs(y1 - y2)) {
                    hSegEdges.push(edge);
                  } else {
                    vSegEdges.push(edge);
                  }
                }

                if (!ctx.no_fill) {
                  const binMaskCtx = binMaskCtxes[colorToMaskId[annCat.color]];
                  if (binMaskCtx) {
                    binMaskCtx.fillStyle = COLORS.white;
                    binMaskCtx.beginPath();
                  }
                  canvasBlockCtx.fillStyle = hex2rgba(annCat.color, DEFAULT_OPACITY);
                  canvasBlockCtx.beginPath();

                  for (let i = 0; i < allSegEdges.length; i += 1) {
                    const [[x1, y1], [x2, y2]] = allSegEdges[i];
                    if ((i === 0) || (x1 !== allSegEdges[i - 1][1][0]) || (y1 !== allSegEdges[i - 1][1][1])) {
                      if (binMaskCtx) {
                        binMaskCtx.moveTo(x1, y1);
                      }
                      canvasBlockCtx.moveTo(x1, y1);
                    }
                    if (binMaskCtx) {
                      binMaskCtx.lineTo(x2, y2);
                    }
                    canvasBlockCtx.lineTo(x2, y2);
                  }
                  if (binMaskCtx) {
                    binMaskCtx.closePath();
                    binMaskCtx.fill();
                  }

                  canvasBlockCtx.closePath();
                  canvasBlockCtx.fill();
                }
                // Edges
                const bordersEdges = [];
                if (!ctx.no_borderss) {

                  if (annCat.border_color) {
                    bordersEdges.push([allSegEdges, annCat.border_color]);
                  }
                  if (annCat.border_v_color) {
                    bordersEdges.push([vSegEdges, annCat.border_v_color]);
                  }
                  if (annCat.border_h_color) {
                    bordersEdges.push([hSegEdges, annCat.border_h_color]);
                  }
                  bordersEdges.forEach(([edges, color]) => {
                    const binMaskCtx = binMaskCtxes[colorToMaskId[color]];
                    if (binMaskCtx) {
                      binMaskCtx.strokeStyle = COLORS.white;
                      binMaskCtx.beginPath();
                    }
                    canvasBlockCtx.strokeStyle = hex2rgba(color, DEFAULT_OPACITY);
                    canvasBlockCtx.beginPath();
                    for (let i = 0; i < edges.length; i += 1) {
                      const [[x1, y1], [x2, y2]] = edges[i];
                      if ((i === 0) || (x1 !== edges[i - 1][1][0]) || (y1 !== edges[i - 1][1][1])) {
                        if (binMaskCtx) {
                          binMaskCtx.moveTo(x1, y1);
                        }
                        canvasBlockCtx.moveTo(x1, y1);
                      }
                      if (binMaskCtx) {
                        binMaskCtx.lineTo(x2, y2);
                      }
                      canvasBlockCtx.lineTo(x2, y2);
                    }
                    // canvasBlockCtx.closePath();
                    if (binMaskCtx) {
                      binMaskCtx.stroke();
                    }
                    canvasBlockCtx.stroke();
                  });
                }
              },
            );
            if (
              (!ctx.no_skeleton)
              && ann.keypoints
              && (ann.keypoints.length > 0)
              && (!ctx.ignore_key_points)
            ) {
              /*
                keypoints: ['baseline_left', 'baseline_right'],
                skeleton: [[1, 2]],
              */
              const filteredKps = ann.keypoints.reduce(
                (agg, kp, idx) => {
                  // Starting new
                  if (idx % 3 === 0) {
                    agg.push([]);
                  }
                  if (idx % 3 === 2) {
                    if (kp === 0) {
                      // Nullify invisible and unlabeled KP
                      agg[agg.length - 1] = null;
                    }
                  } else {
                    agg[agg.length - 1].push(kp);
                  }
                  return agg;
                },
                [],
              );
              let edges = [];
              if (annCat.skeleton && annCat.skeleton.length > 0) {
                edges = annCat.skeleton.reduce((acc, [fromId, toId]) => {
                  const from = filteredKps[fromId + 1];
                  const to = filteredKps[toId + 1];
                  if ((from !== null) && (to !== null)) {
                    return [...acc, [from, to]];
                  } else {
                    return acc;
                  }
                }, []);
              } else {
                const visibleKps = compact(filteredKps);
                for (let i = 1; i < visibleKps.length; i += 1) {
                  edges.push([visibleKps[i - 1], visibleKps[i]]);
                }
              }
              // Draw visible edges
              const binMaskCtx = binMaskCtxes[colorToMaskId[annCat.skeleton_color]];
              if (binMaskCtx) {
                binMaskCtx.fillStyle = 'transparent';
                binMaskCtx.strokeStyle = COLORS.white;
                binMaskCtx.lineJoin = 'miter';
                binMaskCtx.lineWidth = ctx.lines_width;
                binMaskCtx.beginPath();
              }

              canvasBlockCtx.fillStyle = 'transparent';
              canvasBlockCtx.strokeStyle = hex2rgba(annCat.skeleton_color, DEFAULT_OPACITY);
              canvasBlockCtx.lineJoin = 'miter';
              canvasBlockCtx.lineWidth = ctx.lines_width;
              canvasBlockCtx.beginPath();

              edges.forEach(
                ([[x1, y1], [x2, y2]]) => {
                  if (binMaskCtx) {
                    binMaskCtx.moveTo(x1, y1);
                  }
                  canvasBlockCtx.moveTo(x1, y1);

                  if (binMaskCtx) {
                    binMaskCtx.lineTo(x2, y2);
                  }
                  canvasBlockCtx.lineTo(x2, y2);
                },
              );
              if (binMaskCtx) {
                binMaskCtx.stroke();
              }
              canvasBlockCtx.stroke();

              // Draw vertical
              // FIXME: Remove this PAGE.XML targeted hardcoded shore
              // canvasBlockCtx.strokeStyle = annCat.color || COLORS.white;
              // ann.segmentation.forEach(
              //   (seg) => {
              //     canvasBlockCtx.beginPath();
              //     let prevX = null;
              //     let prevY = null;
              //     for (let i = 0; i < Math.floor(seg.length / 2); i += 1) {
              //
              //       const x = seg[i * 2];
              //       const y = seg[i * 2 + 1];
              //       if (i === 0) {
              //         prevX = seg[seg.length - 2];
              //         prevY = seg[seg.length - 1];
              //         canvasBlockCtx.moveTo(prevX, prevY);
              //
              //       }
              //       // Test is line somehow representing text line letter size
              //       const isLineVertical = Math.abs(x - prevX) <= Math.abs(y - prevY);
              //       const isBboxVertical = ann.bbox[2] <= ann.bbox[3];
              //       if (isBboxVertical ? !isLineVertical : isLineVertical) {
              //         canvasBlockCtx.lineTo(x, y);
              //       } else {
              //         canvasBlockCtx.moveTo(x, y);
              //       }
              //       prevX = x;
              //       prevY = y;
              //     }
              //     canvasBlockCtx.stroke();
              //   }
              // )
            }
          },
        );
        const pngParams = { resolveWithObject: true, force: true };
        if (!ctx.no_gt) {
          await cpMap(
            binMaskCanvases,
            async (binMaskCanvas, idx) => {
              const fn = maskOutputPath.replace(/_GT(\.[^.]+)$/u, `_GT${idx}$1`);
              await sharp(binMaskCanvas.toBuffer(), DEFAULT_SHARP_PARAMS).png(pngParams).toFile(fn);
            },
          );
          if (!ctx.no_gt_bg) {
            await sharp(canvasBlock.toBuffer(), DEFAULT_SHARP_PARAMS).threshold(254).negate().png(pngParams).toFile(
              maskOutputPath.replace(/_GT(\.[^.]+)$/u, `_GT${binMaskCanvases.length}$1`),
            );
          }
        }
        if (!ctx.no_masks) {
          await sharp(canvasBlock.toBuffer(), DEFAULT_SHARP_PARAMS).png(pngParams).toFile(maskOutputPath);
        }

        const t2 = (new Date()).getTime();
        log(
          `\n[WORKER:${workerId}:${
            padLeft(idx + 1, Math.ceil(Math.log10(images.length)), '0')
          }/${
            images.length
          }] ${
            format
          } ${
            space
          }:${
            channels
          }ch:${
            srcDensity
          } DPI (orig ${
            density
          } DPI) ${
            width
          } X ${
            height
          } px ${
            inputPath
          } ${
            prettyBytes(srcSize, 1)
          } --> ${
            path.relative(ctx.output, outputFilePath)
          } ${
            // FIXME: update DPI for the generated mask files metadata
            ctx.output_max_dpi
          }DPI ${
            // FIXME: display proper dimensions in all cases
            im.width
          } X ${
            im.height
          } px ${
            prettyBytes(dstSize, 1)
          } (${
            Math.ceil((dstSize / srcSize) * 100)
          }) done in ${
            Math.floor(t2 - t1)
          } ms`,
        );
        return {
          ...im,
          file_name: outputFilePath,
        };
      }
    }
  };

  return clone(
    (
      await cpMap(images, processImage)
    ).filter(v => !!v),
  );
};

const processPagePath = async (p, jsonataExpression) => {
  const pageData = fs.readFileSync(p, 'utf-8');
  const pageJsData = xml2js(pageData, { alwaysChildren: true, compact: false });
  const res = jsonataExpression(pageJsData);
  const fileObj = Array.isArray(res.images)
    ? res.images.sort((a, b) => a.file_name < b.file_name)[0]
    : res.images[Object.keys(res.images).sort()[0]];
  let file_name = fileObj && fileObj.file_name ? path.join(path.dirname(p), fileObj.file_name) : null;
  if (!fs.existsSync(file_name)) {
    const alter = p.replace(
      /\.[a-z]+$/ui,
      (file_name ? path.extname(file_name) : DEFAULT_IMAGE_EXTENSION),
    );
    if (fs.existsSync(alter)) {
      log(` WARNING! Suggesting alternate image: ${fileObj ? `${fileObj.file_name} -> ` : ''}${alter} `);
      file_name = alter;
    }
  }
  const annotations = Object.keys(res.annotations || {}).reduce(
    (a, k) => ({
      ...a,
      [`${p}#${k}`]: {
        ...res.annotations[k],
        file_name: file_name,
        ...(res.width ? { width: res.width } : {}),
        ...(res.height ? { height: res.height } : {}),
      },
    }),
    {},
  );

  const images = (Array.isArray(res.images || []) ? (res.images || []) : Object.values(res.images || {})).reduce(
    (ima, imageKey) => ({
      ...ima,
      [file_name]: {
        ...res.images[imageKey],
        file_name,
      },
    }),
    {},
  );
  const categories = res.categories || {};
  return {
    categories,
    annotations,
    images,
  };

};

const processMetsPath = async (p, { cacheDirPath, categories }) => {
  const data = xml2js(fs.readFileSync(p, 'utf-8'), { alwaysChildren: true, compact: false });
  const transformed = parseMetsExpression(data);
  return mergeObjects(
    await cpMap(
      transformed.physical,
      async ({ id, files }) => {
        files = (Array.isArray(files || []) ? (files || []) : Object.values(files));
        const xmlPaths = files.filter(
          ({ file_name }) => file_name.match(/\.xml$/uig),
        ).map(({ file_name }) => file_name);
        const imagePaths = files.filter(
          ({ file_name }) => file_name.match(/^[^:]+\.(jpg|jpeg|tiff|tif|jp2|gif|webp|bmp)$/ui),
        ).map(({ file_name }) => file_name);
        let res = await processXmlPath(
          xmlPaths.map(elUrl => path.join(path.dirname(p), elUrl)),
          {
            categories,
            parentPath: path.dirname(p),
            cacheDirPath,
          },
        );
        res = mergeObjects(res);
        const file_name = [
          ...imagePaths.sort().map(
            imRelPath => path.join(path.dirname(p), imRelPath),
          ),
          ...(Object.keys(res.images || [])).sort(
            (a, b) => (a ? a.file_name : '') - (b ? b.file_name : ''),
          ),
        ].filter(
          fn => fs.existsSync(fn),
        )[0];
        const logicalBackMap = Object.keys(transformed.logical).reduce(
          (a, k) => ({
            ...a,
            [transformed.logical[k].BEGIN]: transformed.logical[k],
          }),
          {},
        );
        const annotations = Object.keys(res.annotations).sort().reduce(
          (accc, ak) => {
            const category = logicalBackMap[res.annotations[ak].id]
              ? logicalBackMap[res.annotations[ak].id].TYPE
              : res.annotations[ak].category;
            return ({
              ...accc,
              [`${p}#${id}#${ak}`]: {
                ...res.annotations[ak],
                id: `${id}#${ak}`,
                category,
                file_name,
              },
            });
          },
          {},
        );

        return {
          categories: res.categories,
          images: {
            [file_name]: {
              ...res.images[Object.keys(res.images).sort()[0]],
              file_name,
            },
          },
          annotations,
        };
      },
      4,
    ),
  );
};

const processXmlPath = async (paths, { parentPath, cacheDirPath, categories }, workerId) => Promise.all(
  forceArray(paths).map(
    async (p, idx) => {
      const hash = await getFileHash(p);
      const tempFilePath = path.join(cacheDirPath, `${hash}.json`);

      let res = {};
      let format = 'unknown';
      const t1 = (new Date()).getTime();
      if (fs.existsSync(tempFilePath)) {
        // log(`using cache ${tempFilePath}\n`);
        format = 'cached';
        res = JSON.parse(fs.readFileSync(tempFilePath, 'utf-8'));
      } else {
        const fileText = fs.readFileSync(p, 'utf-8');
        if (fileText.match(/PcGts/u)) {
          format = 'Page.xml';
          res = await processPagePath(p, pageToCocoExpression);
        } else if (fileText.match(/www\.loc\.gov\/METS/ig)) {
          format = 'METS';
          res = await processMetsPath(p, { parentPath, cacheDirPath });
        } else if (fileText.match(/www\.loc\.gov\/standards\/alto/ig)) {
          format = 'ALTO';
          res = await processPagePath(p, altoToCocoExpression);
        } else {
          log(` Warning: Unknown format of file: ${p}, ignoring`);
        }
      }
      const t2 = (new Date()).getTime();

      log(
        `[WORKER:${workerId}:${
          padLeft(idx + 1, Math.ceil(Math.log10(paths.length)))
        }/${
          paths.length
        }] ${
          p
        } ${
          [
            ` ${format}`,
            ...Object.keys(res).sort().reverse().map(
              k => padLeft(`${Object.keys(res[k]).length} ${k.substr(0, 2)}`, 6),
            ),
            p,
            padLeft(` ${prettyBytes(fs.statSync(p).size, 1)}`, 13),
            padLeft(` ${Math.floor(t2 - t1)} ms`, 13),
          ].join(' ')
        }\n`,
      );
      mkdirp.sync(path.dirname(tempFilePath));
      fs.writeFileSync(tempFilePath, JSON.stringify(res, null, 2), 'utf-8');
      return res;
    },
  ),
);

const makeHtml = async (images, masksDir) => {
  const openSeaDragonConf = {
    tileSources: images.map(
      ({
          file_name,
          id,
          width,
          height,
        },
      ) => ({
        type: 'image',
        title: id,
        url: path.basename(file_name),
        width: width,
        height: height,
      }),
    ),
  };

  const staticDir = path.join(masksDir, 'static');
  mkdirp.sync(staticDir);

  const openSeaDragonConfJson = JSON.stringify(openSeaDragonConf, null, 2);

  return `<!DOCTYPE HTML>
<html lang="ru-RU">
<head>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>COCO dataset masks preview (${masksDir})</title>
    <link rel="stylesheet" href="./static/style.css">
    <style>
    </style>
    <body>
    <script type="text/javascript">
        window.CONFIG=${JSON.stringify(openSeaDragonConf, null, 2)}
    </script>
    <script src="static/openseadragon/openseadragon.min.js"></script>
    <script type="text/javascript" src="static/index.js"/></script>
 </body>
</html>`;
};

initWorker({
  processImages,
  processXmlPath,
}, process.env.JOBS || 8);

/**
 *
 * @param input {
 *   categories: Array<{
 *     id: Number,
 *     name: String,
 *     supercategory: String,
 *   }>,
 *   images: Array<{
 *     id: Number,
 *     file_name: String,
 *     width: Int,
 *     height: Int,
 *   }>,
 *   annotations: Array<{
 *     id: Number,
 *     segmentation: Array<Array<Number>>,
 *     bbox: Array<Number>,
 *     category_id: Int,
 *     image_id: Int,
 *     category: {
 *       id: Number,
 *       name: String,
 *       supercategory: String,
 *     },
 *     supercategory: String,
 *   }>
 * }
 * @param conf
 * @returns {{}}
 */
const makeCoco = async (input, conf) => {
  if (Array.isArray(input)) {
    log(`MAKING COCO, merging ${input.length} records...`);
    input = mergeObjects(input);
    log(` done\n`);
  }
  const categoriesCount = Object.keys(input.categories || {}).length;
  log(`Merging ${categoriesCount}  categories...`);
  // const categories = conf.categories;

  log(` done\n`);
  const imagesCount = Object.keys(input.images || {}).length;

  log(`Merging ${imagesCount} images...`);
  const notFound = {};
  const images = Object.keys(input.images || {}).sort().reduce(
    (a, k, id) => {
      if (((id + 1) % REPORT_EVERY) === 0) {
        log(`[${padLeft(id + 1, Math.ceil(Math.log10(imagesCount)))}/${imagesCount}]\n`);
      }
      const fileName = input.images[k].file_name;
      const baseName = path.basename(fileName);
      const fileNamesPrec = uniq([
        fileName,
        // One level higher
        path.join(path.dirname(fileName), '..', baseName),
        // Check other input file paths
        ...conf.inputPaths.filter(inputPath => (path.basename(inputPath) === baseName)),
      ]);

      let found = false;
      // Search for file
      for (let i = 0; i < fileNamesPrec.length; i += 1) {
        if (fs.existsSync(fileNamesPrec[i])) {
          found = true;
          a[fileName] = {
            ...input.images[k],
            file_name: fileNamesPrec[i],
            id: id + 1,
          };
          break;
        }
      }
      if (!found) {
        notFound[fileName] = [fileName];
      }
      return a;
    },
    {},
  );
  log(` done\n`);
  // console.error(
  //  'fileName', fileName, 'baseName', baseName, 'fileNamesPrec', fileNamesPrec,
  //  'IMAGES', images, 'IMAGES NOT FOUND', notFound,
  // );

  const annCount = Object.keys(input.annotations || {}).length;
  log(`Merging ${annCount} annotations...\n`);

  const annotations = Object.keys(input.annotations || {}).sort().reduce(
    (a, annotationId, idx) => {
      const annotation = input.annotations[annotationId];
      const imageObj = images[annotation.file_name];
      /*
      if (((idx + 1) % REPORT_EVERY) === 0) {
        log(`[${padLeft(idx + 1, Math.ceil(Math.log10(annCount)))}/${annCount}]\n`)
      }
      */
      if (!annotation.category) {
        return a;
      }
      let mappedCat = CATEGORIES_MAPPING[annotation.category.split(':')[0]];
      if (imageObj) {
        if (!mappedCat) {
          return a;
        }
        if (mappedCat && (typeof mappedCat === 'object')) {
          const subCatName = annotation.category.split(':')[1];
          mappedCat = mappedCat[subCatName] || mappedCat['other'] || mappedCat;
        }
        const category_id = conf.categories[mappedCat] ? conf.categories[mappedCat].id : null;
        if (!category_id) {
          return a;
        }
        a[annotationId] = {
          id: idx + 1,
          width: annotation.width,
          height: annotation.height,
          category_id,
          image_id: imageObj.id,
          iscrowd: annotation.iscrowd || 0,
          segmentation: annotation.segmentation,
          ...((typeof annotation.text === 'undefined') ? { text: annotation.text } : {}),
          ...(
            annotation.keypoints && (annotation.keypoints.length > 0)
              ? { keypoints: annotation.keypoints }
              : {}
          ),
        };
      } else {
        notFound[annotation.file_name] = notFound[annotation.file_name] || [];
        notFound[annotation.file_name].push(annotationId);
      }
      return a;
    },
    {},
  );
  if (Object.keys(notFound).length > 0) {
    log(`Missing ${Object.keys(notFound).length} image files:\n`);
    Object.keys(notFound).sort().map(fk => {
      log(`  - ${fk}, ${notFound[fk].length} dependant annotations excluded\n`);
    });
  } else {
    log(`All image files found\n`);
  }

  const resultObj = {
    categories: conf.categories,
    images,
    annotations,
  };
  const result = Object.keys(resultObj).reduce(
    (a, k) => ({
      ...a,
      [k]: Object.keys(resultObj[k]).sort().map(
        kk => resultObj[k][kk],
      ).sort((a, b) => a.id - b.id),
    }),
    {},
  );
  // console.error('conf.output', conf.output, 'CONF', conf);
  const imagesDir = conf.subdirs ? path.join(conf.output, 'images') : conf.output;
  mkdirp.sync(imagesDir);
  // const masksDirName = `masks`;
  const masksDir = conf.subdirs ? path.join(conf.output, 'masks') : conf.output;
  mkdirp.sync(masksDir);

  const colorToMaskId = sortBy(Object.values(conf.categories), ['id']).reduce(
    (
      acc,
      { color, border_color, border_h_color, border_v_color, skeleton_color },
    ) => {
      if ((!conf.no_fill) && color) {
        acc[color] = acc[color] || Object.keys(acc).length;
      }
      if ((!conf.no_skeleton) && skeleton_color) {
        acc[skeleton_color] = acc[skeleton_color] || Object.keys(acc).length;
      }
      if (!conf.no_borders) {
        if (border_color) {
          acc[border_color] = acc[border_color] || Object.keys(acc).length;
        }
        if (border_h_color) {
          acc[border_h_color] = acc[border_h_color] || Object.keys(acc).length;
        }
        if (border_v_color) {
          acc[border_v_color] = acc[border_v_color] || Object.keys(acc).length;
        }
      }
      return acc;
    },
    {},
  );

  process.stderr.write(
    [
      `Color\tGT ID`,
      Object.keys(colorToMaskId).sort().map(
        k => `${[k, colorToMaskId[k]].join('\t')}\n`,
      ),
    ].join(''),
  );
  result.images = (await executeParallel(
    'processImages',
    result.images || [],
    {
      ...conf,
      imagesDir,
      masksDir,
      annotations: result.annotations,
      categories: result.categories,
      colorToMaskId,
    },
  )).filter(v => !!v);

  const jsonPath = path.join(conf.output, `coco.json`);
  log(`Serializing metadata to JSON and saving to:\n${jsonPath}\n`);
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf-8');
  const jsonSize = fs.statSync(jsonPath).size;
  log(`Done, ${prettyBytes(jsonSize)} (${jsonSize}) saved\n`);

  const htmlPath = path.join(conf.output, `index.html`);
  log(`Saving HTML masks preview to:\n${htmlPath}\n`);
  const resultHtml = await makeHtml(result.images, masksDir);
  log(`Saving HTML preview feed to ${htmlPath}`);
  const staticDstDir = path.join(path.dirname(htmlPath), 'static');
  mkdirp.sync(staticDstDir);

  const sdSrcDir = path.join(OPENSEADRAGON_BUILD_DIR, 'openseadragon');
  const sdDstDir = path.join(staticDstDir, 'openseadragon');
  mkdirp.sync(sdDstDir);
  fs.writeFileSync(htmlPath, resultHtml, 'utf-8');
  fs.copyFileSync(
    path.join(sdSrcDir, 'openseadragon.min.js'),
    path.join(sdDstDir, 'openseadragon.min.js'),
  );

  const sdImagesSrcDir = path.join(sdSrcDir, 'images');
  const sdImagesDstDir = path.join(sdDstDir, 'images');
  mkdirp.sync(sdImagesDstDir);
  glob.sync(path.join(sdImagesSrcDir, '*.*')).forEach(
    (fp) => fs.copyFileSync(fp, path.join(sdImagesDstDir, path.basename(fp))),
  );

  // Copy common assets
  fs.copyFileSync(
    path.join(__dirname, 'templates', 'style.css'),
    path.join(staticDstDir, 'style.css'),
  );
  // const scriptsDstDir = path.join(staticDstDir, 'scripts');
  fs.copyFileSync(
    path.join(__dirname, 'templates', 'index.js'),
    path.join(staticDstDir, 'index.js'),
  );
  log(
    ['',
      `Categories (${result.categories.length}): ${JSON.stringify(CATEGORIES)}`,
      `Annotations: ${result.annotations.length}`,
      `Images: ${result.images.length}`,
    ].map(
      l => `${l}\n`,
    ).join(''),
  );
  // })
};

const pGlob = async inputGlob => await (new Promise(
    (resolve, reject) => {
      glob(
        inputGlob,
        {},
        (er, files) => {
          if (er) {
            reject(er);
          } else {
            resolve(files.sort());
          }
        },
      );
    },
  )
);
const run = async (conf) => {
  const {
    cache_dir,
    input,
    output,
    limit,
    // no_images,
    // jobs,
    // force,
  } = conf;

  const inputPaths = (await cpMap(input, pGlob)).filter(
    fpArr => Array.isArray(fpArr) && (fpArr.length > 0),
  );
  log(`Output path: ${output}`);
  // console.error('INPUT PATHS', inputPaths)
  mkdirp.sync(output);

  const categories = conf.categories && (conf.categories.length > 0)
    ? conf.categories.reduce(
      (a, k) => ({ ...a, [k]: CATEGORIES[k] }),
      {},
    )
    : CATEGORIES;

  const parsed = await cpMap(
    inputPaths,
    async (inputFiles) => {
      const filesToProcess = limit && (limit > 0) ? inputFiles.slice(0, limit) : inputFiles;
      const filesToProcessStr = filesToProcess.map(v => `- ${v}\n`).join('');
      log(`Processing: (${filesToProcess.length} files) -> ${output}:\n${filesToProcessStr}`);
      const pathsData = await executeParallel(
        'processXmlPath',
        filesToProcess,
        {
          categories,
          parentPath: path.dirname(inputFiles[0]),
          cacheDirPath: cache_dir,
        },
      );
      log(`Merging ${pathsData.length} objects`);
      return mergeObjects(pathsData);
    },
  );

  log(`Making COCO file...\n`);
  const result = await makeCoco(
    parsed,
    {
      ...conf,
      categories,
      inputPaths: uniq(
        inputPaths.reduce(
          (a, o) => ([...a, ...o]),
          [],
        ),
      ),
    },
  );
  log('Done');
  return result;
};

if (cluster.isMaster) {
  const conf = parseArgs(process.argv.slice(2));
  log(`${JSON.stringify(conf, null, 2)}\n`);

  run(conf).catch(
    err => {
      log(`\n\nERROR:${err.message}\n${err.stack}\n`);
      process.exit(-1);
    },
  ).then(
    (message) => {
      log(message + '\n');
      process.exit(0);
    },
  );
}
