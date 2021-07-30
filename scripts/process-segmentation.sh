set -ex

export JOBS="${JOBS:-8}"

# BnL newspapers highest variance 05 dataset

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --output "../DATA/segmentation/train/bnl-set05/" \
  '../DATA/BNL/set05-different-newspapers/**/*mets.xml'


# PRImA Layout analysis

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --output "../DATA/segmentation/train/prima-layout-analysis" \
  '../DATA/PRImA-LayoutAnalysisDataset/pc-????????.xml'


# PRImA Newspapers

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --output "../DATA/segmentation/train/prima-newspapers/" \
  '../DATA/Prima-Newspapers/pc-????????.xml'

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --output "../DATA/segmentation/test/prima-newspapers/" \
  '../DATA/Prima-Newspapers/prima_newspapers_test/pc-????????.xml'


# OCR-D

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --output "../DATA/segmentation/train/ocr-d-gt/" \
  '../DATA/ocr-d-groundtruth/*.ocrd/data/*mets.xml'

# Retropress Validation

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --output "../DATA/segmentation/val/retropress" \
  '../DATA/retropress-val/*/*.xml'


# CBAD 2019
if [ -f process-cbad-2019 ] ; then
node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --output "../DATA/segmentation/train/cbad-2019/" \
  '../DATA/ICDAR-2019-cBAD-dataset-blind/train/page/*.xml' \
  '../DATA/ICDAR-2019-cBAD-dataset-blind/train/*.*'

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --output "../DATA/segmentation/test/cbad-2019/" \
  '../DATA/ICDAR-2019-cBAD-dataset-blind/eval/page/*.xml' \
  '../DATA/ICDAR-2019-cBAD-dataset-blind/eval/*.*'

fi

# CBAD 2017

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --output "../DATA/segmentation/train/cbad-2017/" \
  '../DATA/ICDAR-cBAD-2017-dataset-v4/Train-Baseline Competition*/**/page/*.xml'

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --output "../DATA/segmentation/test/cbad-2017/" \
  '../DATA/ICDAR-cBAD-2017-dataset-v4/Test-Baseline Competition*/**/page/*.xml'


# BOZEN-2016

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --output "../DATA/segmentation/test/bozen-2016/" \
  '../DATA/READ-Bozen-2016-PublicData/Validation/page/*.xml'

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --output "../DATA/segmentation/train/bozen-2016/" \
  '../DATA/READ-Bozen-2016-PublicData/Training/page/*.xml'


# NewsEye AS

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --output "../DATA/segmentation/train/newseye-as/" \
  '../DATA/NewsEye-AS-TrainOnly/*Training*/*.xml'

# ICPR 2020

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --output "../DATA/segmentation/train/icpr-2020/" \
  '../DATA/ICPR-2020-NewsEye-Text-Block-Segmentation/*train*/xmls/*.xml' \
  '../DATA/ICPR-2020-NewsEye-Text-Block-Segmentation/*train*/images/*.*'

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --output "../DATA/segmentation/test/icpr-2020/" \
  '../DATA/ICPR-2020-NewsEye-Text-Block-Segmentation/*test*/xmls/*.xml' \
  '../DATA/ICPR-2020-NewsEye-Text-Block-Segmentation/*test*/images/*.*'


# NewsEye ATR

node --trace-warnings ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --output "../DATA/segmentation/train/newseye-atr" \
  '../DATA/NewsEye-ATR/*Training*/fk*.xml'


node --trace-warnings ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --output "../DATA/segmentation/test/newseye-atr/" \
  '../DATA/NewsEye-ATR/*Validation*/*.xml'


# NewsEye ONB

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --output "../DATA/segmentation/train/newseye-onb/" \
  '../DATA/NewsEye-ONB/*Training*/*.xml'

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --output "../DATA/segmentation/test/newseye-onb/" \
  '../DATA/NewsEye-ONB/*Validation*/*.xml'
