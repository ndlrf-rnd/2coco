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

## License note

(Лицензия и авторские права)

### Russian
Данные в этом репозиторри являются интеллектуальной собственности, относящейся к ФГИС "[Национальная электронная библиотека Российсокй Федерации](https://rusneb.ru)" (оператор: [Российская государственная библиотека](https://rsl.ru)) и размещены в публичный доступ на условиях описанных в типовой СПО лицензии [**Apache License 2.0**](LICENSE)

### English
All rights reserved 2019-2021 (c) [National electronic library of Russian Federation](https://rusneb.ru)
This project's source code is licensed under the terms of Apache License 2.0.

## Owl

```
   ◯  .       .        .           .     *     .
 .  .     .      ___---===(OvO)===---___  .      °     *
                  .              
,~^~,   .      .     ◯         .            .      ,~^~^^                
    ~^\$~^~~^#*~-^\_  __ _ _ _ _ ____/*-~^~~^^~^##~^~^
```
