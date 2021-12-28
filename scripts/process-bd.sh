set -ex

export JOBS="${JOBS:-12}"


node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --categories TextLine \
    --output "../newspapers/DATA/bd/train/cbad-2019/" \
  '../DATA/ICDAR-2019-cBAD-dataset-blind/train/page/*.xml' \
  '../DATA/ICDAR-2019-cBAD-dataset-blind/train/*.*'

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
    --output "../newspapers/DATA/bd/test/cbad-2019/" \
  '../DATA/ICDAR-2019-cBAD-dataset-blind/eval/page/*.xml' \
  '../DATA/ICDAR-2019-cBAD-dataset-blind/eval/*.*'

# CBAD 2017

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --categories TextLine \
    --output "../newspapers/DATA/bd/train/cbad-2017/" \
  '../DATA/ICDAR-cBAD-2017-dataset-v4/Train-Baseline Competition*/**/page/*.xml'

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --categories TextLine \
    --output "../newspapers/DATA/bd/test/cbad-2017/" \
  '../DATA/ICDAR-cBAD-2017-dataset-v4/Test-Baseline Competition*/**/page/*.xml'

# NewsEye AS
node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --categories TextLine \
    --output "../newspapers/DATA/bd/train/newseye-as/" \
  '../DATA/NewsEye-AS-TrainOnly/*Training*/*.xml'


# BOZEN-2016

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
    --output "../newspapers/DATA/bd/test/bozen-2016/" \
  '../DATA/READ-Bozen-2016-PublicData/Validation/page/*.xml'

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
    --output "../newspapers/DATA/bd/train/bozen-2016/" \
  '../DATA/READ-Bozen-2016-PublicData/Training/page/*.xml'


# ICPR 2020

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
    --output "../newspapers/DATA/bd/train/icpr-2020/" \
  '../DATA/ICPR-2020-NewsEye-Text-Block-Segmentation/*train*/xmls/*.xml' \
  '../DATA/ICPR-2020-NewsEye-Text-Block-Segmentation/*train*/images/*.*'

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
    --output "../newspapers/DATA/bd/test/icpr-2020/" \
  '../DATA/ICPR-2020-NewsEye-Text-Block-Segmentation/*test*/xmls/*.xml' \
  '../DATA/ICPR-2020-NewsEye-Text-Block-Segmentation/*test*/images/*.*'


# NewsEye ATR

node --trace-warnings ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
    --output "../newspapers/DATA/bd/train/newseye-atr" \
  '../DATA/NewsEye-ATR/*Training*/fk*.xml'


node --trace-warnings ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
    --output "../newspapers/DATA/bd/test/newseye-atr/" \
  '../DATA/NewsEye-ATR/*Validation*/*.xml'


# NewsEye ONB

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
    --output "../newspapers/DATA/bd/train/newseye-onb/" \
  '../DATA/NewsEye-ONB/*Training*/*.xml'

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
    --output "../newspapers/DATA/bd/test/newseye-onb/" \
  '../DATA/NewsEye-ONB/*Validation*/*.xml'
