const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

function fetchData() {
    request({
        url: 'http://nil.csail.mit.edu/6.824/2015/schedule.html',
        encoding: null
    }, function (err, res, body) {
        const $ = cheerio.load(body);
        const list = $('.lecture').each((i, lecture) => {
            const dirname = path.resolve(__dirname, 'files', 'lecture_' + i);
            if (!fs.existsSync(dirname)) {
                fs.mkdirSync(dirname);
            }
            $(lecture).find('a').each((j, datum) => {
                const options = {}
                const href = $(datum).attr('href');
                const temp = /.*\/(.*)$/.exec(href);
                const filename = (temp ? temp[1] : href).split('?')[0];
                const suffix = filename.split('.')[1];
                if (suffix === 'pdf') {
                    options.headers = { 'Content-type': 'application/pdf' };
                }
                const url = /^http/.test(href) ? href : 'http://nil.csail.mit.edu/6.824/2015/' + href;
                options.url = url;
                options.encoding = null;
                request(options, function (err, res, body) {
                    if (err || res.statusCode !== 200) {
                        console.log(`error: fetch ${dirname} with ${url}`);
                        return;
                    }
                    fs.writeFile(path.resolve(dirname, filename), body, function (err) {
                        if (err) {
                            console.log(dirname + ' with ' + url);
                        }
                    });
                });
            });
        });
    });
}

fetchData();
