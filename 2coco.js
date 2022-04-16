// noinspection CssInvalidPropertyValue

/**
 * @module 2coco
 */

const fs = require('fs');
const path = require('path');
const cluster = require('cluster');
const crypto = require('crypto');

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
const { makeHtmlPlain } = require('./html-index');

const {
  bbox2seg,
  forceArray,
  seg2bbox,
  prettyBytes,
  padLeft,
  mergeObjects,
  hex2rgba,
  hex2rgbaInt,
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
const DEFAULT_OPACITY = 1.0;

const DEFAULT_THUMB_MAX_SIZE = 256;

fs.mkdirSync(LOG_DIR, { recursive: true });

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

const saveImg = async (im, p, thumbSize = DEFAULT_THUMB_MAX_SIZE) => {
  const thumbPath = path.join(...(p.split(path.sep).slice(0, -1)), 'thumb', p.split(path.sep).slice(-1)[0]);
  const thumbsDir = path.dirname(thumbPath);
  if (!fs.existsSync(thumbsDir)) {
    fs.mkdirSync(thumbsDir, { recursive: true });
  }
  const { width, height } = await im.metadata();
  const imClone = im.clone();
  await imClone.toFile(p);
  await imClone.resize(
    Math.round(width * (thumbSize / (Math.max(width, height)))),
    Math.round(height * (thumbSize / (Math.max(width, height)))),
  ).toFile(thumbPath);
  return thumbPath;
};

/**
 * Convert arrays to TSV
 * @param arrs {Array<Array<*>>}
 * @returns {String}
 */
const arrs2tsv = arrs => forceArray(arrs).map(
  row => `${forceArray(row).join('\t')}\n`,
).join('');

const parseMetsExpression = jsonataRunner(fs.readFileSync(METS_JSONATA_PATH, 'utf-8'));
const pageToCocoExpression = jsonataRunner(fs.readFileSync(PAGE_XML_TO_COCO_JSONATA_PATH, 'utf-8'));
const altoToCocoExpression = jsonataRunner(fs.readFileSync(ALTO_TO_COCO_JSONATA_PATH, 'utf-8'));

const getImSeg = (
  img,
  x,
  y,
  width,
  height,
) => {
  let mask = img.crop({
    x, y, width, height,
  });
  //   .mask({
  //   algorithm: 'li',
  //   // algorithm: 'threshold',
  //   // threshold: th,
  //   // useAlpha: false,
  //   // invert: false,
  // });

  // console.log('mask', mask)
  // mask = mask.erode({
  //   kernel: [
  //     [1, 1, 1],
  //     [1, 1, 1],
  //     [1, 1, 1],
  //   ],
  //   iterations: 1,
  // }).dilate({
  //   kernel: [
  //     [1, 1, 1],
  //     [1, 1, 1],
  //     [1, 1, 1],
  //   ],
  //   iterations: 1,
  // });
  const borders = [];
  const th = mask.getThreshold({ algorithm: 'otsu' });

  for (let y = 0; y <= mask.height; y += 1) {
    const row = mask.data.slice(y * mask.width, (y + 1) * mask.width);
    let left = null;
    let right = null;

    for (let x = 0; x < row.length; x += 1) {
      if (row[x] <= th) {
        left = x;
        break;
      }
    }
    for (let x = row.length - 1; x >= 0; x -= 1) {
      if (row[x] <= th) {
        right = x;
        break;
      }
    }
    borders.push(
      ((left === null) && (right === null))
        ? null
        : [left, right],
    );
  }
  let top = 0;
  let bottom = borders.length;
  for (let y = 0; y < borders.length; y += 1) {
    if (borders[y] !== null) {
      top = y;
      break;
    }
  }
  for (let y = borders.length - 1; y >= 0; y -= 1) {
    if (borders[y] !== null) {
      bottom = y;
      break;
    }
  }
  return mask;
};

const processImages = async (images, ctx, workerId) => {
  const { colorToMaskId } = ctx;

  const processImage = async (im, idx) => {
    let error = null;
    const t1 = (new Date()).getTime();

    const imgAnnotations = (
      Array.isArray(ctx.annotations)
        ? ctx.annotations
        : Object.values(ctx.annotations || {})
    ).filter(
      ({ image_id }) => image_id === im.id,
    );

    if (imgAnnotations.length === 0) {
      error = 'No annotations'; //coreturn null;
    }

    // const ext = path.extname(im.file_name || '').substr(1);
    const extension = ctx.output_format ? `.${ctx.output_format.toLocaleLowerCase()}` : DEFAULT_IMAGE_EXTENSION;
    const baseName = path.basename(im.file_name, path.extname(im.file_name));
    if (fs.existsSync(im.file_name)) {
      // Get image metadata
      const image = sharp(im.file_name, DEFAULT_SHARP_PARAMS);
      const { density, format, space, channels, width, height } = await image.metadata();

      if ((!width) || (!height)) {
        error = 'Invalid width or height';
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
      const srcSize = fs.statSync(im.file_name).size;
      const inputPath = im.file_name;

      const hashStr = crypto.createHash('sha256').update(
        fs.readFileSync(inputPath),
      ).digest('hex').substr(0, 8);

      const outputFileName = `${baseName}-${hashStr}${extension}`;
      let outputFilePath = path.join(ctx.imagesDir, outputFileName);
      im.file_name = outputFilePath; // path.relative(ctx.output, outputFilePath);

      const maskOutputPath = path.join(
        ctx.masksDir,
        im.file_name
          .split('/')
          .slice(-1)[0]
          .replace(/\.([^.\/\\]+)$/u, `.png`),
      );

      fs.mkdirSync(path.dirname(maskOutputPath), { recursive: true });

      const textCategoryId = ctx.annotations.filter(({ name }) => name === CATEGORY_TEXT_LINE).id;
      const printSpaceCategoryId = ctx.annotations.filter(({ name }) => name === CATEGORY_PRINT_SPACE).id;
      // const textCategoryId = ctx.annotations.filter(({name}) => name === CATEGORY_PRINT_SPACE).id

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
        bmctx.lineWidth = ctx.lines_width;
        bmctx.strokeStyle = COLORS.black;
        binMaskCtxes.push(bmctx);
      }
      sortBy(annotations, ['category_id', 'id']).forEach(
        (ann) => {
          const annCat = Object.values(ctx.categories,
            // CATEGORIES
          ).filter(
            ({ id }) => id === ann.category_id,
          )[0] || {}; // TODO: Rly need object default here?!
          ann.segmentation.forEach(
            (seg) => {
              seg = forceArray(seg);
              const allSegEdges = [];
              const vSegEdges = [];
              const hSegEdges = [];
              const bbox = [undefined, undefined, undefined, undefined];
              for (let i = 0; i < seg.length; i += 2) {
                bbox[0] = typeof bbox[0] === 'undefined' ? seg[i] : Math.min(seg[i], bbox[0]);
                bbox[1] = typeof bbox[1] === 'undefined' ? seg[i + 1] : Math.min(seg[i + 1], bbox[1]);
                bbox[2] = typeof bbox[2] === 'undefined' ? seg[i] : Math.max(seg[i], bbox[2]);
                bbox[3] = typeof bbox[3] === 'undefined' ? seg[i + 1] : Math.max(seg[i + 1], bbox[3]);

                const x2 = seg[i];
                const y2 = seg[i + 1];
              }

              const is90 = Math.abs(bbox[2] - bbox[0]) < Math.abs(bbox[3] - bbox[1]);
              // const bwSeg = getImSeg(bw, bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]);
              // console.log('seg', bbox, bwSeg);
              for (let i = 0; i < seg.length; i += 2) {
                const x1 = i < 2 ? seg[seg.length - 2] : seg[i - 2];
                const y1 = i < 2 ? seg[seg.length - 1] : seg[i - 1];
                const x2 = seg[i];
                const y2 = seg[i + 1];

                const edge = [[x1, y1], [x2, y2]];
                allSegEdges.push(edge);
                if (Math.abs(x1 - x2) >= Math.abs(y1 - y2)) {
                  (is90 ? vSegEdges : hSegEdges).push(edge);
                } else {
                  (is90 ? hSegEdges : vSegEdges).push(edge);
                }
              }
              if ((!ctx.no_fill) && annCat.color) {
                const colors = forceArray(annCat.color);
                const meanColor = hex2rgba(
                  colors.reduce(
                    (acc, obj) => hex2rgbaInt(obj).map(
                      (c, idx) => (
                        acc[idx] + (c / colors.length)
                      ),
                    ),
                    [0, 0, 0, 0],
                  ).slice(0, 3).map(v => Math.ceil(v)).concat([DEFAULT_OPACITY]),
                  DEFAULT_OPACITY,
                );
                forceArray(annCat.color).forEach(
                  color => {
                    const binMaskCtx = binMaskCtxes[colorToMaskId[color].maskId];
                    if (binMaskCtx) {
                      binMaskCtx.fillStyle = COLORS.white;
                      binMaskCtx.strokeStyle = COLORS.black;
                      binMaskCtx.lineWidth = ctx.lines_width;
                      binMaskCtx.beginPath();
                    }
                    if (!annCat.mask) {
                      canvasBlockCtx.fillStyle = meanColor;
                      canvasBlockCtx.strokeStyle = 'transparent';
                      canvasBlockCtx.lineWidth = ctx.mask_padding * 2;
                      canvasBlockCtx.beginPath();
                    }
                    for (let i = 0; i < allSegEdges.length; i += 1) {
                      const [[x1, y1], [x2, y2]] = allSegEdges[i];
                      if ((i === 0) || (x1 !== allSegEdges[i - 1][1][0]) || (y1 !== allSegEdges[i - 1][1][1])) {
                        if (binMaskCtx) {
                          binMaskCtx.moveTo(x1, y1);
                        }
                        if (!annCat.mask) {
                          canvasBlockCtx.moveTo(x1, y1);
                        }
                      }
                      if (binMaskCtx) {
                        binMaskCtx.lineTo(x2, y2);
                      }
                      if (!annCat.mask) {
                        canvasBlockCtx.lineTo(x2, y2);
                      }
                    }
                    if (binMaskCtx) {
                      binMaskCtx.closePath();
                      binMaskCtx.fill();
                      binMaskCtx.stroke();
                    }
                    if (!annCat.mask) {
                      canvasBlockCtx.closePath();
                      canvasBlockCtx.fill();
                      canvasBlockCtx.stroke();
                    }
                  },
                );
              }
              // Edges
              const bordersEdges = [];
              if (!ctx.no_borders) {
                if (annCat.border_color && (!(annCat.border_v_color || annCat.border_h_color))) {
                  bordersEdges.push([allSegEdges, annCat.border_color]);
                } else {
                  if (annCat.border_v_color) {
                    bordersEdges.push([vSegEdges, annCat.border_v_color]);
                  }
                  if (annCat.border_h_color) {
                    bordersEdges.push([hSegEdges, annCat.border_h_color]);
                  }
                }
                bordersEdges.forEach(([edges, color]) => {
                  const binMaskCtx = binMaskCtxes[colorToMaskId[color].maskId];
                  if (binMaskCtx) {
                    binMaskCtx.strokeStyle = COLORS.white;
                    binMaskCtx.beginPath();
                  }
                  if (!annCat.mask) {
                    canvasBlockCtx.strokeStyle = hex2rgba(color, DEFAULT_OPACITY);
                    canvasBlockCtx.beginPath();
                  }
                  for (let i = 0; i < edges.length; i += 1) {
                    const [[x1, y1], [x2, y2]] = edges[i];
                    if ((i === 0) || (x1 !== edges[i - 1][1][0]) || (y1 !== edges[i - 1][1][1])) {
                      if (binMaskCtx) {
                        binMaskCtx.moveTo(x1, y1);
                      }
                      if (!annCat.mask) {
                        canvasBlockCtx.moveTo(x1, y1);
                      }
                    }
                    if (binMaskCtx) {
                      binMaskCtx.lineTo(x2, y2);
                    }
                    if (!annCat.mask) {
                      canvasBlockCtx.lineTo(x2, y2);
                    }
                  }
                  if (binMaskCtx) {
                    binMaskCtx.stroke();
                  }
                  if (!annCat.mask) {
                    canvasBlockCtx.stroke();
                  }
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
            const binMaskCtx = binMaskCtxes[colorToMaskId[annCat.skeleton_color].maskId];
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
            // canvasBlockCtx.strokeStyle = color || COLORS.white;
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
      const pngParams = { resolveWithObject: true, force: true, compressionLevel: 4, progressive: true };
      if (!ctx.no_gt) {
        // let gtIdx = 1; // Zero is reserved for potential background mask
        await cpMap(
          binMaskCanvases,
          async (binMaskCanvas, idx) => {
            const cat = Object.values(colorToMaskId).filter(({ maskId }) => maskId === idx)[0];
            if (!cat.mask) {
              const fn = maskOutputPath.replace(/(\.[^.]+)$/u, `-${cat.class}$1`);
              await saveImg(sharp(binMaskCanvas.toBuffer(), DEFAULT_SHARP_PARAMS).png(pngParams), fn);
            }
            // gtIdx += 1;
          },
        );
        await saveImg(
          sharp(canvasBlock.toBuffer(), DEFAULT_SHARP_PARAMS).threshold(254).negate().png(pngParams),
          maskOutputPath.replace(/(\.[^.]+)$/u, `-${'background'}$1`),
        );
      }

      im.mask_file_name = maskOutputPath;
      im.mask_thumb_file_name = await saveImg(
        sharp(canvasBlock.toBuffer(), DEFAULT_SHARP_PARAMS).png(pngParams),
        maskOutputPath,
      );
      let dstSize = 0;

      try {

        if (fs.existsSync(outputFilePath)) {
          fs.unlinkSync(outputFilePath);
        }

        const maskImages = await cpMap(
          Object.values(colorToMaskId).filter(({ mask }) => mask),
          async ({ maskId }) => {
            const maskChannel = await sharp(binMaskCanvases[maskId].toBuffer())
              .extractChannel(0)
              .toBuffer();
            const { dominant } = await image.stats();
            return sharp({
              create: {
                width: im.width,
                height: im.height,
                channels: 3,
                background: dominant,
              },
            }).png().ensureAlpha().joinChannel(
              maskChannel,
              {},
            );
          });

        let resizedImage = await image.resize(
          im.width,
          im.height,
        ).toBuffer();

        if (maskImages.length > 0) {
          resizedImage = await sharp(resizedImage).composite(
            await cpMap(
              maskImages,
              async categoriesMask => ({
                input: await categoriesMask.toBuffer(),
              }),
            ),
          ).toBuffer();
        }

        im.thumb_file_name = await saveImg(sharp(resizedImage), outputFilePath);
        if (!fs.existsSync(outputFilePath)) {
          console.error(`ERROR: failed to convert\n`);
          error = 'Failed';
        }
        dstSize = fs.statSync(outputFilePath).size;
      } catch (e) {
        error = `Error during image conversion:\n${e.message}\n${e.stack}`;
        console.error(error);
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
        ...(error ? { error } : {}),
        file_name: outputFileName,
      };
    }
  };

  return clone(
    (
      await cpMap(images, processImage)
    ),
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
  // consple.log(Object.keys(res.annotations || {}))
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
  // console.log('i', images);
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
      fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
      fs.writeFileSync(tempFilePath, JSON.stringify(res, null, 2), 'utf-8');
      return res;
    },
  ),
);

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
 *     width: Number,
 *     height: Number,
 *   }>,
 *   annotations: Array<{
 *     id: Number,
 *     segmentation: Array<Array<Number>>,
 *     bbox: Array<Number>,
 *     category_id: Number,
 *     image_id: Number,
 *     category: {
 *       id: Number,
 *       name: String,
 *       supercategory: String,
 *     },
 *     supercategory: String,
 *   }>
 * }
 * @param conf
 * @returns {Promise<*>}
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
      let fileName = input.images[k].file_name;
      if (conf.img_suffix) {
        fileName = fileName.replace(conf.img_suffix, '.*');
      }
      const baseName = path.basename(fileName);
      const fileNamesPrec = glob.sync(
        path.join(
          path.dirname(path.resolve(fileName)),
          ...(
            conf.img_prefix && (conf.img_prefix != '.')
              ? [conf.img_prefix.replace(/(^\/+|\/+$)/ug, '')]
              : []
          ),
          path.basename(path.extname(fileName) ? fileName : `${fileName}.*`),
        ),
      ).sort();
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

        console.error('NOT FOUNDfileNamesPrec', fileName, fileNamesPrec);
        notFound[fileName] = [fileName];
      }
      return a;
    },
    {},
  );
  log(` done\n`);

  const annCount = Object.keys(input.annotations || {}).length;
  log(`Merging ${annCount} annotations...\n`);

  const annotations = Object.keys(input.annotations || {}).sort().reduce(
    (a, annotationId, idx) => {
      const annotation = input.annotations[annotationId];
      const imageObj = images[annotation.file_name];
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
      }
      // else {
      //   notFound[annotation.file_name] = notFound[annotation.file_name] || [];
      //   notFound[annotation.file_name].push(annotationId);
      // }
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
  const imagesDir = conf.subdirs ? path.join(conf.output, 'images') : conf.output;
  fs.mkdirSync(imagesDir, { recursive: true });
  const masksDir = conf.subdirs ? path.join(conf.output, 'masks') : conf.output;
  fs.mkdirSync(masksDir, { recursive: true });

  const categoriesFrequencies = result.annotations.reduce(
    (a, o) => {
      a[o.category_id] = (a[o.category_id] || 0) + 1;
      return a;
    },
    {},
  );
  process.stderr.write(
    arrs2tsv([
      [`Category ID`, 'Category name', `Count`],
      ...Object.keys(categoriesFrequencies).sort().map(
        k => ([
          k,
          (result.categories.filter(v => parseInt(v.id) === parseInt(k, 10))[0] || { name: '_unnamed_' }).name,
          categoriesFrequencies[k],
        ]),
      ),
    ]),
  );
  const colorToMaskId = sortBy(
    Object.values(conf.categories),
    ['id'],
  ).reduce(
    (
      acc,
      {
        id,
        color,
        border_color,
        border_class,
        skeleton_color,
        skeleton_class,
        border_h_color,
        border_h_class,
        border_v_color,
        border_v_class,
        mask,
        name,
      },
    ) => {
      if ((!conf.no_fill) && color) {
        forceArray(color).forEach(c => {
          acc[c] = acc[c] || {
            maskId: Object.keys(acc).length,
            categoryId: id,
            mask,
            name: `${name}`,
            class: `${name}`,
          };
        });
      }
      if ((!conf.no_skeleton) && skeleton_color) {
        acc[skeleton_color] = acc[skeleton_color] || {
          maskId: Object.keys(acc).length,
          categoryId: id,
          mask,
          class: `${skeleton_class || name}`,
          name: `${name}-skeleton`,
        };
      }
      if (!conf.no_borders) {
        if (border_color) {
          acc[border_color] = acc[border_color] || {
            maskId: Object.keys(acc).length,
            categoryId: id,
            mask,
            class: `${border_class || name}`,
            name: `${name}-border`,
          };
        }
        if (border_h_color) {
          acc[border_h_color] = acc[border_h_color] || {
            maskId: Object.keys(acc).length,
            categoryId: id,
            mask,
            class: `${border_h_class || name}`,
            name: `${name}-border-horizontal`,
          };
        }
        if (border_v_color) {
          acc[border_v_color] = acc[border_v_color] || {
            maskId: Object.keys(acc).length,
            categoryId: id,
            mask,
            class: `${border_v_class || name}`,
            name: `${name}-border-vertical`,
          };
        }
      }
      return acc;
    },
    {},
  );

  process.stderr.write(
    arrs2tsv([
      [`Color`, 'Category ID', `Mask ID`, 'Mask'],
      ...Object.keys(colorToMaskId).sort().map(
        k => ([k, colorToMaskId[k].categoryId, colorToMaskId[k].maskId, colorToMaskId[k].mask]),
      ),
    ]),
  );
  const colorToMaskIdJsonPath = path.join(conf.output, `colors.json`);
  fs.writeFileSync(
    colorToMaskIdJsonPath,
    JSON.stringify({
      colors: Object.keys(colorToMaskId).sort().filter(color => !colorToMaskId[color].mask),
      labels: Object.keys(colorToMaskId).sort().filter(color => !colorToMaskId[color].mask).map(color => colorToMaskId[color].name),
      one_hot_encoding: null,
    }, null, 2),
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
  ));
  const errorImages = result.images.filter(i => !!i).reduce(
    (acc, { id, error }) => (error ? acc : { ...acc, id: true }),
    {},
  );
  result.annotations = result.annotations.filter(a => errorImages[a.image_id] === 'undfined');
  result.images = result.images.filter(v => v && (!v.error));

  const jsonPath = path.join(conf.output, `coco.json`);
  log(`Serializing metadata to JSON and saving to:\n${jsonPath}\n`);
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf-8');
  const jsonSize = fs.statSync(jsonPath).size;
  log(`Done, ${prettyBytes(jsonSize)} (${jsonSize}) saved\n`);

  const resultHtml = await makeHtmlPlain(result.images, masksDir, conf.output);

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
    no_images,
    // jobs,
  } = conf;

  const inputPaths = (await cpMap(input, pGlob)).filter(
    fpArr => Array.isArray(fpArr) && (fpArr.length > 0),
  );
  log(`Output path: ${output}`);
  // console.error('INPUT PATHS', inputPaths)
  fs.mkdirSync(output, { recursive: true });
  let categories = conf.categories && (conf.categories.length > 0)
    ? conf.categories.reduce(
      (a, k) => ({ ...a, [k]: { ...CATEGORIES[k], mask: false } }),
      {},
    ) : CATEGORIES;

  categories = (conf.mask_categories || []).reduce(
    (a, k) => ({ ...a, [k]: { ...CATEGORIES[k], mask: true } }),
    categories,
  );
  console.log('c', categories);

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
