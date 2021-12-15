const { COLORS, CLASS_COLORS } = require('./colors');

const CATEGORY_TEXT_PARAGRAPH = 'TextParagraph';
const CATEGORY_TEXT_SPECIAL = 'TextSpecial';
const CATEGORY_TABLE = 'Table';
const CATEGORY_FIGURE = 'Figure';
const CATEGORY_SEPARATOR = 'Separator';
const CATEGORY_BORDER = 'Border';
const CATEGORY_PRINT_SPACE = 'PrintSpace';
const CATEGORY_TEXT_LINE = 'TextLine';
const CATEGORY_WORD = 'Word';
const CATEGORY_GLYPH = 'Glyph';
const CATEGORY_ADVERTISEMENT = 'Advertisement';

const CATEGORIES = {
  [CATEGORY_PRINT_SPACE]: {
    name: CATEGORY_PRINT_SPACE,
    supercategory: CATEGORY_PRINT_SPACE,
    id: 1,
    color: CLASS_COLORS.PrintSpace,
  },
  [CATEGORY_BORDER]: {
    name: CATEGORY_BORDER,
    supercategory: CATEGORY_BORDER,
    id: 2,
    color: CLASS_COLORS.Border,
  },
  [CATEGORY_TEXT_PARAGRAPH]: {
    name: CATEGORY_TEXT_PARAGRAPH,
    supercategory: CATEGORY_TEXT_PARAGRAPH,
    id: 10,
    // color: 'transparent',
    color: CLASS_COLORS.TextParagraph,
    // skeleton_color: CLASS_COLORS.TextRegion,
  },
  [CATEGORY_TEXT_SPECIAL]: {
    name: CATEGORY_TEXT_SPECIAL,
    supercategory: CATEGORY_TEXT_SPECIAL,
    id: 11,
    // color: 'transparent',
    color: CLASS_COLORS.TextSpecial,
    // skeleton_color: CLASS_COLORS.TextRegion,
  },
  [CATEGORY_TEXT_LINE]: {
    name: CATEGORY_TEXT_LINE,
    supercategory: CATEGORY_TEXT_LINE,
    // keypoints: ['baseline_left', 'baseline_right'],
    // skeleton: [[1, 2]],
    id: 12,
    // color: COLORS.green['400'], // NO FILL
    skeleton_color: CLASS_COLORS.BaseLine,
    border_v_color: CLASS_COLORS.TextLine,
    // border_h_color: COLORS.teal['100'],
  },
  [CATEGORY_WORD]: {
    name: CATEGORY_WORD,
    supercategory: CATEGORY_WORD,
    // keypoints: ['baseline_left', 'baseline_right'],
    // skeleton: [[1, 2]],
    id: 13,
    // color: COLORS.indigo['500'], // NO FILL
    // skeleton_color: CLASS_COLORS.Word,//COLORS.indigo['700'],
    border_color: COLORS.Word,
  },
  [CATEGORY_GLYPH]: {
    name: CATEGORY_GLYPH,
    supercategory: CATEGORY_GLYPH,
    // keypoints: ['baseline_left', 'baseline_right'],
    // skeleton: [[1, 2]],
    id: 14,
    // color: COLORS.blue['500'], // NO FILL
    border_color: CLASS_COLORS.Glyph,//COLORS.blue['700'],
    // border_v_color: COLORS.blue['300'],
    // border_h_color: COLORS.blue['100'],
  },
  [CATEGORY_SEPARATOR]: {
    name: CATEGORY_SEPARATOR,
    supercategory: CATEGORY_SEPARATOR,
    id: 20,
    color: CLASS_COLORS.SeparatorRegion,
    // skeleton_color: 'transparent',
  },
    [CATEGORY_FIGURE]: {
    name: CATEGORY_FIGURE,
    supercategory: CATEGORY_FIGURE,
    id: 21,
    color: CLASS_COLORS.ImageRegion,
  },
  [CATEGORY_TABLE]: {
    name: CATEGORY_TABLE,
    supercategory: CATEGORY_TABLE,
    id: 30,
    color: CLASS_COLORS.TableRegion,
  },
  [CATEGORY_ADVERTISEMENT]: {
    name: CATEGORY_ADVERTISEMENT,
    supercategory: CATEGORY_ADVERTISEMENT,
    // keypoints: ['baseline_left', 'baseline_right'],
    // skeleton: [[1, 2]],
    id: 999,
    color: COLORS.yellow['500'], // NO FILL
    // border_color: CLASS_COLORS.AdvertRegion,//COLORS.blue['700'],
    // border_v_color: COLORS.blue['300'],
    // border_h_color: COLORS.blue['100'],
  },
};

const CATEGORY_HIDDEN = null;

const CATEGORIES_MAPPING = {
  Border: CATEGORY_BORDER,
  PrintSpace: CATEGORY_PRINT_SPACE,
  // Page.xml
  Background: CATEGORY_HIDDEN,
  NoiseRegion: CATEGORY_HIDDEN,
  UnknownRegion: CATEGORY_HIDDEN,
  // ComposedBlock: CATEGORY_TEXT_PARAGRAPH,
  // Grey
  Text: CATEGORY_TEXT_PARAGRAPH,
  // HEADING: CATEGORY_TEXT_PARAGRAPH,
  OVERLINE: CATEGORY_TEXT_PARAGRAPH,
  GraphicalElement: CATEGORY_SEPARATOR,
  // PUBLISHING_STMT: CATEGORY_TEXT_PARAGRAPH,
  // HEADLINE: CATEGORY_TEXT_PARAGRAPH,
  // TITLE_SECTION: CATEGORY_TEXT_PARAGRAPH,
  TextRegion: {
    paragraph: CATEGORY_TEXT_PARAGRAPH,
    heading: CATEGORY_TEXT_SPECIAL,
    caption: CATEGORY_TEXT_SPECIAL,
    header: CATEGORY_TEXT_SPECIAL,
    footer: CATEGORY_TEXT_SPECIAL,
    'page-number': CATEGORY_TEXT_SPECIAL,
    'drop-capital': CATEGORY_HIDDEN, // CATEGORY_TEXT_PARAGRAPH
    credit: CATEGORY_TEXT_SPECIAL,
    floating: CATEGORY_TEXT_PARAGRAPH,
    'signature-mark': CATEGORY_TEXT_SPECIAL,
    'catch-word': CATEGORY_TEXT_SPECIAL,
    marginalia: CATEGORY_TEXT_PARAGRAPH,
    footnote: CATEGORY_TEXT_PARAGRAPH,
    'footnote-continued': CATEGORY_TEXT_PARAGRAPH,
    endnote: CATEGORY_TEXT_PARAGRAPH,
    'TOC-entry': CATEGORY_TABLE,
    'list-label': CATEGORY_TEXT_PARAGRAPH,
    other: CATEGORY_TEXT_PARAGRAPH,
  },
  Word: CATEGORY_WORD,
  // TextLine: CATEGORY_TEXT_LINE,
  Paragraph: CATEGORY_TEXT_PARAGRAPH,
  TableRegion: CATEGORY_TABLE,
  GraphicRegion: {
    logo: CATEGORY_FIGURE,
    letterhead: CATEGORY_FIGURE,
    decoration: CATEGORY_SEPARATOR,
    frame: CATEGORY_SEPARATOR,
    'handwritten-annotation': CATEGORY_TEXT_PARAGRAPH,
    stamp: CATEGORY_FIGURE,
    signature: CATEGORY_FIGURE,
    barcode: CATEGORY_FIGURE,
    'paper-grow': CATEGORY_FIGURE,
    'punch-hole': CATEGORY_FIGURE,
    other: CATEGORY_FIGURE,
  },
  ImageRegion: CATEGORY_FIGURE,
  AdvertRegion: CATEGORY_ADVERTISEMENT,

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

  HEADING: CATEGORY_TEXT_SPECIAL, // # group
  AUTHOR: CATEGORY_TEXT_SPECIAL,
  TITLE: CATEGORY_TEXT_SPECIAL,
  TITLE_SECTION: CATEGORY_TEXT_SPECIAL,  // group

  PUBLISHING_STMT: CATEGORY_TEXT_PARAGRAPH,
  HEADLINE: CATEGORY_TEXT_SPECIAL,
  SUBHEADLINE: CATEGORY_TEXT_SPECIAL,
  MOTTO: CATEGORY_TEXT_SPECIAL,

  IMAGE: CATEGORY_FIGURE,

  TABLE: CATEGORY_TABLE,  // group
  Table: CATEGORY_TABLE,  // group

  TEXT: CATEGORY_TEXT_PARAGRAPH,
  TEXTBLOCK: CATEGORY_TEXT_PARAGRAPH,
  ADVERTISEMENT: CATEGORY_ADVERTISEMENT,
  ISSUE: CATEGORY_TEXT_PARAGRAPH,
  /*
  # mets_region_type_to_outline = {
  #     # TITLE_SECTION: CATEGORY_TEXT_PARAGRAPH,
  #     # SECTION: CATEGORY_TEXT_PARAGRAPH,
  #     # ISSUE: CATEGORY_TEXT_PARAGRAPH,
  #     # PARAGRAPH: CATEGORY_TEXT_PARAGRAPH,
  #     # PARAGRAPH: CATEGORY_BACKGROUND,
  #     # TEXTBLOCK: CATEGORY_BACKGROUND,
  #     # TEXT: CATEGORY_TEXT_PARAGRAPH,
  #     # TEXT: CATEGORY_BACKGROUND,
  #     # PAGE: CATEGORY_BACKGROUND,
  #     # OVERLINE: CATEGORY_TEXT_PARAGRAPH,
  #     # CAPTION: CATEGORY_TEXT_PARAGRAPH,
  #     # SUBHEADLINE: CATEGORY_TEXT_PARAGRAPH,
  #     # TABLE: CATEGORY_TABLE,
  #     # CompleteObject: CATEGORY_BACKGROUND,
  #     # PUBLISHING_STMT: CATEGORY_TEXT_PARAGRAPH,
  #     # ISSUE: CATEGORY_TEXT_PARAGRAPH,
  #     # Newspaper: None,
  #     # IMAGE: CATEGORY_ADVERTISEMENT,
  #     # CONTENT: None,
  #     # TITLE: CATEGORY_TEXT_PARAGRAPH,
  #     # BODY: None,
  #     # HEADLINE: CATEGORY_TEXT_PARAGRAPH,
  #     # VOLUME: CATEGORY_TEXT_PARAGRAPH,
  #     # PARAGRAPH: CATEGORY_TEXT_PARAGRAPH,
  #     # ARTICLE: CATEGORY_TEXT_PARAGRAPH,
  #     # AUTHOR: CATEGORY_TEXT_PARAGRAPH,
  #     # TEXTBLOCK: CATEGORY_TEXT_PARAGRAPH,
  #     # BODY_CONTENT: None,
  #     # TEXT: CATEGORY_TEXT_PARAGRAPH
  #     # === 5 ====
  #     CONTENT: CATEGORY_TEXT_PARAGRAPH,
  #     TITLE_SECTION: CATEGORY_TEXT_PARAGRAPH,
  #     ARTICLE: CATEGORY_ADVERTISEMENT,
  #     SECTION: CATEGORY_ADVERTISEMENT,
  #     # === 6 ====
  #     BODY: CATEGORY_TEXT_PARAGRAPH,
  #     HEADING: CATEGORY_TEXT_PARAGRAPH,
  #     # === 8 ====
  #     BODY_CONTENT: CATEGORY_TEXT_PARAGRAPH,
  #     OVERLINE: CATEGORY_TEXT_PARAGRAPH,
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
  String: CATEGORY_TEXT_PARAGRAPH,
  TextBlock: CATEGORY_TEXT_PARAGRAPH,
  Tables: CATEGORY_TABLE,
  // GraphicalElement: CATEGORY_FIGURE,
  Illustration: CATEGORY_FIGURE,
  // SeparatorRegion: CATEGORY_SEPARATOR,

  // MusicRegion: CATEGORY_FIGURE,
  // ChemRegion: CATEGORY_FIGURE,
  // MathsRegion: CATEGORY_FIGURE,
  // ChartRegion: CATEGORY_FIGURE,
  // LineDrawingRegion: CATEGORY_FIGURE

};

module.exports = {
  CATEGORIES,
  CATEGORIES_MAPPING,
  CATEGORY_TEXT_LINE,
  CATEGORY_PRINT_SPACE,
};
