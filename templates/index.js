// const CONFIG_URI = 'static/openseadragon.config.json';

// window.setTimeout(() => {
const toolbarEl = document.createElement('div');
toolbarEl.setAttribute('id', 'toolbarDiv');
toolbarEl.className = 'toolbar';
toolbarEl.innerHTML = `<span>
  | <a id="zoom-in" href="#zoom-in">Zoom In</a> 
  | <a id="zoom-out" href="#zoom-out">Zoom Out</a>
  | <a id="home" href="#home">Home</a> 
  | <a id="toggle-overlay" href="#toggle-overlay" class="toggle-overlay">Toggle layers (current: Image + Mask)</a>

  | <a id="full-page" href="#full-page">Full Page</a> 
        </span>` + `<span>
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
  showReferenceStrip: true,
  referenceStripPosition: 4,
  referenceStripScroll: 'vertical',
  autoResize: true,
  navigatorAutoResize: true,
  opacity: 1.0,
  autoHideControls: false,
  placeholderFillStyle: '#888888',
  ...window.CONFIG,
});

/*
document.querySelector('#toggle-overlay').addEventListener('click', function() {
    if (overlay) {
        viewer.removeOverlay("runtime-overlay");
    } else {
        var elt = document.createElement("div");
        elt.id = "runtime-overlay";
        elt.className = "highlight";
        viewer.addOverlay({
            element: elt,
            location: new OpenSeadragon.Rect(0.33, 0.75, 0.2, 0.25)
        });
    }
    overlay = !overlay;
});
*/
viewer.addHandler('open', (target) => {
  window.console.log('in open handler', target);
  const { source } = target;
  // if(startState) {
  viewer.addTiledImage({
    opacity: 1.0,
	// Valid values are 'source-over', 'source-atop', 'source-in', 'source-out', 'destination-over', 'destination-atop', 'destination-in', 'destination-out', 'lighter', 'copy' or 'xor',
	compositeOperation: 'screen',  
	tileSource: {
      url: source.url.replace(/\.[^\/.]+$/uig, '_GT.png'),
      width: source.width,
      height: source.height,
      type: 'image',
      title: source.url,
      x: 0,
      Y: 0,
    },
    x: 0,
    y: 0,
  });
});


var selectedIndex = 2;

toolbarEl.querySelector('#toggle-overlay').addEventListener('click', function(el) {
    selectedIndex = (selectedIndex + 1) % 3;  
	if (selectedIndex == 2) {
		viewer.world.getItemAt(0).setOpacity(1);
		viewer.world.getItemAt(1).setOpacity(1);
	} else {
		viewer.world.getItemAt(0).setOpacity(selectedIndex === 0 ? 1 : 0);
		viewer.world.getItemAt(1).setOpacity(selectedIndex === 1 ? 1 : 0);
	}
	
	
	if (selectedIndex === 0) {
		toolbarEl.querySelector('#toggle-overlay').innerHTML = 'Toggle layers (current: Image)';
	} else if (selectedIndex === 1) {
		toolbarEl.querySelector('#toggle-overlay').innerHTML = 'Toggle layers (current: Mask)';
	} else {
		toolbarEl.querySelector('#toggle-overlay').innerHTML = 'Toggle layers (current: Image + Mask)';
	}
});

/*
var fade = function(image, targetOpacity) {
    var currentOpacity = image.getOpacity();
    var step = (targetOpacity - currentOpacity) / 10;
    if (step === 0) {
        return;
    }

    var frame = function() {
        currentOpacity += step;
        if ((step > 0 && currentOpacity >= targetOpacity) || (step < 0 && currentOpacity <= targetOpacity)) {
            image.setOpacity(targetOpacity);
            return;
        }

        image.setOpacity(currentOpacity);
        OpenSeadragon.requestAnimationFrame(frame);
    };
 
    OpenSeadragon.requestAnimationFrame(frame);
};
*/