const fs = require('fs');

module.exports = function(file) {
    fs.writeFileSync(file, fs.readFileSync(file, {encoding: 'utf-8'}).toString().replace(/\r\n/g, '\n'));
}
