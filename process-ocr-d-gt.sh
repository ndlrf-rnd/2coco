set -ex

export OUTPUT_DIR='../progress-segment/data/train/ocr-d-gt/'
rm -rf "${OUTPUT_DIR}"

export JOBS="${JOBS:-8}"

node 2coco.js \
  --output-max-dpi 200 \
  --default-dpi 300 \
  '../newspapers/datasets/ocr-d-groundtruth/*.ocrd/data/*mets.xml' \
  --output "${OUTPUT_DIR}"
