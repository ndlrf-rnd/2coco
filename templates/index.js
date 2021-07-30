// const CONFIG_URI = 'static/openseadragon.config.json';

// window.setTimeout(() => {
const toolbarEl = document.createElement('div');
toolbarEl.setAttribute('id', 'toolbarDiv');
toolbarEl.className = 'toolbar';
toolbarEl.innerHTML = `<span style='float:right;margin:10px 20px 0 0'>
  | <a id="zoom-in" href="#zoom-in">Zoom In</a> 
  | <a id="zoom-out" href="#zoom-out">Zoom Out</a>
  | <a id="home" href="#home">Home</a> 
  | <a id="full-page" href="#full-page">Full Page</a> 
        </span>` + `<span style='float:left;margin:10px 0 0 20px'>
  &lt;&nbsp;
      <a id="previous" href="#previous-page">Previous</a> 
      | <a id="next" href="#next-page">Next</a> 
      &nbsp;&gt;
  </span>`;
      // <span id='currentpage'> 1 of 3 </span>
document.body.appendChild(toolbarEl);

const osdEl = document.createElement('div');
osdEl.setAttribute('id', 'openseadragon1');
osdEl.setAttribute('class', 'container');
document.body.appendChild(osdEl);

console.info(`Initializing app...`);
const viewer = OpenSeadragon({
  id: 'openseadragon1',
  prefixUrl: 'static/openseadragon/images/',
  sequenceMode: true,
  zoomInButton: 'zoom-in',
  zoomOutButton: 'zoom-out',
  homeButton: 'home',
  fullPageButton: 'full-page',
  nextButton: 'next',
  previousButton: 'previous',

  /*
     RIGHT:        4,
      BOTTOM_RIGHT: 5,
      BOTTOM:       6,
      BOTTOM_LEFT:  7,
      LEFT:         8,
   */
  // referenceStripSizeRatio: 0.1,
  showReferenceStrip: true,
  referenceStripPosition: 4,
  referenceStripScroll: 'vertical',
  autoResize: true,
  navigatorAutoResize: true,

  ...window.CONFIG,
});
viewer.addHandler('open', (target) => {
  window.console.log('in open handler', target);
  const { source } = target;
  // if(startState) {
  viewer.addTiledImage({
    tileSource: {
      url: source.url.replace(/\.[^\/.]+$/uig, '_GT.png'),
      width: source.width,
      height: source.height,
      type: 'image',
      title: source.url,
      x: 0,
      Y: 0,
      // opacity: 0.5,
    },
    x: 0,
    y: 0,
    // width: 1,
    // height: 1,
  });
  // startState=false;
});

// },
// );
// }, 100);
// });
