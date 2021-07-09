set -ex


export JOBS="${JOBS:-6}"

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --no-masks \
  --categories TextLine \
  --output "../DATA/text-baselines/test/" \
  '../DATA/ICDAR2019-cBAD-dataset-blind/eval/page/*.xml' \
  '../DATA/ICDAR-cBAD-2017-dataset-v4/Test-Baseline Competition - Simple Documents/**/page/*.xml' \
  '../DATA/ICDAR-cBAD-2017-dataset-v4/Test-Baseline Competition - Complex Documents/**/page/*.xml' \
  '../DATA/READ-Bozen-2016-PublicData/Validation/page/*.xml'

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-fill \
  --no-masks \
  --categories TextLine \
  --output "../DATA/text-baselines/train/" \
  '../DATA/ICDAR-cBAD-2017-dataset-v4/Train-Baseline Competition - Simple Documents/**/page/*.xml' \
  '../DATA/ICDAR-cBAD-2017-dataset-v4/Train-Baseline Competition - Complex Documents/**/page/*.xml' \
  '../DATA/ICDAR2019-cBAD-dataset-blind/train/page/*.xml' \
  '../DATA/READ-Bozen-2016-PublicData/Training/page/*.xml'
