const fs = require('fs');
const path = require('path');

const argparse = require('argparse');

const PACKAGE_METADATA_PATH = './package.json'
const PACKAGE_METADATA = JSON.parse(fs.readFileSync(PACKAGE_METADATA_PATH, 'utf-8'))
const VERSION = PACKAGE_METADATA.version


const parseArgs = (args) => {
  const parser = new argparse.ArgumentParser({
    description: '2coco',
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
      help: 'Force re-create existing files',
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
    '--bbox-masks', '--bbox', '-b',
    {
      help: 'Use only bounding boxes while paintings masks',
      action: ['store_true'],
      default: false,
    },
  );
  parser.add_argument(
    '--key-points', '--k',
    {
      help: 'Render only key points structures',
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
    '--temp-dir', '-t',
    {
      help: 'Temp dir path',
      default: path.resolve('./.temp/'),
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

  return parser.parse_args(args);
};

module.exports = {
  parseArgs
}
