
exports.generateURL = (s) => {
    return  s.trim().toLowerCase().replace(/\s+/g,'-')
}

exports.generateCode = () => {
    const now = Date.now(); 

    let cur = now;
    let token = "";

    while (cur !== 0){
        let temp = cur % 10;
        token += String.fromCharCode(temp + 65);
        cur = Math.floor(cur/10);
    }

    return token;
}