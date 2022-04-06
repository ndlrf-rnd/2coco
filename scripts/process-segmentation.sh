set -ex

export JOBS="${JOBS:-8}"

# Retropress Validation

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --categories advertisement \
  --categories table \
  --mask-categories advertisement \
  --mask-categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/retropress/val/" \
  '../DATA/retropress-val/**/*.xml'


# PRImA Newspapers

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
  --categories advertisement \
  --categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/prima-newspapers/train/" \
  '../DATA/Prima-Newspapers/pc-????????.xml'


node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
  --categories advertisement \
  --categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/prima-newspapers/train-plus/" \
  '../DATA/Prima-Newspapers/????????.xml'


node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
  --categories advertisement \
  --categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/prima-newspapers/test/" \
  '../DATA/Prima-Newspapers/prima_newspapers_test/pc-????????.xml'


# PRImA Layout analysis

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --categories advertisement \
  --categories table \
  --mask-categories advertisement \
  --mask-categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/prima-layout-analysis/train/" \
  '../DATA/PRImA-LayoutAnalysisDataset/pc-????????.xml'

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --categories advertisement \
  --categories table \
  --mask-categories advertisement \
  --mask-categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/prima-layout-analysis/train-plus/" \
  '../DATA/PRImA-LayoutAnalysisDataset/????????.xml'


# BnL newspapers highest variance 05 dataset

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --categories advertisement \
  --categories table \
  --mask-categories advertisement \
  --mask-categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/bnl-set05/train/" \
  '../DATA/BNL/set05-different-newspapers/**/*mets.xml'


# NewsEye ONB

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
  --categories advertisement \
  --categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/newseye-onb/train/" \
  '../DATA/NewsEye-ONB/*Training*/*.xml'

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
  --categories advertisement \
  --categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/newseye-onb/test/" \
  '../DATA/NewsEye-ONB/*Validation*/*.xml'


# NewsEye AS

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
  --categories advertisement \
  --categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/newseye-as/train/" \
  '../DATA/NewsEye-AS-TrainOnly/*Training*/*.xml'


# ICPR 2020

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
  --categories advertisement \
  --categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/icpr-2020/train/" \
  '../DATA/ICPR-2020-NewsEye-Text-Block-DATA/osr/*train*/xmls/*.xml' \
  '../DATA/ICPR-2020-NewsEye-Text-Block-DATA/osr/*train*/images/*.*'

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
  --categories advertisement \
  --categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/icpr-2020/test/" \
  '../DATA/ICPR-2020-NewsEye-Text-Block-DATA/osr/*test*/xmls/*.xml' \
  '../DATA/ICPR-2020-NewsEye-Text-Block-DATA/osr/*test*/images/*.*'


# NewsEye ATR

node --trace-warnings ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
  --categories advertisement \
  --categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/newseye-atr/train/" \
  '../DATA/NewsEye-ATR/*Training*/fk*.xml'


node --trace-warnings ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
  --categories advertisement \
  --categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/newseye-atr/test/" \
  '../DATA/NewsEye-ATR/*Validation*/*.xml'


# NewsEye ONB

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
  --categories advertisement \
  --categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/newseye-onb/train/" \
  '../DATA/NewsEye-ONB/*Training*/*.xml'

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
  --categories advertisement \
  --categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/newseye-onb/test/" \
  '../DATA/NewsEye-ONB/*Validation*/*.xml'


# OCR-D

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
  --categories advertisement \
  --categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/ocr-d-gt/train/" \
  '../DATA/ocr-d-groundtruth/*.ocrd/data/*mets.xml'
