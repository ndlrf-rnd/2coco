const {COLORS} = require("./colors");

const CATEGORY_TEXT_BLOCK = 'TextBlock';
const CATEGORY_TABLE = 'Table';
const CATEGORY_FIGURE = 'Figure';
const CATEGORY_SEPARATOR = 'Separator';
const CATEGORY_PRINT_SPACE = 'PrintSpace';
const CATEGORY_PARAGRAPH = 'Paragraph';
const CATEGORY_TEXT_LINE = 'TextLine';
const CATEGORY_WORD = 'Word';
const CATEGORY_GLYPH = 'Glyph';


const CATEGORIES = {
  [CATEGORY_PRINT_SPACE]: {
    name: CATEGORY_PRINT_SPACE,
    supercategory: CATEGORY_PRINT_SPACE,
    id: 1,
    color: COLORS.grey['800'],
  },
  [CATEGORY_TABLE]: {
    name: CATEGORY_TABLE,
    supercategory: CATEGORY_TABLE,
    id: 2,
    color: COLORS.green['700']
  },
  [CATEGORY_FIGURE]: {
    name: CATEGORY_FIGURE,
    supercategory: CATEGORY_FIGURE,
    id: 3,
    color: COLORS.amber['700']
  },
  [CATEGORY_SEPARATOR]: {
    name: CATEGORY_SEPARATOR,
    supercategory: CATEGORY_SEPARATOR,
    id: 4,
    color: COLORS.red['500'],
    // skeleton_color: 'transparent',
  },
  [CATEGORY_TEXT_BLOCK]: {
    name: CATEGORY_TEXT_BLOCK,
    supercategory: CATEGORY_TEXT_BLOCK,
    id: 5,
    // color: 'transparent',
    skeleton_color: COLORS.lightBlue['500']
  },
  [CATEGORY_PARAGRAPH]: {
    name: CATEGORY_PARAGRAPH,
    supercategory: CATEGORY_PARAGRAPH,
    id: 6,
    // color: 'transparent',
    border_color: COLORS.cyan['500']
  },
  [CATEGORY_TEXT_LINE]: {
    name: CATEGORY_TEXT_LINE,
    supercategory: CATEGORY_TEXT_LINE,
    // keypoints: ['baseline_left', 'baseline_right'],
    // skeleton: [[1, 2]],
    id: 7,
    color: COLORS.teal['700'],
    skeleton_color: COLORS.teal['500'],
    border_v_color: COLORS.teal['300'],
    // border_h_color: COLORS.teal['100'],
  },
  [CATEGORY_WORD]: {
    name: CATEGORY_WORD,
    supercategory: CATEGORY_WORD,
    // keypoints: ['baseline_left', 'baseline_right'],
    // skeleton: [[1, 2]],
    id: 8,
    color: COLORS.indigo['700'],
    skeleton_color: COLORS.indigo['500'],
    border_v_color: COLORS.indigo['300'],
    border_h_color: COLORS.indigo['100'],
  },
  [CATEGORY_GLYPH]: {
    name: CATEGORY_GLYPH,
    supercategory: CATEGORY_GLYPH,
    // keypoints: ['baseline_left', 'baseline_right'],
    // skeleton: [[1, 2]],
    id: 9,
    color: COLORS.blue['700'],
    skeleton_color: COLORS.blue['500'],
    border_v_color: COLORS.blue['300'],
    border_h_color: COLORS.blue['100'],
  },
}

const CATEGORY_HIDDEN = null;




// const CATEGORIES_WITH_BASELINE = [
//   CATEGORY_TEXT_LINE,
//   CATEGORY_WORD,
//   CATEGORY_GLYPH
// ];
const CATEGORIES_MAPPING = {
  Border: CATEGORY_PRINT_SPACE,
  PrintSpace: CATEGORY_PRINT_SPACE,
  // Page.xml
  Background: CATEGORY_HIDDEN,
  NoiseRegion: CATEGORY_HIDDEN,
  UnknownRegion: CATEGORY_HIDDEN,
  // ComposedBlock: CATEGORY_TEXT_BLOCK,
  // Grey
  Text: CATEGORY_TEXT_BLOCK,
  // HEADING: CATEGORY_TEXT_BLOCK,
  OVERLINE: CATEGORY_TEXT_BLOCK,
  GraphicalElement: CATEGORY_SEPARATOR,
  // PUBLISHING_STMT: CATEGORY_TEXT_BLOCK,
  // HEADLINE: CATEGORY_TEXT_BLOCK,
  // TITLE_SECTION: CATEGORY_TEXT_BLOCK,
  TextRegion: {
    paragraph: CATEGORY_TEXT_BLOCK,
    heading: CATEGORY_TEXT_BLOCK,
    caption: CATEGORY_TEXT_BLOCK,
    header: CATEGORY_TEXT_BLOCK,
    footer: CATEGORY_TEXT_BLOCK,
    "page-number": CATEGORY_TEXT_BLOCK,
    "drop-capital": CATEGORY_HIDDEN,
    credit: CATEGORY_TEXT_BLOCK,
    floating: CATEGORY_TEXT_BLOCK,
    "signature-mark": CATEGORY_TEXT_BLOCK,
    "catch-word": CATEGORY_TEXT_BLOCK,
    marginalia: CATEGORY_TEXT_BLOCK,
    footnote: CATEGORY_TEXT_BLOCK,
    "footnote-continued": CATEGORY_TEXT_BLOCK,
    endnote: CATEGORY_TEXT_BLOCK,
    "TOC-entry": CATEGORY_TABLE,
    "list-label": CATEGORY_TEXT_BLOCK,
    other: CATEGORY_TEXT_BLOCK,
  },
  Word: CATEGORY_WORD,
  // TextLine: CATEGORY_TEXT_LINE,
  Paragraph: CATEGORY_TEXT_BLOCK,
  TableRegion: CATEGORY_TABLE,
  GraphicRegion: {
    logo: CATEGORY_FIGURE,
    letterhead: CATEGORY_FIGURE,
    decoration: CATEGORY_SEPARATOR,
    frame: CATEGORY_SEPARATOR,
    'handwritten-annotation': CATEGORY_TEXT_BLOCK,
    stamp: CATEGORY_FIGURE,
    signature: CATEGORY_FIGURE,
    barcode: CATEGORY_FIGURE,
    'paper-grow': CATEGORY_FIGURE,
    'punch-hole': CATEGORY_FIGURE,
    other: CATEGORY_FIGURE,
  },
  ImageRegion: CATEGORY_FIGURE,
  AdvertRegion: CATEGORY_FIGURE,

  SeparatorRegion: CATEGORY_SEPARATOR,

  MusicRegion: CATEGORY_FIGURE,
  ChemRegion: CATEGORY_FIGURE,
  MathsRegion: CATEGORY_FIGURE,

  ChartRegion: {
    bar: CATEGORY_FIGURE,
    line: CATEGORY_FIGURE,
    pie: CATEGORY_FIGURE,
    scatter: CATEGORY_FIGURE,
    surface: CATEGORY_FIGURE,
    other: CATEGORY_FIGURE,
  },
  LineDrawingRegion: CATEGORY_FIGURE,

  // METS

  HEADING: CATEGORY_TEXT_BLOCK, // # group
  AUTHOR: CATEGORY_TEXT_BLOCK,
  TITLE: CATEGORY_TEXT_BLOCK,
  TITLE_SECTION: CATEGORY_TEXT_BLOCK,  // group

  PUBLISHING_STMT: CATEGORY_TEXT_BLOCK,
  HEADLINE: CATEGORY_TEXT_BLOCK,
  SUBHEADLINE: CATEGORY_TEXT_BLOCK,
  MOTTO: CATEGORY_TEXT_BLOCK,

  IMAGE: CATEGORY_FIGURE,

  TABLE: CATEGORY_TABLE,  // group

  TEXT: CATEGORY_TEXT_BLOCK,
  TEXTBLOCK: CATEGORY_TEXT_BLOCK,
  ADVERTISEMENT: CATEGORY_FIGURE,
  ISSUE: CATEGORY_TEXT_BLOCK,
  /*
  # mets_region_type_to_outline = {
  #     # TITLE_SECTION: CATEGORY_TEXT_BLOCK,
  #     # SECTION: CATEGORY_TEXT_BLOCK,
  #     # ISSUE: CATEGORY_TEXT_BLOCK,
  #     # PARAGRAPH: CATEGORY_TEXT_BLOCK,
  #     # PARAGRAPH: CATEGORY_BACKGROUND,
  #     # TEXTBLOCK: CATEGORY_BACKGROUND,
  #     # TEXT: CATEGORY_TEXT_BLOCK,
  #     # TEXT: CATEGORY_BACKGROUND,
  #     # PAGE: CATEGORY_BACKGROUND,
  #     # OVERLINE: CATEGORY_TEXT_BLOCK,
  #     # CAPTION: CATEGORY_TEXT_BLOCK,
  #     # SUBHEADLINE: CATEGORY_TEXT_BLOCK,
  #     # TABLE: CATEGORY_TABLE,
  #     # CompleteObject: CATEGORY_BACKGROUND,
  #     # PUBLISHING_STMT: CATEGORY_TEXT_BLOCK,
  #     # ISSUE: CATEGORY_TEXT_BLOCK,
  #     # Newspaper: None,
  #     # IMAGE: CATEGORY_ADVERTISEMENT,
  #     # CONTENT: None,
  #     # TITLE: CATEGORY_TEXT_BLOCK,
  #     # BODY: None,
  #     # HEADLINE: CATEGORY_TEXT_BLOCK,
  #     # VOLUME: CATEGORY_TEXT_BLOCK,
  #     # PARAGRAPH: CATEGORY_TEXT_BLOCK,
  #     # ARTICLE: CATEGORY_TEXT_BLOCK,
  #     # AUTHOR: CATEGORY_TEXT_BLOCK,
  #     # TEXTBLOCK: CATEGORY_TEXT_BLOCK,
  #     # BODY_CONTENT: None,
  #     # TEXT: CATEGORY_TEXT_BLOCK
  #     # === 5 ====
  #     CONTENT: CATEGORY_TEXT_BLOCK,
  #     TITLE_SECTION: CATEGORY_TEXT_BLOCK,
  #     ARTICLE: CATEGORY_ADVERTISEMENT,
  #     SECTION: CATEGORY_ADVERTISEMENT,
  #     # === 6 ====
  #     BODY: CATEGORY_TEXT_BLOCK,
  #     HEADING: CATEGORY_TEXT_BLOCK,
  #     # === 8 ====
  #     BODY_CONTENT: CATEGORY_TEXT_BLOCK,
  #     OVERLINE: CATEGORY_TEXT_BLOCK,
  #     TABLE: CATEGORY_TABLE,
  # }
  */

  // ALTO
  CompleteObject: CATEGORY_HIDDEN,
  TopMargin: CATEGORY_HIDDEN,
  RightMargin: CATEGORY_HIDDEN,
  BottomMargin: CATEGORY_HIDDEN,
  LeftMargin: CATEGORY_HIDDEN,
  // PrintSpace: CATEGORY_PRINT_SPACE,

  Page: CATEGORY_PRINT_SPACE,
  // NoiseRegion: CATEGORY_HIDDEN,
  // UnknownRegion: CATEGORY_HIDDEN,
  TextLine: CATEGORY_TEXT_LINE,
  // TextString: CATEGORY_TEXT_LINE,
  String: CATEGORY_TEXT_BLOCK,
  TextBlock: CATEGORY_TEXT_BLOCK,
  Tables: CATEGORY_TABLE,
  // GraphicalElement: CATEGORY_FIGURE,
  Illustration: CATEGORY_FIGURE,
  // SeparatorRegion: CATEGORY_SEPARATOR,

  // MusicRegion: CATEGORY_FIGURE,
  // ChemRegion: CATEGORY_FIGURE,
  // MathsRegion: CATEGORY_FIGURE,
  // ChartRegion: CATEGORY_FIGURE,
  // LineDrawingRegion: CATEGORY_FIGURE

}

module.exports = {
  CATEGORIES,
  CATEGORIES_MAPPING,
  CATEGORY_TEXT_LINE,
  CATEGORY_PRINT_SPACE,
}
