set -ex

export OUTPUT_DIR='../progress-segment/data/val/retropress'
rm -rf "${OUTPUT_DIR}"

export JOBS="${JOBS:-8}"

node 2coco.js \
  --output-max-dpi 200 \
  --default-dpi 300 \
  '../newspapers/datasets/retropress-val/*/*.xml' \
  --output "${OUTPUT_DIR}"
