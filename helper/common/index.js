
exports.generateURL = (s) => {
    return s.replace(/\s+/g,' ').trim().toLowerCase().replace(' ', '-');
}