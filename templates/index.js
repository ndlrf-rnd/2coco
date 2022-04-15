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

const refreshLazyLoading = () => {
  if (!lazyObserver) {
    lazyObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting === true) {
          entry.target.setAttribute('src', entry.target.getAttribute('data-src'));
          lazyObserver.unobserve(entry.target);
          entry.target.className = entry.target.className.split(' ').filter(c => c !== 'lazy').join(' ');
        }
      });
    }, { threshold: [0], rootMargin: '300px' });
  }
  document.body.querySelectorAll('img.lazy').forEach(n => {
    lazyObserver.unobserve(n);
    lazyObserver.observe(n);
  });
};

const getWrappedImage = (item, lazy = true) => {
  const imgWrapperEl = document.createElement('div');
  imgWrapperEl.className = 'image-wrapper';
  // imgWrapperEl.id = item.name;

  const imgEl = document.createElement('img');

  if (lazy) {
    imgWrapperEl.innerHTML = [
      `<div class="image-placeholder"><img alt="${item.name}" class="lazy mask" data-src="${item.maskThumbUrl}" src="${PLACEHOLDER_IMAGE_URL}" loading="lazy"/></div>`,
      `<div class="image-placeholder"><img alt="${item.name}" class="lazy underlay" data-src="${item.thumbUrl}" src="${PLACEHOLDER_IMAGE_URL}"  loading="lazy"/></div>`,
    ].join('');
  } else {
    imgWrapperEl.innerHTML = [
      `<div class="image-placeholder"><img alt="${item.name}" class="mask" data-src="${item.maskThumbUrl}" src="${item.maskThumbUrl}" /></div>`,
      `<div class="image-placeholder"><img alt="${item.name}" class="underlay" data-src="${item.thumbUrl}" src="${item.thumbUrl}" /></div>`,
    ].join('');
  }
  imgWrapperEl.appendChild(imgEl);
  return imgWrapperEl;
};

const selectItem = (cn) => {
  const wrapperEl = cn.parentNode.parentNode;
  wrapperEl.className = [...wrapperEl.className.split(' ').filter(v => v !== 'selected'), 'selected'].join(' ');
  workAreaEl.innerHTML = wrapperEl.outerHTML;
  workAreaEl.querySelectorAll('img').forEach(imEl => {
    imEl.setAttribute('src', (imEl.getAttribute('data-src') || imEl.src).replace(/thumb\//ui, ''));
    imEl.setAttribute('data-src', (imEl.getAttribute('data-src') || imEl.src).replace(/thumb\//ui, ''));
  });
};

const select = (rootEl, item) => {
  rootEl.querySelectorAll('.selected').forEach(cn => {
    cn.className = cn.className.split(' ').filter(c => c !== 'selected').join(' ');
  });
  rootEl.querySelectorAll('img').forEach(
    cnImg => {
      if ((cnImg.alt || '').indexOf(item) !== -1) {
        selectItem(cnImg);
      }
    },
  );
};
const locationHashChanged = () => {
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

  locationHashChanged();
  // previewScrollerEl.querySelector('.selected').scrollIntoView(true);
  refreshLazyLoading();
};
window.addEventListener('hashchange', locationHashChanged);

load().then(() => console.info('Groups are loaded')).catch(console.error);

window.addEventListener('keydown', function (event) {
  if ((event.code === 'ArrowDown') && (event.altKey)) {
    const ns = previewScrollerEl.querySelector('.selected');
    if (ns && ns.nextSibling) {
      select(previewScrollerEl, ns.nextSibling.querySelector('img').alt);
      ns.nextSibling.scrollIntoView(true);
      refreshLazyLoading();
    }
  }
  if ((event.code === 'ArrowUp') && (event.altKey)) {
    const ns = previewScrollerEl.querySelector('.selected');

    if (ns && ns.previousSibling) {
      select(previewScrollerEl, ns.previousSibling.querySelector('img').alt);
      ns.previousSibling.scrollIntoView(true);
      refreshLazyLoading();
    }
  }

}, true);
