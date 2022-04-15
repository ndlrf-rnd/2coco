const path = require('path');
const fs = require('fs');

const makeHtmlPlain = async (images, masksDir) => {

  const staticDir = path.join(masksDir, 'static');
  fs.mkdirSync(staticDir, { recursive: true });

  const resultHtml = `<!DOCTYPE HTML>
<html lang="ru-RU">
<head>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>COCO dataset masks preview (${masksDir})</title>
    <link rel="stylesheet" href="./static/style.css">
    <style>
    </style>
    <body>
    <script lang="JavaScript">
        /* 
          window.IMAGES = [
            {
              url,
              maskUrl,
              id,
              width,
              height,
            },
            ...
          ]
        */
        window.IMAGES = ${
    JSON.stringify(
      images.map(
        ({ file_name, thumb_file_name, mask_file_name, mask_thumb_file_name, id, width, height }) => ({
          url: path.basename(file_name),
          ...(thumb_file_name ? { thumbUrl: path.relative(path.dirname(mask_file_name), thumb_file_name) } : {}),
          ...(mask_file_name ? { maskUrl: path.basename(mask_file_name) } : {}),
          ...(mask_thumb_file_name ? { maskThumbUrl: path.relative(path.dirname(mask_file_name), mask_thumb_file_name) } : {}),
          name: path.basename(file_name, path.extname(file_name)),
          id,
          width,
          height,
        }),
      ),
      null,
      2,
    ).replace('\n', '\n            ')
  }
    </script>
    <div id="app" class="app">
      <div id="preview-scroller" class="vertical"></div>
      <div id="work-area" class="work-area">
    </div>
  </div>

    <script type="text/javascript" src="static/index.js"/></script>
 </body>
</html>`;

  const htmlPath = path.join(masksDir, `index.html`);
  fs.writeFileSync(htmlPath, resultHtml, 'utf-8');

  const staticDstDir = path.join(path.dirname(htmlPath), 'static');
  fs.mkdirSync(staticDstDir, { recursive: true });

  // Copy common assets
  fs.copyFileSync(
    path.join(__dirname, 'templates', 'style.css'),
    path.join(staticDstDir, 'style.css'),
  );

  fs.copyFileSync(
    path.join(__dirname, 'templates', 'index.js'),
    path.join(staticDstDir, 'index.js'),
  );

  fs.copyFileSync(
    path.join(__dirname, 'templates', 'paper.png'),
    path.join(staticDstDir, 'paper.png'),
  );

};

module.exports = {
  makeHtmlPlain,
};
