set -ex

export OUTPUT_DIR='../progress-segment/data/train/cbad-2017/'
rm -rf "${OUTPUT_DIR}"

export JOBS="${JOBS:-4}"

node 2coco.js \
  --output-max-dpi 200 \
  --default-dpi 300 \
  --key-points \
  '../newspapers/datasets/ICDAR-cBAD-2017-dataset-v4/Train-Baseline Competition - Complex Documents/**/page/*.xml' \
  --output "${OUTPUT_DIR}"
