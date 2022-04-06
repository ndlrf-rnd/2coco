const { COLORS, CLASS_COLORS } = require('./colors');

const CATEGORY_TEXT_PARAGRAPH = 'text';
const CATEGORY_MIXED = 'mixed';
const CATEGORY_TABLE = 'table';
const CATEGORY_GRAPHICS = 'graphics';
const CATEGORY_BORDER = 'border';
const CATEGORY_PRINT_SPACE = 'print_space';
const CATEGORY_TEXT_LINE = 'text_line';
const CATEGORY_WORD = 'word';
const CATEGORY_GLYPH = 'glyph';
const CATEGORY_ADVERTISEMENT = 'advertisement';
// const CATEGORY_TEXT_PARAGRAPH = 'TextParagraph';
// const CATEGORY_MIXED = 'TextSpecial';
// const CATEGORY_TABLE = 'Table';
// const CATEGORY_GRAPHICS = 'Graphics';
// const CATEGORY_BORDER = 'Border';
// const CATEGORY_PRINT_SPACE = 'PrintSpace';
// const CATEGORY_TEXT_LINE = 'TextLine';
// const CATEGORY_WORD = 'Word';
// const CATEGORY_GLYPH = 'Glyph';
// const CATEGORY_ADVERTISEMENT = 'Advertisement';

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
    color: CLASS_COLORS.TextParagraph,
  },
  [CATEGORY_MIXED]: {
    name: CATEGORY_MIXED,
    supercategory: CATEGORY_MIXED,
    id: 11,
    color: CLASS_COLORS.TextSpecial,
  },
  [CATEGORY_TEXT_LINE]: {
    name: CATEGORY_TEXT_LINE,
    supercategory: CATEGORY_TEXT_LINE,
    id: 12,
    skeleton_color: CLASS_COLORS.BaseLine,
    border_v_color: CLASS_COLORS.TextLine,
  },
  [CATEGORY_WORD]: {
    name: CATEGORY_WORD,
    supercategory: CATEGORY_WORD,
    id: 13,
    border_color: COLORS.Word,
  },
  [CATEGORY_GLYPH]: {
    name: CATEGORY_GLYPH,
    supercategory: CATEGORY_GLYPH,
    id: 14,
    border_color: CLASS_COLORS.Glyph,//COLORS.blue['700'],
  },
  [CATEGORY_GRAPHICS]: {
    name: CATEGORY_GRAPHICS,
    supercategory: CATEGORY_GRAPHICS,
    id: 20,
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
    id: 40,
    color: COLORS.yellow['500'], // NO FILL
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
  GraphicalElement: CATEGORY_GRAPHICS,
  // PUBLISHING_STMT: CATEGORY_TEXT_PARAGRAPH,
  // HEADLINE: CATEGORY_TEXT_PARAGRAPH,
  // TITLE_SECTION: CATEGORY_TEXT_PARAGRAPH,
  TextRegion: {
    paragraph: CATEGORY_TEXT_PARAGRAPH,
    heading: CATEGORY_MIXED,
    caption: CATEGORY_MIXED,
    header: CATEGORY_MIXED,
    footer: CATEGORY_MIXED,
    'page-number': CATEGORY_MIXED,
    'drop-capital': CATEGORY_MIXED, // CATEGORY_TEXT_PARAGRAPH
    credit: CATEGORY_MIXED,
    floating: CATEGORY_TEXT_PARAGRAPH,
    'signature-mark': CATEGORY_MIXED,
    'catch-word': CATEGORY_MIXED,
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
    logo: CATEGORY_GRAPHICS,
    letterhead: CATEGORY_GRAPHICS,
    decoration: CATEGORY_GRAPHICS,
    frame: CATEGORY_GRAPHICS,
    'handwritten-annotation': CATEGORY_TEXT_PARAGRAPH,
    stamp: CATEGORY_GRAPHICS,
    signature: CATEGORY_GRAPHICS,
    barcode: CATEGORY_GRAPHICS,
    'paper-grow': CATEGORY_GRAPHICS,
    'punch-hole': CATEGORY_GRAPHICS,
    other: CATEGORY_GRAPHICS,
  },
  ImageRegion: CATEGORY_GRAPHICS,
  AdvertRegion: CATEGORY_ADVERTISEMENT,

  SeparatorRegion: CATEGORY_GRAPHICS,

  MusicRegion: CATEGORY_GRAPHICS,
  ChemRegion: CATEGORY_GRAPHICS,
  MathsRegion: CATEGORY_GRAPHICS,

  ChartRegion: {
    bar: CATEGORY_GRAPHICS,
    line: CATEGORY_GRAPHICS,
    pie: CATEGORY_GRAPHICS,
    scatter: CATEGORY_GRAPHICS,
    surface: CATEGORY_GRAPHICS,
    other: CATEGORY_GRAPHICS,
  },
  LineDrawingRegion: CATEGORY_GRAPHICS,

  // METS

  HEADING: CATEGORY_MIXED, // # group
  AUTHOR: CATEGORY_MIXED,
  TITLE: CATEGORY_MIXED,
  TITLE_SECTION: CATEGORY_MIXED,  // group

  PUBLISHING_STMT: CATEGORY_TEXT_PARAGRAPH,
  HEADLINE: CATEGORY_MIXED,
  SUBHEADLINE: CATEGORY_MIXED,
  MOTTO: CATEGORY_MIXED,

  IMAGE: CATEGORY_GRAPHICS,

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
  // GraphicalElement: CATEGORY_GRAPHICS,
  Illustration: CATEGORY_GRAPHICS,
  // SeparatorRegion: CATEGORY_GRAPHICS,

  // MusicRegion: CATEGORY_GRAPHICS,
  // ChemRegion: CATEGORY_GRAPHICS,
  // MathsRegion: CATEGORY_GRAPHICS,
  // ChartRegion: CATEGORY_GRAPHICS,
  // LineDrawingRegion: CATEGORY_GRAPHICS

};

module.exports = {
  CATEGORIES,
  CATEGORIES_MAPPING,
  CATEGORY_TEXT_LINE,
  CATEGORY_PRINT_SPACE,
};
