const fs = require('fs');
const path = require('path');

const argparse = require('argparse');
const { CATEGORIES } = require('./categories');

const PACKAGE_METADATA_PATH = './package.json';
const PACKAGE_METADATA = JSON.parse(fs.readFileSync(PACKAGE_METADATA_PATH, 'utf-8'));
const VERSION = PACKAGE_METADATA.version;

const parseArgs = (args) => {
  const parser = new argparse.ArgumentParser({
    description: '2coco',
    add_help: true,
  });

  parser.add_argument(
    '-v', '--version',
    {
      action: 'version',
      version: VERSION,
    },
  );
  parser.add_argument(
    '--categories',
    {
      action: 'append',
      choices: Object.keys(CATEGORIES).sort(),
    },
  );
  parser.add_argument(
    '--mask-categories',
    {
      action: 'append',
      choices: Object.keys(CATEGORIES).sort(),
    },
  );
  parser.add_argument(
    '--no-skeleton',
    {
      help: 'Don\'t paint skeletons',
      action: ['store_true'],
    },
  );

  parser.add_argument(
    '--no-borders',
    {
      help: 'Don\'t paint borders',
      action: ['store_true'],
    },
  );
  parser.add_argument(
    '--no-masks',
    {
      help: 'Don\'t render and save color masks',
      action: ['store_true'],
    },
  );
  parser.add_argument(
    '--no-gt',
    {
      help: 'Don\'t render binary ground truth masks',
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
    '-s', '--subdirs', '--create-subdirs',
    {
      help: 'Create images and folders subdirs',
      action: ['store_true'],
    },
  );

  parser.add_argument(
    'input',
    {
      help: 'input .pdf file path',
      type: String,
      nargs: '+',
    },
  );

  parser.add_argument(
    '--bbox-masks', '--bbox', '-b',
    {
      help: 'Use only bounding boxes while paintings masks',
      action: ['store_true'],
      default: false,
    },
  );
  parser.add_argument(
    '--ignore-key-points', '-P',
    {
      help: 'Don\'t render key points',
      action: ['store_true'],
      default: false,
    },
  );
  parser.add_argument(
    '--no-fill', '-F',
    {
      help: 'Don\'t fill masks primitives',
      action: ['store_true'],
      default: false,
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

  parser.add_argument(
    '--limit', '-n',
    {
      help: 'limit input files count',
      default: null,
      type: 'int',
    },
  );
  parser.add_argument(
    '--output-format', '-m',
    {
      help: 'Output forMat',
      default: 'jpeg',
      type: 'str',
    },
  );
  parser.add_argument(
    '--cache-dir', '-t',
    {
      help: 'Cache dir path',
      default: path.resolve('./.cache/'),
      type: 'str',
    },
  );
  parser.add_argument(
    '--output-max-dpi', '-p',
    {
      help: 'Max DPI for exported image (images over this margin will be downscaled with preserved proportions as well as COCO markup coordinates)',
      default: 100,
      type: 'int',
    },
  );
  parser.add_argument(
    '--default-dpi',
    {
      help: 'Use this DPI value if DPI not found in metadata',
      default: 300,
      type: 'int',
    },
  );
  parser.add_argument(
    '--lines-width', '-w',
    {
      help: 'Outlines and object COCO skeleton lines thickness in raw pixels',
      default: 5,
      type: 'int',
    },
  );

  parser.add_argument(
    '--img-prefix', '-i',
    {
      help: 'Relative image path prefix',
      default: '.',
      type: 'str',
    },
  );
  
  parser.add_argument(
    '--img-suffix', '-I',
    {
      help: 'Image path possible suffix to cut off',
      default: '',
      type: 'str',
    },
  );
  return parser.parse_args(args);
};

module.exports = {
  parseArgs,
};
