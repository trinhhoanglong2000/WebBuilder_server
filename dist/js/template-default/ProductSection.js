
let urlProductSection = null;
let isScrollable = true;
let startProductSection = 0;
let canLoadProductSection = true
let productHTML = "";

function productData(e) {
    const limit = $(e).data('ez-mall-numproducts') || "8";
    fetch(`${urlProductSection}/stores/${'621b5a807ea079a0f7351fb8'}/products?limit=${limit}&offset=${startProductSection}`)
    .then((response) => response.json())
    .then((data) => {
        $(".dots ").addClass("d-none")
        startProductSection+= parseInt(limit);
        if (data.data.length<limit) canLoadProductSection = false
        data.data.forEach(element => {
            productHTML += ` <div class="col-md-3 col-sm-4">
            <div class="single-new-arrival">
                <div class="single-new-arrival-bg">
                    <img src=${element.thumbnail}
                        alt="new-arrivals images">
                    <div class="single-new-arrival-bg-overlay"></div>

                    <div class="new-arrival-cart">
                        <p>
                            <span class="lnr lnr-cart"></span>
                            <a href="#"> <i class="fa fa-shopping-cart" aria-hidden="true"></i> Add <span>to
                                </span> cart</a>
                        </p>

                    </div>
                </div>
                <h4><a href="#">${element.title}</a></h4>
                <p class="arrival-product-price">${element.price}</p>
            </div>
            </div>

            `
        });
        $(e).find(".row").html(productHTML)

    });
}

function init() {
    if (!urlProductSection) {
        urlProductSection = $('script.scriptClass').attr('src').match(/^.*?(?=\/files)/gm)[0]
    }
   
    // 
    const height = $('.footer-section').height()
    $(window).scroll(function () { 
        if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10-height) {
           if (isScrollable && canLoadProductSection){
               isScrollable = false;
               setTimeout(function(){
                   isScrollable = true

               },1000)
                $(".dots ").removeClass("d-none")
                $("div[name='products-section']").each(function (i) {
                    productData(this);
                });
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