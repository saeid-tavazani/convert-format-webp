const fs = require("fs");
const path = require("path");
const webp = require("webp-converter");

// تابعی که یک فایل را به فرمت WebP تبدیل می‌کند
function convertToWebP(inputPath, outputDirectory) {
  return new Promise((resolve, reject) => {
    // خواندن داده‌های فایل ورودی
    fs.readFile(inputPath, (error, data) => {
      if (error) {
        reject(error);
      } else {
        // تعیین نام فایل خروجی و مسیر خروجی
        const outputFileName =
          path.basename(inputPath, path.extname(inputPath)) + ".webp";
        const outputPath = path.join(outputDirectory, outputFileName);
        // تبدیل داده به فرمت WebP
        webp
          .buffer2webpbuffer(data, "jpg", "-q 1", {
            tempPath: "/output",
          })
          .then((result) => {
            // نوشتن فایل خروجی
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

// تابع اصلی برای پردازش فایل‌ها
function processFiles(directoryPath, outputRootDirectory) {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error(err);
    } else {
      console.log("\nConverting files to WebP:");

      // بررسی اینکه آیا مسیر فعلی یک دایرکتوری است یا خیر
      const isDirectory = fs.statSync(directoryPath).isDirectory();

      if (isDirectory) {
        // استفاده از mkdir برای ایجاد دایرکتوری خروجی اگر وجود نداشته باشد
        const baseDirectoryName = path.basename(directoryPath);
        const outputDirectory = path.join(
          outputRootDirectory,
          baseDirectoryName
        );
        fs.mkdir(outputDirectory, { recursive: true }, (err) => {
          if (err) {
            console.error(`Error creating output directory: ${err}`);
          } else {
            // پردازش فایل‌ها در دایرکتوری فعلی
            files.forEach((file) => {
              const inputPath = path.join(directoryPath, file);

              if (fs.statSync(inputPath).isDirectory()) {
                // اگر یک دایرکتوری باشد، به صورت بازگشتی محتوای داخل آن را پردازش کن
                processFiles(inputPath, outputDirectory);
              } else {
                // اگر یک فایل باشد، آن را به فرمت WebP تبدیل کن
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

// مسیر ورودی و خروجی را تعیین کن
const inputDirectory = path.join(__dirname, "files");
const outputRootDirectory = path.join(__dirname, "output");

// ایجاد دایرکتوری خروجی اگر وجود نداشته باشد و شروع پردازش فایل‌ها
fs.mkdir(outputRootDirectory, { recursive: true }, (err) => {
  if (err) {
    console.error(`Error creating output directory: ${err}`);
  } else {
    processFiles(inputDirectory, outputRootDirectory);
  }
});
