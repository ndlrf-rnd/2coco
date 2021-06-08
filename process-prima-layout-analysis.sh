set -ex

export OUTPUT_DIR='../progress-segment/data/train/prima-layout-analysis'
rm -rf "${OUTPUT_DIR}"

export JOBS="${JOBS:-8}"

node 2coco.js \
  --output-max-dpi 100 \
  --default-dpi 300 \
  '../newspapers/datasets/PRImA_LayoutAnalysisDataset/data/pc-????????.xml' \
  --output "${OUTPUT_DIR}"
