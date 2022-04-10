/**
 * 2022/04/03 LONG-TP
 * Dynamically add script file
 * @param {*} array : array of link script 
 * @param {*} callback : function run after load script
 */
function loadScripts(array, callback) {
    var loader = function (src, handler) {
        var script = document.createElement("script");
        script.src = src;
        script.onload = script.onreadystatechange = function () {
            script.onreadystatechange = script.onload = null;
            handler();
        }
        var head = document.getElementsByTagName("head")[0];
        (head || document.body).appendChild(script);
    };
    (function run() {
        if (array.length != 0) {
            loader(array.shift(), run);
        } else {
            callback && callback();
        }
    })();
}

function getAllComponetScript() {
    let ArrScript = [];
    if ($("div[ez-mall-type='carousel']").length !=  0 && carousel_block_js ){
        ArrScript.push( `http://localhost:5000/files/dist/js/template-default/carousel/carousel.js`)
    }
    loadScripts(
        ArrScript
      , function () {
    });
}
$(document).ready(function () {
    getAllComponetScript();
})