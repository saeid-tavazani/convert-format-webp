const fs = require("fs");
const path = require("path");
const webp = require("webp-converter");

function convertToWebP(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    fs.readFile(inputPath, (error, data) => {
      if (error) {
        reject(error);
      } else {
        webp
          .buffer2webpbuffer(data, "jpg", "-q 1", {
            tempPath: "/output",
          })
          .then((result) => {
            fs.writeFile(outputPath, result, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
      }
    });
  });
}

function processFiles(directoryPath, outputDirectory) {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error(err);
    } else {
      console.log("\nConverting files to WebP:");
      files.forEach((file) => {
        const inputPath = path.join(directoryPath, file);
        const outputFileName =
          path.basename(file, path.extname(file)) + ".webp";
        const outputPath = path.join(outputDirectory, outputFileName);

        convertToWebP(inputPath, outputPath)
          .then(() => {
            console.log(`Converted ${file} to WebP: ${outputPath}`);
          })
          .catch((error) => {
            console.error(`Error converting ${file} to WebP: ${error.message}`);
          });
      });
    }
  });
}

const inputDirectory = path.join(__dirname, "files");
const outputDirectory = path.join(__dirname, "output");

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
}

processFiles(inputDirectory, outputDirectory);
