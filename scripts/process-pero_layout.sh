set -ex

node 2coco.js \
	--output-max-dpi 300 \
	--default-dpi 300 \
	--no-fill \
	--no-masks \
	--categories TextLine \
	--output "../DATA/bd/pero_layout/train/" \
	'../DATA/pero_layout/train/page/*.xml'

node 2coco.js \
	--output-max-dpi 300 \
	--default-dpi 300 \
	--no-fill \
	--no-masks \
	--categories TextLine \
	--output '../DATA/bd/pero_layout/test/' \
	'../DATA/pero_layout/test/page/*.xml'
	:
