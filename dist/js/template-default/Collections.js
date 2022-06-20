
let urlProductSection = null;
let startProductSection = 0;
let isScrollable = true;
let canLoadProductSection = true
let productHTML = "";
const debounce_ProductPage = (fn, delay = 1000) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            fn(...args)
        }, delay);
    };
};
var GetRequest_ProductPage = debounce_ProductPage(async (e,idStore,limit,name) => {
    console.log($.urlParam('id'))
    const id= $.urlParam('id')
    const url = id ? `${urlProductList}/collections/product/${id}`:''
    fetch(`${urlProductSection}/stores/${idStore}/products?limit=${limit}&offset=${startProductSection}&title=${name}`)
    .then((response) => response.json())
    .then((data) => {
        $(".dots ").addClass("d-none")
        startProductSection += parseInt(limit);
        if (data.data.length < limit) canLoadProductSection = false
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
        $(e).find(".row").empty().append(productHTML)

    });

}, 200)
function productData(e) {
    const idStore = $('nav[name="header"]').attr("store-id") || ''
    const limit = $(e).data('ez-mall-numproducts') || "8";
    $(e).find('#form1').on('input',function (){
        productHTML = "";
        startProductSection = 0
        isScrollable = true;
        canLoadProductSection = true
        GetRequest_ProductPage(e,idStore,limit,$(this).val())
    })
    GetRequest_ProductPage(e,idStore,limit,"")

}

function init() {

    const href = window.location != window.parent.location ? window.parent.location.href : window.location.href
    $.urlParam = function (name) {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(href);
        if (results == null) {
            return null;
        }
        else {
            return decodeURI(results[1]) || 0;
        }
    }


    if (!urlProductSection) {
        urlProductSection = $('script.ScriptClass').attr('src').match(/.+(?=\/js|css)/gm)
    }

    // 
    const height = $('.footer-section').height()
    $(window).scroll(function () {
        if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10 - height) {
            if (isScrollable && canLoadProductSection) {
                isScrollable = false;
                setTimeout(function () {
                    isScrollable = true

                }, 1000)
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