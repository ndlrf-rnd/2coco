set -ex

export JOBS="${JOBS:-12}"

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --img-prefix '../img' \
  --img-suffix '.path' \
  --categories TextLine \
  --output "../DATA/bd/pero_layout/train/" \
  '../DATA/pero_layout/train/page/*.xml'

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --img-prefix '../img' \
  --img-suffix '.path' \
  --categories TextLine \
  --output '../DATA/bd/pero_layout/test/' \
  '../DATA/pero_layout/test/page/*.xml'

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --img-prefix '..' \
  --categories TextLine \
  --output "../DATA/bd/cbad-2019/train/" \
  '../DATA/ICDAR-2019-cBAD-dataset-blind/train/page/*.xml' \
  '../DATA/ICDAR-2019-cBAD-dataset-blind/train/*.*'

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --img-prefix '..' \
  --categories TextLine \
  --output "../DATA/bd/cbad-2019/test/" \
  '../DATA/ICDAR-2019-cBAD-dataset-blind/eval/page/*.xml' \
  '../DATA/ICDAR-2019-cBAD-dataset-blind/eval/*.*'

# CBAD 2017

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --img-prefix '..' \
  --categories TextLine \
  --output "../DATA/bd/cbad-2017/train/" \
  '../DATA/ICDAR-cBAD-2017-dataset-v4/Train-Baseline Competition*/**/page/*.xml'

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --img-prefix '..' \
  --categories TextLine \
    --output "../DATA/bd/cbad-2017/test/" \
  '../DATA/ICDAR-cBAD-2017-dataset-v4/Test-Baseline Competition*/**/page/*.xml'

# NewsEye AS
node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
    --output "../DATA/bd/newseye-as/train/" \
  '../DATA/NewsEye-AS-TrainOnly/*Training*/*.xml'


# BOZEN-2016

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
    --output "../DATA/bd/bozen-2016/test/" \
  '../DATA/READ-Bozen-2016-PublicData/Validation/page/*.xml'

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
    --output "../DATA/bd/bozen-2016/train/" \
  '../DATA/READ-Bozen-2016-PublicData/Training/page/*.xml'


# ICPR 2020

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
    --output "../DATA/bd/icpr-2020/train/" \
  '../DATA/ICPR-2020-NewsEye-Text-Block-Segmentation/*train*/xmls/*.xml' \
  '../DATA/ICPR-2020-NewsEye-Text-Block-Segmentation/*train*/images/*.*'

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
    --output "../DATA/bd/icpr-2020/test/" \
  '../DATA/ICPR-2020-NewsEye-Text-Block-Segmentation/*test*/xmls/*.xml' \
  '../DATA/ICPR-2020-NewsEye-Text-Block-Segmentation/*test*/images/*.*'


# NewsEye ATR

node --trace-warnings ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
    --output "../DATA/bd/newseye-atr/train/" \
  '../DATA/NewsEye-ATR/*Training*/fk*.xml'


node --trace-warnings ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
    --output "../DATA/bd/newseye-atr/test/" \
  '../DATA/NewsEye-ATR/*Validation*/*.xml'


# NewsEye ONB

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
    --output "../DATA/bd/newseye-onb/train/" \
  '../DATA/NewsEye-ONB/*Training*/*.xml'

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --categories TextLine \
    --output "../DATA/bd/newseye-onb/test/" \
  '../DATA/NewsEye-ONB/*Validation*/*.xml'
