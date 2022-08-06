
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
var GetRequest_ProductPage = debounce_ProductPage(async (e, idStore, limit, name) => {
    const id = $.urlParam('id') ? $.urlParam('id') : ''
    fetch(`${urlProductSection}/stores/${idStore}/products?limit=${limit}&offset=${startProductSection}&status=Active&title=${name}${id ? `&collection_id=${id}` : ''}`)
        .then((response) => response.json())
        .then((data) => {
            if (startProductSection==0 && data.data.length==0){
                productHTML = `<div>No Items to display</div>`
            }
            $(".dots ").addClass("d-none")
            startProductSection += parseInt(limit);
            if (data.data.length < limit) canLoadProductSection = false
            data.data.forEach(element => {

                //
                let currency = ' $'
                if (element.currency === "VND"){
                  currency = ' VND'
                }
                else if (element.currency === "USD"){
                  currency = ' $'
                }
                const price = element.currency ? Number(element.price).toLocaleString(`${element.currency}`) + currency: 
                element.price
                //
                productHTML += ` 
        <div class="col-md-3 col-sm-4">
            <div class="single-new-arrival">
                    <a href="${element.id? `/products?id=${element.id}`:'#'}" >
                        <div class="single-new-arrival-bg">
                            <img src=${element.thumbnail}
                                alt="new-arrivals images">
                            <div class="single-new-arrival-bg-overlay"></div>

                            <div class="new-arrival-cart">
                                <p>
                                    <span class="lnr lnr-cart"></span>
                                    <a href="${element.id? `/products?id=${element.id}`:'#'}"> <i class="fa fa-shopping-cart" aria-hidden="true"></i> Add <span>to
                                        </span> cart</a>
                                </p>
                            </div>
                        </div>
                    </a>
                <h4><a href="${element.id? `/products?id=${element.id}`:'#'}">${element.title}</a></h4>
                <p class="arrival-product-price">${price}</p>
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
    const key = $.urlParam('key') || ""
    $(e).find('#form1').on('input', function () {
        productHTML = "";
        startProductSection = 0
        isScrollable = true;
        canLoadProductSection = true
        $.updateURLParameter('key',$(this).val())
        GetRequest_ProductPage(e, idStore, limit, $(this).val())
    })
    GetRequest_ProductPage(e, idStore, limit, key)

}

function init() {
    
    const history = window.location != window.parent.location ? window.parent.history : window.history
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
    $.updateURLParameter = function (param, paramVal) {
        var newAdditionalURL = "";
        var tempArray = href.split("?");
        var baseURL = tempArray[0];
        var additionalURL = tempArray[1];
        var temp = "";
        if (additionalURL) {
            tempArray = additionalURL.split("&");
            for (var i = 0; i < tempArray.length; i++) {
                if (tempArray[i].split('=')[0] != param) {
                    newAdditionalURL += temp + tempArray[i];
                    temp = "&";
                }
            }
        }

        var rows_txt = temp + "" + param + "=" + paramVal;
        const result = baseURL + "?" + newAdditionalURL + rows_txt;
        history.replaceState('', '', result);

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