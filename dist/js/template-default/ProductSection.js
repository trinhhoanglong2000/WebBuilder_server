
let url = null;
let isAddScript= false
function productData(e) {
    const limit = $(e).data('ez-mall-numproducts') || "8";
    console.log(limit)
}

function init() {
    if (!url) {
        url = $('script.scriptClass').attr('src').match(/^.*?(?=\/files)/gm)[0]
    }
    if (!isAddScript){
        isAddScript = true;
        let script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://unpkg.com/infinite-scroll@4/dist/infinite-scroll.pkgd.min.js"; // use this for linked script
        $("head").append(script);
    }
    $("div[name='products-section']").each(function (i) {
        productData(this);
      });

  }
$(document).ready(function () {
    if ($('[data-gjs-type="wrapper"]').length) {
        $('[data-gjs-type="wrapper"]').ready(function () {
            init();
        });
    } else {
        init();
    }
});