
let urlProductSection = null;
let isAddScript= false
let isScrollable = true;
let startProductSection = 0;
function productData(e) {
    const limit = $(e).data('ez-mall-numproducts') || "8";
    fetch(`${urlProductSection}/stores/${'621b5a807ea079a0f7351fb8'}/products?limit=${limit}&offset=${startProductSection}`)
    .then((response) => response.json())
    .then((data) => {
        console.log(data)
        startProductSection+= limit;
        let productHTML = "";
        data.data.forEach(element => {
            
        });
    //   if (data.data[0].listProducts) 
    //     products_data = data.data[0].listProducts;
    //   $(e)
    //   .find(".thumb-wrapper")
    //   .each(function (index) {
    //     $(this)
    //       .find("h4")
    //       .text(products_data[index % products_data.length].title);
    //     $(this)
    //       .find(".item-price strike")
    //       .text(products_data[index % products_data.length].price);
    //     $(this)
    //       .find(".item-price span")
    //       .text(products_data[index % products_data.length].price);
    //     $(this)
    //       .find("img").attr("src",products_data[index % products_data.length].thumbnail);
    //   });
    });
}

function init() {
    if (!urlProductSection) {
        urlProductSection = $('script.scriptClass').attr('src').match(/^.*?(?=\/files)/gm)[0]
    }
    if (!isAddScript){
        isAddScript = true;
        let script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://unpkg.com/infinite-scroll@4/dist/infinite-scroll.pkgd.min.js"; // use this for linked script
        $("head").append(script);
    }
    // 
    const height = $('.footer-section').height()
    $(window).scroll(function () { 
        if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10-height) {
           if (isScrollable){
               isScrollable = false;
               setTimeout(function(){
                   isScrollable = true
               },2000)
               console.log("HEHE")

           }
        }
     });
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