const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

function fetchData() {
    request({
        url: 'http://nil.csail.mit.edu/6.824/2015/schedule.html',
        headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "max-age=0",
            "Host": "nil.csail.mit.edu",
            "Proxy-Connection": "keep-alive",
            "Referer": "http://nil.csail.mit.edu/6.824/2015/general.html",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.89 Safari/537.36"
        },
        encoding: null
    }, function (err, res, body) {
        const $ = cheerio.load(body);
        const list = $('.lecture').map((i, lecture) => {
            const dirname = path.resolve(__dirname, 'files', 'lecture_' + i);
            if (!fs.existsSync(dirname)) {
                fs.mkdirSync(dirname);
            }
            const data = $(lecture).find('a').each((j, datum) => {
                const href = $(datum).attr('href');
                const temp = /.*\/(.*)$/.exec(href);
                const filename = (temp ? temp[1] : href).split('?')[0];
                const uri = /^http/.test(href) ? href : 'http://nil.csail.mit.edu/6.824/2015/' + href;
                request(uri, function (err, res, body) {
                    if (err || res.statusCode !== 200) {
                        console.log(`error: fetch ${dirname} with ${uri}`);
                        return;
                    }
                    if (res.headers &&res.headers['content-type'] === 'application/pdf') {
                        // TODO: handle the pdf.
                    }
                    fs.writeFile(path.resolve(dirname, filename), body, function (err) {
                        if (err) {
                            console.log(dirname + ' with ' + uri);
                        }
                    });
                });
            });
        });
    });
}

fetchData();
