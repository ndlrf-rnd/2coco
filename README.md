# 2coco

Utility to convert common digitization formats to [COCO dataset format](https://cocodataset.org/) that is common and
convenient for training ML visual tasks like: 

- characters recognition
- graphical elements recognition
- text in natural scene detection
- structural elements detection 
- document segmentation
- structural elements captioning
- text strings baseline detection

and much more.

It supports convertation from:

- [METS](http://www.loc.gov/standards/mets/)
- [ALTO](http://www.loc.gov/standards/alto/)
- [PAGE.XML](http://www.primaresearch.org/publications/ICPR2010_Pletschacher_PAGE) ([GitHub](https://github.com/PRImA-Research-Lab/PAGE-XML))

## Usage

```shell
$ npm install
$ node ./2coco.js './folder/with/mets/**/*.xml' './folder/with/page.xml/*.xml'' -o ./output/folder/
```

## COCO Format short description

[COCO Documentation](https://cocodataset.org/#format-data)

### COCO - Annotations

```
annotations: [
  {
    id: int,
    image_id: int,
    category_id: int,
    segmentation: RLE | [polygon],
    area: float,
    bbox: [
      x: int,
      y: int,
      width: int,
      height: int
    ],
    iscrowd: int 0 | 1,
  },
  ...
]
```

### COCO - Categories

```
categories: [
  {
    id: int,
    name: str,
    supercategory: str,
  },
  ...
]
```

### COCO - Polygon

Polygon stored as 2D list:

```
[
  [
    x1: int,
    y1: int,
    x2: int,
    y2: int,
    ...
  ],
  [
    x1: int,
    y1: int,
    ...
  ],
  ...
]
```
