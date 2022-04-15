set -ex

export JOBS="${JOBS:-8}"


# Retropress Validation

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/retropress/val/" \
  '../DATA/retropress-val/**/*.xml'


# ICPR 2020

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --img-prefix '../images/' \
  --output "../DATA/segmentation/newseye-icpr-2020/train/" \
  '../DATA/NewsEye-ICPR-2020/*train/xmls/*.xml'

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --img-prefix '../images/' \
  --output "../DATA/segmentation/newseye-icpr-2020/test/" \
  '../DATA/NewsEye-ICPR-2020/*test/xmls/*.xml'


node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --img-prefix '../images/' \
  --output "../DATA/segmentation/newseye-icpr-2020/val/" \
  '../DATA/NewsEye-ICPR-2020/*test_gt/xmls/*.xml'


# PRImA Layout analysis


node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
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
  --mask-categories advertisement \
  --mask-categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/prima-layout-analysis/train-plus/" \
  '../DATA/PRImA-LayoutAnalysisDataset/????????.xml'

# PRImA Newspapers

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
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
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/prima-newspapers/train-plus/" \
  '../DATA/Prima-Newspapers/*.pc.page.xml'


node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/prima-newspapers/test/" \
  '../DATA/Prima-Newspapers/prima_newspapers_test/*pc*.xml'


node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/prima-newspapers/test-plus/" \
  '../DATA/Prima-Newspapers/prima_newspapers_test/*.pc.page.xml'


# BnL newspapers highest variance 05 dataset

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/bnl-set05/train/" \
  '../DATA/BNL/set05-different-newspapers/**/*mets.xml'


# NewsEye AS

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/newseye-as/train/" \
  '../DATA/NewsEye-AS/*Training*/*.xml'


# NewsEye ATR

node --trace-warnings ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
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
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/newseye-atr/val/" \
  '../DATA/NewsEye-ATR/*Validation*/*.xml'


# NewsEye ONB

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
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
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/newseye-onb/val/" \
  '../DATA/NewsEye-ONB/*Validation*/*.xml'


# OCR-D

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --lines-width 2 \
  --no-skeleton \
  --mask-categories advertisement \
  --mask-categories table \
  --categories graphics \
  --categories text \
  --categories mixed \
  --output "../DATA/segmentation/ocr-d-gt/train/" \
  '../DATA/ocr-d-groundtruth/*.ocrd/data/*mets.xml'
