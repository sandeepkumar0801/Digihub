//D:\github\channel_connector-1\node_modules\amazon-sp-api\lib\request.js
const https = require('https');
const { URL } = require('url');

const moment = require('moment');
const fs = require('fs');

module.exports = (req_options) => {
  return new Promise((resolve, reject) => {
    let url = new URL(req_options.url);
    let options = {
      method: req_options.method,
      port: 443,
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: req_options.headers || {}
    };
    let post_params;
    if (req_options.body) {
      post_params = req_options.body;
      options.headers['Content-Length'] = Buffer.byteLength(post_params);
    }

    let requestForlogs = JSON.parse(JSON.stringify(req_options));
    const fname = options.hostname.includes('sellingpartnerapi') ? `${options.hostname}${options.path}` : `${options.hostname}`;
    const now = `${moment().format('YYYYMMDD HHmmss')
      } ${moment().millisecond()}`;

    //  const fileNameReq = `${now}_REQ_${fname}.json`;
    const fileNameRes = `${now}_RES_${fname}.json`;
    //    this.logTofile(fileNameReq, requestForlogs);

    let req = https.request(options, (res) => {
      let chunks = [];
      let body = '';


      res.on('data', (chunk) => {
        body += chunk;
        chunks.push(chunk);
      });
      res.on('end', () => {

        resolve({
          body: body,
          chunks: chunks,
          statusCode: res.statusCode,
          headers: res.headers
        });

        requestForlogs = JSON.parse(JSON.stringify(req_options));
        let responseForLogs = {
          request: requestForlogs,
          response: {
            body: body,
            chunks: chunks,
            statusCode: res.statusCode,
            headers: res.headers
          }
        };
        this.logTofile(fileNameRes, responseForLogs);
      });
    });

    req.on('error', (e) => {
      reject(e);
    });
    if (post_params) {
      req.write(post_params, 'utf8');
    }
    req.end();
  });
};


exports.logTofile = async function (filename, data) {

  try {
    let filePath = process.env.INIT_CWD + '\\files\\amazon-stock-update\\' + filename
      .toString()
      .replaceAll('https://', '')
      .replaceAll('//', '#2FSLASH#')
      .replaceAll('?', '#QUE#')
      .replaceAll('%', '#PERCENTAGE#')
      .replaceAll('&', '#AND#')
      .replaceAll('/', '~')
      .replaceAll('~feeds~2020-09-04~feeds.', '_02 createFeed POST_INVENTORY_AVAILABILITY_DATA and get feedId.')
      .replaceAll('~feeds~2020-09-04~feeds~', '_03 GET feedDocumentId based on feedId')
      .replaceAll('~feeds~2020-09-04~documents', '_04 getFeedDocument(feed_doc) based on feedDocumentId')
      ;

    console.log('\n', filePath);

    if (filePath.includes('~feeds~2020-09-04~feeds.')) {
      filePath.replaceAll();
    }


    if (typeof (data) !== 'string') {
      data = JSON.stringify(data);
    }

    try {
      await fs.writeFileSync(filePath, data, 'utf8', function (err) {
        if (err) console.log(err.message);
      });

    }

    catch (error) {
      console.log('\n', error.message);
      filePath = process.env.INIT_CWD + '\\files\\amazon-stock-update\\' + `${moment().format('YYYYMMDD HHmmss')} ${moment().millisecond()}.json`;
      await fs.writeFileSync(filePath, data, 'utf8', function (err) {
        if (err) console.log(err.message);
      });
    }

  }
  catch (error) {
    console.log(error);
  }
};