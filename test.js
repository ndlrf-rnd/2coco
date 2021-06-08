const {getColorForId} = require("./colors");
const renderC = c =>process.stdout.write(
  `${c}\trgb(${
              c //(c % 3) && (c % 2) ? 0 : 128
            },${
              ((c + 1) % 3) && ((c + 1) % 2) ? 0 : 255
            },${
              ((c + 2) % 3) && ((c + 2) % 2) ? 0 : 255
            })\n`
)
for (let c =0 ; c< 8; c+=1) {
  process.stderr.write(`${c}\t${getColorForId(c)}
`);
}
