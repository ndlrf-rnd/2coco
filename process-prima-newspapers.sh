set -ex

export OUTPUT_DIR='../progress-segment/data/train/prima-newspapers/'
rm -rf "${OUTPUT_DIR}"

export JOBS="${JOBS:-4}"

node 2coco.js \
  --output-max-dpi 100 \
  --default-dpi 300 \
  '../newspapers/datasets/prima_newspapers/pc-????????.xml' \
  --output "${OUTPUT_DIR}"
