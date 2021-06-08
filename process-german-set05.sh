set -ex

export OUTPUT_DIR='../progress-segment/data/train/german-newspapers-set05/'
rm -rf "${OUTPUT_DIR}"

export JOBS="${JOBS:-8}"

node 2coco.js \
  --output-max-dpi 200 \
  --default-dpi 300 \
  '../newspapers/datasets/german-newspapers-set05-different-newspapers/**/*mets.xml' \
  --output "${OUTPUT_DIR}"

