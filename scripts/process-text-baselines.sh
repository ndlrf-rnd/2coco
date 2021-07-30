set -ex

export JOBS="${JOBS:-4}"

# NewsEye AS

node ./2coco.js \
  --output-max-dpi 150 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
  --lines-width 3 \
  --output "../DATA/text-baselines/train/newseye-as/" \
  '../DATA/NewsEye-AS-TrainOnly/*Training*/*.xml'

exit 0
node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
  --lines-width 5 \
  --output "../DATA/text-baselines/train/newseye-as-300dpi/" \
  '../DATA/NewsEye-AS-TrainOnly/*Training*/*.xml'


# CBAD 2019

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
  --output "../DATA/text-baselines/train/cbad-2019/" \
  '../DATA/ICDAR-2019-cBAD-dataset-blind/train/page/*.xml' \
  '../DATA/ICDAR-2019-cBAD-dataset-blind/train/*.*'

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
  --output "../DATA/text-baselines/test/cbad-2019/" \
  '../DATA/ICDAR-2019-cBAD-dataset-blind/eval/page/*.xml' \
  '../DATA/ICDAR-2019-cBAD-dataset-blind/eval/*.*'


# CBAD 2017

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
  --output "../DATA/text-baselines/train/cbad-2017/" \
  '../DATA/ICDAR-cBAD-2017-dataset-v4/Train-Baseline Competition*/**/page/*.xml'

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
  --output "../DATA/text-baselines/test/cbad-2017/" \
  '../DATA/ICDAR-cBAD-2017-dataset-v4/Test-Baseline Competition*/**/page/*.xml'


# BOZEN-2016

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
  --output "../DATA/text-baselines/test/bozen-2016/" \
  '../DATA/READ-Bozen-2016-PublicData/Validation/page/*.xml'

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
  --output "../DATA/text-baselines/train/bozen-2016/" \
  '../DATA/READ-Bozen-2016-PublicData/Training/page/*.xml'


# ICPR 2020

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
  --output "../DATA/text-baselines/train/icpr-2020/" \
  '../DATA/ICPR-2020-NewsEye-Text-Block-Segmentation/*train*/xmls/*.xml' \
  '../DATA/ICPR-2020-NewsEye-Text-Block-Segmentation/*train*/images/*.*'

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
  --output "../DATA/text-baselines/test/icpr-2020/" \
  '../DATA/ICPR-2020-NewsEye-Text-Block-Segmentation/*test*/xmls/*.xml' \
  '../DATA/ICPR-2020-NewsEye-Text-Block-Segmentation/*test*/images/*.*'


# NewsEye ATR

node --trace-warnings ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
  --output "../DATA/text-baselines/train/newseye-atr" \
  '../DATA/NewsEye-ATR/*Training*/fk*.xml'


node --trace-warnings ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
  --output "../DATA/text-baselines/test/newseye-atr/" \
  '../DATA/NewsEye-ATR/*Validation*/*.xml'


# NewsEye ONB

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
  --output "../DATA/text-baselines/train/newseye-onb/" \
  '../DATA/NewsEye-ONB/*Training*/*.xml'

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
  --output "../DATA/text-baselines/test/newseye-onb/" \
  '../DATA/NewsEye-ONB/*Validation*/*.xml'
