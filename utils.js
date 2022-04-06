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
  (a, o, idx) => {
    const keys = Object.keys(o || {});
    if (process.env.DEBUG) {
      process.stdout.write(
        [
          `Merging objects ${idx + 1} / ${objects.length}, ${keys.length} keys:`,
          `Existing keys:`,
          ...Object.keys(a).map(
            ak => `${ak}\t${Object.keys(a[ak]).length}`,
          ),
        ].map(s => `${s}\n`).join(''),
      );
    }
//     const aa = {};
//     for (let i =0; i<keys.length; i+=1) {
// const key = keys[i];
// const oo = (typeof o[kk] === 'object' ? o[kk] : {});
//       if (typeof aa[key] !== 'undefined') {
//         aa[key] = {
//         ...aa[kk],
//         ...oo,
//         }
//       } else {
//
//       }
//     }

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      // return keys.reduce(
      if (!a.hasOwnProperty(key)) {
        a[key] = { ...o[key] };
      } else {
        const subKeys = Object.keys(o[key]);
        for (let j = 0; j < subKeys.length; j += 1) {
          const subKey = subKeys[j];
          a[key][subKey] = o[key][subKey];
        }
      }
    }
    return a;
  },
  {},
);

const seg2bbox = (seg) => {
  seg = seg.reduce((a, o) => ([...a, ...(Array.isArray(o) ? o : [o])]), []);
  if (seg.length < 2) {
    return [0, 0, 0, 0];
  }
  let res = [+Infinity, +Infinity, -Infinity, -Infinity];
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
    res[3] - res[1],
  ];
};

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


const hex2rgbaInt = (hexa, alpha = 1.0) => {
  hexa = `${hexa || ''}`.replace(/^#?/g, '#');
  if ((hexa.length < 4) || (hexa.length > 9)) {
    return null;
  }
  if ((hexa.length === 4) || (hexa.length === 5)) {
    // Short notation line '#AB3' or '#AB56'
    hexa = `#${hexa.slice(1).forEach(v => v + v).join('')}`
  }
  const r = parseInt(hexa.slice(1, 3), 16);
  const g = parseInt(hexa.slice(3, 5), 16);
  const b = parseInt(hexa.slice(5, 7), 16);
  let a = alpha;
  if (hexa.length > 7) {
    a = parseInt(hexa.slice(7, 9), 16) / 255;
  }
  return [r, g, b, a];
};
const hex2rgba = (hexa, alpha = 1.0) => {
  const [r, g, b, a] = typeof hexa === 'string' ? hex2rgbaInt(hexa, alpha) : hexa;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};


module.exports = {
  hex2rgba,
  hex2rgbaInt,
  forceArray,
  prettyBytes,
  padLeft,
  padRight,
  mergeObjects,
  seg2bbox,
  bbox2seg,
};
