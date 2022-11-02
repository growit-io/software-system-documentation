// The [original source][1] was modified to disable the Chrome sandbox, for
// now, as I couldn't figure out how to easily set up the sandbox so that it
// works with both Docker for Mac and on Linux, but at least for Linux there's
// an example in [Puppeteer's troubleshooting guide[[2].
//
// [1]: https://github.com/structurizr/puppeteer/blob/master/export-diagrams-lite.js
// [2]: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#setting-up-chrome-linux-sandbox

const puppeteer = require('puppeteer');
const fs = require('fs');

if (process.argv.length < 4) {
  console.log("Please specify a Structurizr URL, output format (PNG or SVG), and optional diagram key.");
  console.log("Usage: <structurizrUrl> <png|svg> [diagram key]")
  process.exit(1);
}

const structurizrUrl = process.argv[2];

const format = process.argv[3];
if (format !== 'png' && format !== 'svg') {
  console.log("The output format must be png or svg.");
  process.exit(1);
}

var browser;
var diagramKeys = [];
var expectedNumberOfExports = 0;
var actualNumberOfExports = 0;

const url = structurizrUrl + '/workspace/diagrams';

const filenameSuffix = 'structurizr-';

(async () => {
  browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: true,

    args: [
      // Disable Chrome sandbox until someone figures out how to make the
      // sandbox setup work in Docker for Mac and on Linux.
      '--no-sandbox', '--disable-setuid-sandbox',

      // Sometimes this script fails in GitHub Actions with the error:
      //
      //    ProtocolError: Protocol error (Runtime.callFunctionOn):
      //    Target closed.
      //
      // I'm too lazy to debug that issue right now, so this is just to
      // be proactive about avoiding a potential out of memory situation.
      //
      // This is also recommended by the Puppeteer troubleshooting guide.
      //
      // ref: https://github.com/puppeteer/puppeteer/issues/1175#issuecomment-369728215
      '--disable-dev-shm-usage',
    ],
  });  
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  await page.exposeFunction('savePNG', (content, filename) => {
    console.log("Writing " + filename);
    content = content.replace(/^data:image\/png;base64,/, "");
    fs.writeFile(filename, content, 'base64', function (err) {
      if (err) throw err;
    });

    actualNumberOfExports++;

    if (actualNumberOfExports === expectedNumberOfExports) {
      browser.close();
    }
  });

  await page.waitForFunction('structurizr.scripting && structurizr.scripting.isDiagramRendered() === true');

  // figure out which views should be exported
  if (process.argv[4] !== undefined) {
    console.log(process.argv[4]);

    diagramKeys.push(process.argv[4]);
    expectedNumberOfExports++;
  } else {
    const views = await page.evaluate(() => {
      return structurizr.scripting.getViews();
    });
  
    views.forEach(function(view) {
      diagramKeys.push(view.key);
      expectedNumberOfExports++;
    });
  }

  // every diagram has a key/legend
  expectedNumberOfExports = (expectedNumberOfExports * 2);

  for (var i = 0; i < diagramKeys.length; i++) {
    var diagramKey = diagramKeys[i];

    await page.evaluate((diagramKey) => {
      structurizr.scripting.changeView(diagramKey);
    }, diagramKey);

    await page.waitForFunction('structurizr.scripting.isDiagramRendered() === true');

    if (format === "svg") {
      const diagramFilename = filenameSuffix + diagramKey + '.svg';
      const diagramKeyFilename = filenameSuffix + diagramKey + '-key.svg'

      var svgForDiagram = await page.evaluate(() => {
        return structurizr.scripting.exportCurrentDiagramToSVG();
      });
    
      console.log("Writing " + diagramFilename);
      fs.writeFile(diagramFilename, svgForDiagram, function (err) {
        if (err) throw err;
      });
      actualNumberOfExports++;
    
      var svgForKey = await page.evaluate(() => {
        return structurizr.scripting.exportCurrentDiagramKeyToSVG();
      });
    
      console.log("Writing " + diagramKeyFilename);
      fs.writeFile(diagramKeyFilename, svgForKey, function (err) {
        if (err) throw err;
      });
      actualNumberOfExports++;
    } else {
      const diagramFilename = filenameSuffix + diagramKey + '.png';
      const diagramKeyFilename = filenameSuffix + diagramKey + '-key.png'

      page.evaluate((diagramFilename) => {
        structurizr.scripting.exportCurrentDiagramToPNG({ crop: false }, function(png) {
          window.savePNG(png, diagramFilename);
        })
      }, diagramFilename);

      page.evaluate((diagramKeyFilename) => {
        structurizr.scripting.exportCurrentDiagramKeyToPNG(function(png) {
          window.savePNG(png, diagramKeyFilename);
        })
      }, diagramKeyFilename);
    }
  }
    
  if (actualNumberOfExports === expectedNumberOfExports) {
    console.log('bye');

    browser.close();
  }
})();
