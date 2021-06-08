const forceArray = (x) => (Array.isArray(x) ? x : [x].filter((v) => !!v));

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


/**
 *
 * @param objects Array<Object<{String: Object}>>
 */
const mergeObjects = (objects) => objects.reduce(
  (a, o) => Object.keys(o || {}).reduce(
    (aa, kk) => ({
      ...aa,
      [kk]: {
        ...(aa[kk] || {}),
        ...(o[kk] || {})
      }
    }),
    a
  ),
  {}
)

const seg2bbox = (seg) => {
  seg = seg.reduce((a, o) => ([...a, ...(Array.isArray(o) ? o : [o])]), []);
  if (seg.length < 2) {
    return [0, 0, 0, 0]
  }
  let res = [+Infinity, +Infinity, -Infinity, -Infinity]
  for (let i = 0; i < seg.length; i += 1) {
    const v = seg[i];
    if (i % 2 === 0) {
      res[0] = Math.min(res[0], v);
      res[2] = Math.max(res[2], v);
    } else {
      res[1] = Math.min(res[1], v);
      res[3] = Math.max(res[3], v);
    }

  }
  return [
    res[0],
    res[1],
    res[2] - res[0],
    res[3] - res[1]
  ]
}


const bbox2seg = (bbox) => ([
  bbox[0],
  bbox[1],

  bbox[0] + bbox[2],
  bbox[1],

  bbox[0] + bbox[2],
  bbox[1] + bbox[3],

  bbox[0],
  bbox[1] + bbox[3],

  bbox[0],
  bbox[1],
]);

module.exports = {
  forceArray,
  prettyBytes,
  padLeft,
  padRight,
  mergeObjects,
  seg2bbox,
  bbox2seg,
}
