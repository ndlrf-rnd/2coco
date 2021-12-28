set -ex

export JOBS="${JOBS:-10}"

# Retropress Validation

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --no-skeleton \
  --categories Table \
  --categories Figure \
  --categories Separator \
  --categories TextParagraph \
  --categories TextSpecial \
  --mask-categories Advertisement \
 --output "../newspapers/DATA/osr/val/retropress" \
  '../newspapers/retropress-val/**/*.xml'

# PRImA Layout analysis

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --no-skeleton \
  --categories Table \
  --categories Figure \
  --categories Separator \
  --categories TextParagraph \
  --categories TextSpecial \
  --mask-categories Advertisement \
  --output "../newspapers/DATA/osr/train/prima-layout-analysis" \
  '../DATA/PRImA-LayoutAnalysisDataset/pc-????????.xml'


# BnL newspapers highest variance 05 dataset

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --no-skeleton \
  --categories Table \
  --categories Figure \
  --categories Separator \
  --categories TextParagraph \
  --categories TextSpecial \
  --mask-categories Advertisement \
 --output "../newspapers/DATA/osr/train/bnl-set05/" \
  '../DATA/BNL/set05-different-newspapers/**/*mets.xml'


# PRImA Newspapers

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --no-skeleton \
  --categories Table \
  --categories Figure \
  --categories Separator \
  --categories TextParagraph \
  --categories TextSpecial \
  --mask-categories Advertisement \
  --output "../newspapers/DATA/osr/train/prima-newspapers/" \
  '../DATA/Prima-Newspapers/pc-????????.xml'

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --no-skeleton \
  --categories Table \
  --categories Figure \
  --categories Separator \
  --categories TextParagraph \
  --categories TextSpecial \
  --mask-categories Advertisement \
 --output "../newspapers/DATA/osr/test/prima-newspapers/" \
  '../DATA/Prima-Newspapers/prima_newspapers_test/pc-????????.xml'


# NewsEye ONB

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --no-skeleton \
  --categories Table \
  --categories Figure \
  --categories Separator \
  --categories TextParagraph \
  --categories TextSpecial \
  --mask-categories Advertisement \
  --output "../newspapers/DATA/osr/train/newseye-onb/" \
  '../DATA/NewsEye-ONB/*Training*/*.xml'

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --no-skeleton \
  --categories Table \
  --categories Figure \
  --categories Separator \
  --categories TextParagraph \
  --categories TextSpecial \
  --mask-categories Advertisement \
  --output "../newspapers/DATA/osr/test/newseye-onb/" \
  '../DATA/NewsEye-ONB/*Validation*/*.xml'


# NewsEye AS

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --no-skeleton \
  --categories Table \
  --categories Figure \
  --categories Separator \
  --categories TextParagraph \
  --categories TextSpecial \
  --mask-categories Advertisement \
  --output "../newspapers/DATA/osr/train/newseye-as/" \
  '../DATA/NewsEye-AS-TrainOnly/*Training*/*.xml'


# ICPR 2020

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --no-skeleton \
  --categories Table \
  --categories Figure \
  --categories Separator \
  --categories TextParagraph \
  --categories TextSpecial \
  --mask-categories Advertisement \
  --output "../newspapers/DATA/osr/train/icpr-2020/" \
  '../DATA/ICPR-2020-NewsEye-Text-Block-DATA/osr/*train*/xmls/*.xml' \
  '../DATA/ICPR-2020-NewsEye-Text-Block-DATA/osr/*train*/images/*.*'

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --no-skeleton \
  --categories Table \
  --categories Figure \
  --categories Separator \
  --categories TextParagraph \
  --categories TextSpecial \
  --mask-categories Advertisement \
 --output "../newspapers/DATA/osr/test/icpr-2020/" \
  '../DATA/ICPR-2020-NewsEye-Text-Block-DATA/osr/*test*/xmls/*.xml' \
  '../DATA/ICPR-2020-NewsEye-Text-Block-DATA/osr/*test*/images/*.*'


# NewsEye ATR

node --trace-warnings ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --no-skeleton \
  --categories Table \
  --categories Figure \
  --categories Separator \
  --categories TextParagraph \
  --categories TextSpecial \
  --mask-categories Advertisement \
  --output "../newspapers/DATA/osr/train/newseye-atr" \
  '../DATA/NewsEye-ATR/*Training*/fk*.xml'


node --trace-warnings ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --no-skeleton \
  --categories Table \
  --categories Figure \
  --categories Separator \
  --categories TextParagraph \
  --categories TextSpecial \
  --mask-categories Advertisement \
  --output "../newspapers/DATA/osr/test/newseye-atr/" \
  '../DATA/NewsEye-ATR/*Validation*/*.xml'


# NewsEye ONB

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --no-skeleton \
  --categories Table \
  --categories Figure \
  --categories Separator \
  --categories TextParagraph \
  --categories TextSpecial \
  --mask-categories Advertisement \
  --output "../newspapers/DATA/osr/train/newseye-onb/" \
  '../DATA/NewsEye-ONB/*Training*/*.xml'

node ./2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --no-skeleton \
  --categories Table \
  --categories Figure \
  --categories Separator \
  --categories TextParagraph \
  --categories TextSpecial \
  --mask-categories Advertisement \
  --output "../newspapers/DATA/osr/test/newseye-onb/" \
  '../DATA/NewsEye-ONB/*Validation*/*.xml'


# OCR-D

node 2coco.js \
  --output-max-dpi 300 \
  --default-dpi 300 \
  --no-borders \
  --no-skeleton \
  --categories Table \
  --categories Figure \
  --categories Separator \
  --categories TextParagraph \
  --categories TextSpecial \
  --mask-categories Advertisement \
  --output "../newspapers/DATA/osr/train/ocr-d-gt/" \
  '../DATA/ocr-d-groundtruth/*.ocrd/data/*mets.xml'
