let lazyObserver = null;

const PLACEHOLDER_IMAGE_URL = 'static/paper.png';

const previewScrollerEl = document.getElementById('preview-scroller');

const workAreaEl = document.getElementById('work-area');

workAreaEl.onclick = () => {
  const nameChunks = workAreaEl.className.split(' ');
  const filteredNameChunks = nameChunks.filter(v => v.toLocaleLowerCase() !== 'zoom');
  if (filteredNameChunks.length === nameChunks.length) {
    filteredNameChunks.push('zoom');
  }
  workAreaEl.className = filteredNameChunks.join(' ');
};

let throttleTimeout;
const THROTTLE_MS = 500;

const getWrappedImage = (item) => {
  const imgWrapperEl = document.createElement('a');
  imgWrapperEl.className = 'image-wrapper';
  // imgWrapperEl.id = item.name;
  imgWrapperEl.href = `#${item.name}`;

  const imgEl = document.createElement('img');

  imgWrapperEl.innerHTML = [
    `<div class="image-placeholder"><img alt="${item.name}" class="mask" src="${item.maskThumbUrl}"/></div>`,
    `<div class="image-placeholder"><img alt="${item.name}" class="underlay" src="${item.thumbUrl}"/></div>`,
  ].join('');
  imgWrapperEl.appendChild(imgEl);
  return imgWrapperEl;
};

const selectItem = (cn) => {
  const wrapperEl = cn.parentNode.parentNode;
  wrapperEl.className = [...wrapperEl.className.split(' ').filter(v => v !== 'selected'), 'selected'].join(' ');
  workAreaEl.innerHTML = wrapperEl.outerHTML;
  workAreaEl.querySelector('.image-wrapper');
  if (throttleTimeout) {
    window.clearTimeout(throttleTimeout);
  }
  throttleTimeout = window.setTimeout(() => {
    window.clearTimeout(throttleTimeout);
    throttleTimeout = null;
    workAreaEl.querySelectorAll('img').forEach(imEl => {
      imEl.setAttribute('src', (imEl.getAttribute('src') || imEl.src).replace(/thumb\//ui, ''));
    });
  }, THROTTLE_MS);

};

const select = (rootEl, item) => {
  rootEl.querySelectorAll('.selected').forEach(cn => {
    cn.className = cn.className.split(' ').filter(c => c !== 'selected').join(' ');
  });
  rootEl.querySelectorAll('img').forEach(
    cnImg => {
      if ((cnImg.alt || '').indexOf(item) !== -1) {
        cnImg.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        selectItem(cnImg);
      }
    },
  );
};
const locationHashChanged = (e) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }
  let item = window.location.hash.replace(/#/uig, '');
  if ((item.length === 0) && window.IMAGES && (window.IMAGES.length > 0)) {
    window.location.hash = `#${window.IMAGES[0].name}`;
  } else {
    return select(previewScrollerEl, item);
  }
};

const load = async () => {

  previewScrollerEl.innerHTML = '';
  (window.IMAGES || []).forEach(item => {
    const imgWrapperEl = getWrappedImage(item, true);
    previewScrollerEl.appendChild(imgWrapperEl);

    imgWrapperEl.onclick = ((name) => () => {
      if (!window.location.hash.startsWith(name)) {
        window.location.hash = `#${name}`;
      }
    })(item.name);
  });
  previewScrollerEl.focus();
  locationHashChanged();

};
window.addEventListener('hashchange', locationHashChanged, false);

load().then(() => console.info('Groups are loaded')).catch(console.error);

window.addEventListener('keydown', function (event) {
  if ((event.code === 'ArrowDown') && (event.altKey)) {
    const ns = previewScrollerEl.querySelector('.selected');
    if (ns && ns.nextSibling) {
      window.location.hash = `#${ns.nextSibling.querySelector('img').alt}`;
    }
  }
  if ((event.code === 'ArrowUp') && (event.altKey)) {
    const ns = previewScrollerEl.querySelector('.selected');

    if (ns && ns.previousSibling) {
      window.location.hash = `#${ns.previousSibling.querySelector('img').alt}`;
    }
  }

}, true);
