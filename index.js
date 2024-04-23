const fs = require("fs");
const path = require("path");
const webp = require("webp-converter");

// Function that converts a file to WebP format
function convertToWebP(inputPath, outputDirectory) {
  return new Promise((resolve, reject) => {
    // Reading data from the input file
    fs.readFile(inputPath, (error, data) => {
      if (error) {
        reject(error);
      } else {
        // Determining the output file name and output path
        const outputFileName =
          path.basename(inputPath, path.extname(inputPath)) + ".webp";
        const outputPath = path.join(outputDirectory, outputFileName);
        // Converting data to WebP format
        webp
          .buffer2webpbuffer(data, "jpg", "-q 1", {
            tempPath: "/output",
          })
          .then((result) => {
            // Writing the output file
            fs.writeFile(outputPath, result, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  });
}

// Main function for processing files
function processFiles(directoryPath, outputRootDirectory) {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error(err);
    } else {
      console.log("\nConverting files to WebP:");

      // Checking if the current path is a directory or not
      const isDirectory = fs.statSync(directoryPath).isDirectory();

      if (isDirectory) {
        // Using mkdir to create the output directory if it doesn't exist
        const baseDirectoryName = path.basename(directoryPath);
        const outputDirectory = path.join(
          outputRootDirectory,
          baseDirectoryName
        );
        fs.mkdir(outputDirectory, { recursive: true }, (err) => {
          if (err) {
            console.error(`Error creating output directory: ${err}`);
          } else {
            // Processing files in the current directory
            files.forEach((file) => {
              const inputPath = path.join(directoryPath, file);

              if (fs.statSync(inputPath).isDirectory()) {
                // If it's a directory, recursively process its contents
                processFiles(inputPath, outputDirectory);
              } else {
                // If it's a file, convert it to WebP format
                if (inputPath.includes("jpg") || inputPath.includes("png")) {
                  convertToWebP(inputPath, outputDirectory)
                    .then(() => {
                      console.log(`Converted ${file} to WebP`);
                    })
                    .catch((error) => {
                      console.error(
                        `Error converting ${file} to WebP: ${error.message}`
                      );
                    });
                }
              }
            });
          }
        });
      }
    }
  });
}

// Set input and output directories
const inputDirectory = path.join(__dirname, "files");
const outputRootDirectory = path.join(__dirname, "output");

// Create the output directory if it doesn't exist and start processing files
fs.mkdir(outputRootDirectory, { recursive: true }, (err) => {
  if (err) {
    console.error(`Error creating output directory: ${err}`);
  } else {
    processFiles(inputDirectory, outputRootDirectory);
  }
});
