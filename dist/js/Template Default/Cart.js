function payMent() {
    if ($('[data-gjs-type="wrapper"]').length>0){
        return
    } 
    let listIdCheck = [];
    let listProductBuy = [];
    let productCheck = $(".ezMall-cart-item");
    if (productCheck.length > 0) {
        for (let i = 0; i < productCheck.length; i++) {
            let isCheckked = $(productCheck[i]).find("input.ezMall-cart-item-check:checked");
            if (isCheckked.length != 0) {
                listIdCheck.push(productCheck[i].id)
            }
        }
        let cart = JSON.parse(localStorage.getItem('cart'));
        if (!cart) {
            cart = []
        }
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].is_variant) {
                if (listIdCheck.includes(cart[i].variant_id)) {
                    listProductBuy.push(cart[i])
                }
            } else {
                if (listIdCheck.includes(cart[i].id)) {
                    listProductBuy.push(cart[i])
                }
            }
        }
        window.localStorage.setItem('paymentItems', JSON.stringify(listProductBuy));
        if(listProductBuy.length > 0){
            window.location.href = "/payment"
        }else{
            $("#cart-alert").html("Please choose one or more items")
        }

    }
}

async function CartGenerateCodeItem(e) {
    let rootEle = $(e)
    $(rootEle).find(".ezMall-popup-alert").show().css("display", "flex").children().hide()
    $(rootEle).find(".ezMall-popup-alert .ezMall-loading").show();
    let tableHead = $(e).find(`.tableRoot .thead`)[0];
    let tableBody = $(e).find(`.tableRoot .tbody`)[0];
    let ezMallSumary = $(e).find(`.ezMallSumary`)[0];
    let buttonGoShopping = $('#ezMall-cart-zero-item button').click(() => {
        window.location.href = "/collections"
    })
    const storeId = $('nav').attr("store-id");
    const rootUrl = $('script.ScriptClass').attr('src').match(/.+(?=\/js|css)/gm)
    const url = `${rootUrl}/stores/${storeId}/currency`
    const currency = await fetch(url,
        {
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        }).then(res => res.json()).then(res => res.data.currency).catch(e => "USD").finally(async data => {

            const rootUrl = $('script.ScriptClass').attr('src').match(/.+(?=\/js|css)/gm)
            await fetch(`${rootUrl}/data/rate`,
                {
                    mode: 'cors',
                    headers: {
                        'Access-Control-Allow-Origin': '*'
                    }
                }).then(res => res.json()).then(currencyRes => {
                    console.log(currencyRes)
                    if (currencyRes.statusCode === 200) {
                        window.localStorage.setItem('currency', JSON.stringify(currencyRes.data));
                    }
                })


        })
    window.localStorage.setItem('storeCurrency', JSON.stringify(currency));

    let cart = JSON.parse(localStorage.getItem('cart'));
    if (!cart) {
        cart = []
    }
    insertCartData(cart, tableHead, tableBody, ezMallSumary, rootEle)
    $(rootEle).find(".ezMall-popup-alert").hide().children().hide();
}
function CartGenerateCodeStart() {
    $("div[ez-mall-type='cart']").each(function (i) {
        CartGenerateCodeItem(this)
    });
}

//SetListenOnChangeAtrribute();
$(document).ready(function () {
    if ($('[data-gjs-type="wrapper"]').length>0) {
        // $('[data-gjs-type="wrapper"]').ready(function () {
        //     CartGenerateCodeStart();
        // })
    }
    else {
        CartGenerateCodeStart();
    }
})

function calculateTotal(tableBody, tableHead, ezMallSumary, rootEle) {
    
    let currency = JSON.parse(localStorage.getItem('storeCurrency'));
    let totalCost = 0;
    let items = $(tableBody).find(".ezMall-cart-item ");
    let checkedInput = $(tableBody).find(".ezMall-cart-item .ezMall-cart-item-check:checked")
    if (items.length == 0) {
        $(rootEle).find("#ezMall-cart-zero-item").show().addClass("d-flex");
        $(rootEle).find(".cart-container").hide();
        $(ezMallSumary).hide();
        $(tableHead).find("#cart-select-all-product").prop("checked", false)
    }
    else {
        $(rootEle).find("#ezMall-cart-zero-item").hide().removeClass("d-flex");
        $(rootEle).find(".cart-container").show();
        $(ezMallSumary).show();
        if (checkedInput.length == items.length) {
            $(tableHead).find("#cart-select-all-product").prop("checked", true)
        }
    }
    let cart = JSON.parse(localStorage.getItem('cart'));
    if (!cart) {
        cart = []
    }
    for (let i = 0; i < items.length; i++) {
        let id = $(items[i]).attr("id");
        let itemData = cart.find((item) => {
            if (item.is_variant) {
                if (item.variant_id == id) {
                    return true;
                }
            } else {
                if (item.id == id) {
                    return true
                }
            }
            return false;
        })
        let quantity = $(items[i]).find(".ezMall-item-quantity").val();
        let price = convertCurrency(itemData.price, itemData.currency, currency)
        let isCheck = $(items[i]).find(".ezMall-cart-item-check").is(':checked');
        if (isCheck) {
            totalCost += (Number)(price) * quantity;
        } else {
            $(tableHead).find("#cart-select-all-product").prop("checked", false)
        }
    }
    $(ezMallSumary).find(".ezMallSumary-total-cost").html(priceToString(totalCost, currency));

}
function insertCartData(data, tableHead, tableBody, ezMallSumary, rootEle) {
    let currency = JSON.parse(localStorage.getItem('storeCurrency'));
    $(ezMallSumary).find("#ezMall-cart-sumary-unchecked-all").click(() => {
        let checkedInput = $(tableBody).find(".ezMall-cart-item .ezMall-cart-item-check:checked ")
        for (let i = 0; i < checkedInput.length; i++) {
            $(checkedInput[i]).prop("checked", false);
        }
        calculateTotal(tableBody, tableHead, ezMallSumary, rootEle);
    })
    $(ezMallSumary).find(".ezMallSumary-total-cost").html(priceToString(0, currency));

    $(tableHead).find(".ezMall-head-remove-all-items").click(() => {
        window.localStorage.setItem('cart', JSON.stringify([]));
        $(tableBody).html("")
        $(tableHead).find("#cart-select-all-product").prop('checked', false);
        calculateTotal(tableBody, tableHead, ezMallSumary, rootEle);
        updateCart()
    });

    $(tableHead).find("#cart-select-all-product").click((e) => {
        var checkBox = $(tableBody).find(".ezMall-cart-item .ezMall-cart-item-check");
        for (let i = 0; i < checkBox.length; i++) {
            $(checkBox[i]).prop('checked', e.target.checked)
        }
        calculateTotal(tableBody, tableHead, ezMallSumary, rootEle)
    })

    let totalCostInit = 0;
    if (data) {
        data.forEach(element => {
            element.price = convertCurrency(element.price, element.currency, currency)
            element.currency = currency
            let totalPrice = (Number)(element.quantity) * (Number)(element.price)
            totalCostInit += totalPrice;
            let id = element.is_variant ? element.variant_id : element.id;
            const rowHtml =
            `
        <div id  = ${id} class= "ezMall-cart-item row py-1 px-3" >
            <div class="name col-md-9">
                    <div class="row">
                                <div class="col-md-4 col-7 row d-flex justify-content-start p-0">
                                        <a href="/products?id=${id}">
                                            <img src=${element.thumnail} alt="Image"
                                            style="height: 150px;width: 100%;">
                                        </a>
                                    </div>
                                    <div class="col-md-8 col-5 d-flex flex-column justify-content-between px-3">
                                        <div class="px-0 py-0 my-2 justify-content-start  text-start fw-bold cart-item-tittle">
                                            <a href="/products?id=${id}"> ${element.product_name} ${element.is_variant? ` - ${element.variant_name}`: ""}</a>
                                        </div>
                                        <div class = "d-flex justify-content-between px-0 ">
                                                <div class= "p-0 my-2 fw-bold d-flex text-secondary align-items-center fst-italic">
                                                    Price: 
                                                    <div class="ezMall-item-price px-1"> 
                                                        ${priceToString(element.price, element.currency)}
                                                    </div>    
                                                    <div class= "ezMall-item-price-type">
                                                        ${element.currency}
                                                    </div>
                                                </div>
                                        </div>
                                        <div class="fw-bold d-flex text-secondary align-items-center px-0 fst-italic">
                                            <input type="number" min="0" id=${"val-" + id} class="form-control ezMall-item-quantity" value=${element.quantity}
                                            style="min-width: 70px; width: 70px;" min=1>
                                        </div>
                                    </div>
                    </div>
            </div>
            <div class="ezMall-item-total col-md-3 d-flex align-items-md-end align-items-center flex-md-column flex-row-reverse justify-content-between px-2">
                <div class="my-2 d-flex align-items-center">
                    <label class="form-check-label px-2 " for=${"check-" + id}>
                    Take it
                    </label>
                    <input class="form-check-input ezMall-cart-item-check" type="checkbox" id=${"check-" + id} name=${"check-" + id} value="">
                </div>
                <div class="px-1 py-0 my-2 justify-content-end  text-start fw-bold cart-item-tittle color-orange">
                    ${priceToString(totalPrice, element.currency)}
                </div>
                <div class="d-flex justify-content-end align-items-center">
                    <button type="button"  class="ezMall-cart-item-delete btn ezMall-btn" data-toggle="button" aria-pressed="false"
                        autocomplete="off" style="height: 29px;padding: 0px 10px;">
                        <i class="fa fa-trash " aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        </div>     
        <hr class = "my-2">                      
                                
        `

            tableBody.insertAdjacentHTML("beforeend", rowHtml);
            $(tableBody).find(`#${id} button.ezMall-cart-item-delete`).click(() => {
                debugger
                let cart = JSON.parse(localStorage.getItem('cart'));
                if (!cart) {
                    cart = []
                }
                let indexInArr = cart.findIndex((item) => {
                    if (element.is_variant) {
                        if (item.variant_id == id) {
                            return true;
                        }
                    } else {
                        if (item.id == id) {
                            return true
                        }
                    }
                    return false;
                })

                let itemRemove = $(tableBody).find(`#${id}`)
                $(itemRemove).fadeOut(200).remove();
                let totalCost = 0;
                let items = $(tableBody).find(".ezMall-cart-item ");
                cart.splice(indexInArr, 1);
                window.localStorage.setItem('cart', JSON.stringify(cart));
                updateCart()
                calculateTotal(tableBody, tableHead, ezMallSumary, rootEle)
           
            })

            $(tableBody).find(`#${id} input.ezMall-item-quantity`).change(() => {
                let cart = JSON.parse(localStorage.getItem('cart'));
                if (!cart) {
                    cart = []
                }
                let indexInArr = cart.findIndex((item) => {
                    if (element.is_variant) {
                        if (item.variant_id == id) {
                            return true;
                        }
                    } else {
                        if (item.id == id) {
                            return true
                        }
                    }
                    return false;
                })
                let currentQuantity = $(tableBody).find(`input#val-${id}`).val()
                if(currentQuantity <=0){
                    $(tableBody).find(`#${id} button.ezMall-cart-item-delete`).click();
                    return
                }
                $(tableBody).find(`#${id} .ezMall-item-total .cart-item-tittle`).html(     priceToString((Number)(element.price) * currentQuantity, element.currency))
                let items = $(tableBody).find(".ezMall-cart-item ");
                let totalCost = 0;
                calculateTotal(tableBody, tableHead, ezMallSumary, rootEle)
                cart[indexInArr].quantity = currentQuantity;
                window.localStorage.setItem('cart', JSON.stringify(cart));
                updateCart()
            });

            $(tableBody).find(`#${id} input.ezMall-cart-item-check`).change(() => {
                calculateTotal(tableBody, tableHead, ezMallSumary, rootEle)
            });
        });
    }

    let items = $(tableBody).find(".ezMall-cart-item ");
    if (items.length == 0) {
        $(rootEle).find("#ezMall-cart-zero-item").show().addClass("d-flex");
        $(rootEle).find(".cart-container").hide();
        $(ezMallSumary).hide();
        $(tableHead).find("#cart-select-all-product").prop("checked", false)
    }
    else {
        $(rootEle).find("#ezMall-cart-zero-item").hide().removeClass("d-flex");
        $(rootEle).find(".cart-container").show();
        $(ezMallSumary).show();
    }
}

function updateCart() {
    let cart = JSON.parse(localStorage.getItem('cart'));
    if (!cart) {
        cart = []
    }
    let numberProduct = cart ? cart.length : 0;
    if (numberProduct == 0) {
        $('i.fa.fa-shopping-bag span').css('display', 'none');
    } else {
        $('i.fa.fa-shopping-bag span').css('display', 'initial');
        $('#numberSelectedProduct').html(numberProduct);
    }
}
function priceToString(value, currency) {
    switch (currency) {
        case "VND":
            return Math.ceil(Number(value)).toLocaleString('fi-FI', { style: 'currency', currency: 'VND' });
            break;
        case "USD":
            return Number(value).toLocaleString('fi-FI', { style: 'currency', currency: 'USD' });
            break;
        default:
            return `${value}`
            break;
    }
}

function convertCurrency(value, fromCurrency, toCurrency) {
    let currencyOptions = JSON.parse(localStorage.getItem('currency'));
    let dataFromCurrency = currencyOptions.findIndex(item => item.currency == fromCurrency);
    let dataToCurrency = currencyOptions.findIndex(item => item.currency == toCurrency);

    switch (toCurrency) {
        case "VND":
            return Math.ceil(value * Number(currencyOptions[dataToCurrency].amount) / Number(currencyOptions[dataFromCurrency].amount));
            break;
        case "USD":
            return parseFloat(value * Number(currencyOptions[dataToCurrency].amount) / Number(currencyOptions[dataFromCurrency].amount) + 0.004).toFixed(2);
            break;
        default:
            return parseFloat(value * Number(currencyOptions[dataToCurrency].amount) / Number(currencyOptions[dataFromCurrency].amount) + 0.004).toFixed(2);
            break;
    }
}