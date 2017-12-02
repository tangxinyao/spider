const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

function fetchData() {
    request({
        url: 'http://nil.csail.mit.edu/6.824/2015/schedule.html',
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Host': 'nil.csail.mit.edu',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.89 Safari/537.36'
        },
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
                    options.headers = {
                        'Content-type': 'application/pdf',
                        'Host': 'nil.csail.mit.edu',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
                    };
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
