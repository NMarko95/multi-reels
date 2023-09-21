const fs = require("fs");

let data;

const makeBuild = () => {
  fs.readdir("./javascript", (e, files) => {
    if (e) return console.error(e);
    files.forEach((file) => {
      fs.open(`./javascript/${file}`, "r+", function (error, fd) {
        if (error) {
          return console.error(error);
        }
        data = fs.readFileSync(fd);
        fs.appendFileSync("./build/build.js", data);
      });
    });
  });
};

makeBuild();
