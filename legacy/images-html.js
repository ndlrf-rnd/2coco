const imagesHtml = (await cpMap(
  images,
  async ({
      file_name,
      id,
      width,
      height,
    },
  ) => {
    const globPath = path.join(
      masksDir,
      path.basename(file_name).replace(
        /[.][^.\\\/]+$/ui,
        `_GT.*`,
      ),
    );
    const maskFilePath = (await pGlob(globPath)).sort()[0];
    const maskFileName = path.basename(maskFilePath);
    const imageFileName = path.basename(file_name);
    //.split(/[\/\\]/).slice(-1)[0].replace(/\.[^\/\\.]+$/, '_GT0.png'))

    const imgDataUrl = `data:image/png;base64,${
      (await sharp(fs.readFileSync(file_name))
          .resize({
            width: 512,
            height: 512,
            kernel: sharp.kernel.lanczos3,
            fit: sharp.fit.inside,
            position: sharp.strategy.center,
          })
          .withMetadata({ density: 96 })
          .toBuffer()
      ).toString('base64')
    }`;

    const maskDataUrl = `data:image/png;base64,${
      (await sharp(fs.readFileSync(maskFilePath))
          .resize({
            width: 512,
            height: 512,
            kernel: sharp.kernel.nearest,
            fit: sharp.fit.inside,
            position: sharp.strategy.center,
          })
          .withMetadata({ density: 96 })
          .toBuffer()
      ).toString('base64')
    }`;

    return `<div
            class="block"
            id="preview-${imageFileName}" 
            style="background-image: url('${imgDataUrl}')"
         ><img
           alt="${id} ${maskFileName}"
           class="mask"
           src="${maskDataUrl}"
           id="mask-${id}"
         /><div>${imageFileName}</div></div>`;
  },
)).join('\n');
