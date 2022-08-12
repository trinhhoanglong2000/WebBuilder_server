async function PaymentGenerateCodeStart() {
    
    $("div[ez-mall-type='payment']").each(async function (i) {
        let rootEle = $("div[ez-mall-type='payment']")[0];
        let storeId = $(rootEle).attr("ez-mall-store");
        const rootUrl = $('script.ScriptClass').attr('src').match(/.+(?=\/js|css)/gm)
        var paypalStatus = await fetch(`${rootUrl}/stores/${storeId}/paypal-status`).then(res => res.json()).then(res => res.data.have_paypal).catch(e => null);
        if (!paypalStatus) {
            $(rootEle).find('#payment1')[0].parentNode.remove();
        }
        const url = `${rootUrl}/stores/${storeId}/currency`
        const storeCurrency = await fetch(url,
            {
                mode: 'cors',
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            }).then(res => res.json()).then(res => res.data.currency).catch(e => "USD")
        window.localStorage.setItem('storeCurrency', JSON.stringify(storeCurrency));
        $(rootEle).find("#currency").val(storeCurrency)
        await fetch(`${rootUrl}/data/rate`,
            {
                mode: 'cors',
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            }).then(res => res.json()).then(currencyRes => {
                if (currencyRes.statusCode === 200) {
                    window.localStorage.setItem('currency', JSON.stringify(currencyRes.data));
                }
            }).finally(async () => {
                await fetch(`${rootUrl}/data/city`
                    , {
                        mode: 'cors',
                        headers: {
                            'Access-Control-Allow-Origin': '*'
                        }
                    }).then(res => res.json()).then(cityRes => {
                        if (cityRes.statusCode === 200) {
                            window.localStorage.setItem('city', JSON.stringify(cityRes.data));
                        }
                    }).finally(async () => {
                        await loadPaymentData(this, true)
                    })
            })
    });
}

//SetListenOnChangeAtrribute();
$(document).ready(async function () {
    localStorage.removeItem('discount')
    if ($('[data-gjs-type="wrapper"]').length) {
        // $('[data-gjs-type="wrapper"]').ready(async function () {
        //     await PaymentGenerateCodeStart();

        // })
    }
    else {
        if (!JSON.parse(localStorage.getItem('paymentItems')) || JSON.parse(localStorage.getItem('paymentItems')).length == 0) {
            window.location.href = `/cart`
        }
        await PaymentGenerateCodeStart();
    }
})

function buy() {
    if ($('[data-gjs-type="wrapper"]').length>0){
        return
    } 
    let isOmitFill = false;
    let rootEle = $("div[ez-mall-type='payment']")[0];
    $(rootEle).find(".ezMall-payment-alert").show().css("display", "flex").children().hide()
    $(rootEle).find(".ezMall-payment-alert .ezMall-loading").show();
    let storeId = $(rootEle).attr("ez-mall-store");
    let email = $(rootEle).find("#email").val();
    let node =   $(rootEle).find("#note").val();
    if (!email) {
        $(rootEle).find(".email-alert").show();
        isOmitFill = true;
    } else {
        $(rootEle).find(".email-alert").hide();
    }
    let name = $(rootEle).find("#name").val();
    if (!name) {
        $(rootEle).find(".name-alert").show();
        isOmitFill = true;
    } else {
        $(rootEle).find(".name-alert").hide();
    }
    let tel = $(rootEle).find("#tel").val();
    if (!tel) {
        $(rootEle).find(".tel-alert").show();
        isOmitFill = true;
    } else {
        $(rootEle).find(".name-alert").hide();
    }
    let city = $(rootEle).find("#city").val();

    let district = $(rootEle).find("#district").val();
    let address = $(rootEle).find("#address").val();
    if (!address) {
        $(rootEle).find(".address-alert").show();
        isOmitFill = true;
    } else {
        $(rootEle).find(".address-alert").hide();
    }
    if (isOmitFill) {
        $(rootEle).find(".ezMall-payment-alert").hide().children().hide();
        return;
    } else {
        $(rootEle).find(".address-alert", ".tel-alert", ".name-alert", ".email-alert").hide();
    }
    let dilivery = $(rootEle).find("input[name='delivery']:checked").val();
    let payment = $(rootEle).find("input[name='payment']:checked").val();
    let paymentItems = JSON.parse(localStorage.getItem('paymentItems'));
    let currency = payment == 1 ? "USD" : $(rootEle).find("#currency").val();
    let discountInfo = JSON.parse(localStorage.getItem('discount'));


    var payload = {
        order: {
            email: email,
            name: name,
            phone: tel,
            city: city,
            district: district,
            address: address,
            store_id: storeId,
            shipping_method: dilivery,
            payment_method: payment,
            currency: currency,
            discount_id: discountInfo ? discountInfo.id : '',
            note: node??''
        },
        products: paymentItems.map((item) => {
            return {
                id: item.id,
                quantity: item.quantity,
                price: item.price,//convertCurrency(item.price, item.currency, currency),
                product_name: item.product_name,
                is_variant: item.is_variant,
                variant_id: item.variant_id,
                variant_name: item.variant_name,
                currency: item.currency
            }
        })
    }
    var data = JSON.stringify(payload);
    const rootUrl = $('script.ScriptClass').attr('src').match(/.+(?=\/js|css)/gm)
    const url = `${rootUrl}/stores/${storeId}/order`
    fetch(url,
        {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: data
        })
        .then(function (res) { return res.json(); })
        .then(function (resData) {
            if (resData.statusCode == 201) {

                paymentItems.forEach(product => {
                    let cart = JSON.parse(localStorage.getItem('cart'));
                    if (!cart) {
                        cart=[]
                    }
                    let indexInArr = cart.findIndex((item) => {
                        if (product.is_variant) {
                            if (item.variant_id == product.variant_id) {
                                return true;
                            }
                        } else {
                            if (item.id == product.id) {
                                return true
                            }
                        }
                        return false;
                    })
                    if(indexInArr !=-1){
                        let remainQuantity = Number(cart[indexInArr].quantity) - Number(product.quantity);
                        if (remainQuantity !=0) {
                            cart[indexInArr].quantity = remainQuantity
                        } else {
                            cart.splice(indexInArr, 1);
                        }
                    }
                    window.localStorage.setItem('cart', JSON.stringify(cart));
                })
           
                localStorage.removeItem('paymentItems')
                localStorage.removeItem('discount')
                $(rootEle).find(".ezMall-payment-alert").children().hide()
                $(rootEle).find(".ezMall-payment-alert .ezMall-popup-success").show().css("display", "flex")
                $(rootEle).find(".ezMall-payment-alert .ezMall-popup-success button").click(() => {
                    window.location.href = `/orders?id=${resData.data[0].id}`;
                })
            } else {
                $(rootEle).find(".ezMall-payment-alert").children().hide();
                $(rootEle).find(".ezMall-payment-alert  .ezMall-popup-fail").show().css("display", "flex")
                $(rootEle).find(".ezMall-payment-alert  .ezMall-popup-fail .ezMalll-msg").html(resData.message)
                $(rootEle).find(".ezMall-payment-alert .ezMall-popup-fail button").click(() => {
                    window.location.href = `/`
                })
            }
        })

}
async function getDistrict(rootEle) {
    let paymentCitySelectContainer = $(rootEle).find("#city")[0];
    let cityOptions = JSON.parse(localStorage.getItem('city'))
    let indexCity = cityOptions.findIndex(item => item.id === $(paymentCitySelectContainer).val())
    if (!('data' in cityOptions[indexCity])) {
        const rootUrl = $('script.ScriptClass').attr('src').match(/.+(?=\/js|css)/gm)
        await fetch(`${rootUrl}/data/city/${$(paymentCitySelectContainer).val()}/district`,
            {
                mode: 'cors',
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            }).then(res => res.json()).then(districtRes => {
                if (districtRes.statusCode === 200) {
                    cityOptions[indexCity].data = districtRes.data
                }
            })
    }
    let paymentDistrictSelectContainer = $(rootEle).find("#district")[0];
    $(paymentDistrictSelectContainer).html("")
    cityOptions[indexCity].data.forEach(item => {
        const rowHtml =
            `                            
                <option value="${item.name}" >${item.name}</option>        
            `
        paymentDistrictSelectContainer.insertAdjacentHTML("beforeend", rowHtml);
    })
}
async function loadPaymentData(rootEle, firstRun) {
    if ($('[data-gjs-type="wrapper"]').length>0){
        return
    } 
    if (firstRun) {
        // Render Currency
        let paymentCurrencySelectCoptainer = $(rootEle).find("#currency")[0];
        let currencyOptions = JSON.parse(localStorage.getItem('currency'))
        $(paymentCurrencySelectCoptainer).html("")

        currencyOptions.forEach((element, index) => {
            const rowHtml =
                `                            
            <option value="${element.currency}" >${element.currency}</option>        
            `
            paymentCurrencySelectCoptainer.insertAdjacentHTML("beforeend", rowHtml);
        });
        let storeCurrency = JSON.parse(localStorage.getItem('storeCurrency'));
        $(rootEle).find("#currency").val(storeCurrency)
        $(paymentCurrencySelectCoptainer).on("change", async () => {
            await loadPaymentData(rootEle, false)
        })
        // Render City
        let paymentCitySelectContainer = $(rootEle).find("#city")[0];
        let cityOptions = JSON.parse(localStorage.getItem('city'))
        $(paymentCitySelectContainer).html("")
        cityOptions.forEach((element, index) => {
            const rowHtml =
                `                            
            <option value="${element.id}" >${element.name}</option>        
            `
            paymentCitySelectContainer.insertAdjacentHTML("beforeend", rowHtml);
        });
        // Render District
        await getDistrict(rootEle)
        $(paymentCitySelectContainer).on("change", async () => {
            await getDistrict(rootEle)
        })
    }
    // Render cart
    let paymentCurrencyVal = $(rootEle).find("#currency").val();
    $(rootEle).find(".currency").html(paymentCurrencyVal);
    let cart = JSON.parse(localStorage.getItem('paymentItems'));
    let paymentCartContainer = $(rootEle).find(".ezMall-payment-cart-container")[0];
    $(paymentCartContainer).html("");
    let paymentCartSumPrice = $(rootEle).find(".ezMall-sumPrice")[0];
    let paymentShippingCost = $(rootEle).find(".ezMall-shipping-cost")[0];
    let paymentDiscount = $(rootEle).find(".ezMall-discount")[0];
    let paymentFinalBillCost = $(rootEle).find(".ezMall-final-bill-cost")[0];
    let sumPrice = 0;
    cart.forEach(element => {
        let converCurrency = convertCurrency(Number(element.quantity) * Number(element.price), element.currency, paymentCurrencyVal)
        sumPrice += Number(converCurrency);
        let variantInfo = [];
        let rowHtml = '';
        if (element.is_variant) {
            let variantName = element.variant_name.split("/");
            let optionName = element.optionName.split("/");

            for (let i = 0; i < optionName.length; i++) {
                variantInfo.push(`${optionName[i]}: ${variantName[i]}`)
            }
            rowHtml =
                `
                <div class=" px-1">
                    <div class=" py-2 d-flex flex-column justify-content-between" >
                        <div class = "row fw-bold"">
                            ${element.product_name} 
                        </div>
                        <div class = "justify-content-between align-items-end d-flex">
                            <div class = " px-2 fw-bold text-secondary fst-italic">
                            ${variantInfo.join("<br/>")} 
                            </div>
                            <div class = "d-flex flex-row fst-italic text-secondary">
                                <span class="fw-bold">
                                    x${element.quantity} 
                                </span>
                            </div>
                            <div class ="justify-content-end align-items-end d-flex fw-bold">
                                <div class="text-end">${priceToString(converCurrency, paymentCurrencyVal)}</td>
                            </div> 
                        </div>
                        
                    </div
                </div>                                   
                                
                `
        }else{
            rowHtml =
                `
                <div class=" px-1">
                    <div class=" py-2 d-flex justify-content-between" >
                        <div class = "row fw-bold"">
                            ${element.product_name} 
                        </div>
                        <div class = "fst-italic text-secondary">
                                <span class="fw-bold">x${element.quantity}</span>
                        </div>
                        <div class ="fw-bold">
                                <div class="text-end">${priceToString(converCurrency, paymentCurrencyVal)}</td>
                        </div> 
                    </div
                </div>                                   
                                
                `
        }
        paymentCartContainer.insertAdjacentHTML("beforeend", rowHtml);
    });
    // Render sumary
    let paymentDiscountVal = Number(calculatorDiscount(sumPrice, paymentCurrencyVal));
    $(paymentDiscount).html(priceToString(paymentDiscountVal, paymentCurrencyVal));
    let paymentShippingCostVal = 0;//Number($(paymentShippingCost).val());
    let finalCost = (sumPrice - paymentDiscountVal + paymentShippingCostVal).toFixed(2);
    finalCost = finalCost > 0 ? finalCost : 0;
    $(paymentCartSumPrice).html(priceToString(sumPrice.toFixed(2), paymentCurrencyVal));
    $(paymentShippingCost).html(priceToString(paymentShippingCostVal, paymentCurrencyVal))
    $(paymentDiscount).html(priceToString(paymentDiscountVal, paymentCurrencyVal))
    $(paymentFinalBillCost).html(priceToString(finalCost, paymentCurrencyVal));
    return finalCost;
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
function priceToString(value, currency) {
    switch (currency) {
        case "VND":
            return Math.ceil(Number(value)).toLocaleString('fi-FI', { style: 'currency', currency: 'VND' });
            break;
        case "USD":
            return Number(value).toLocaleString('fi-FI', { style: 'currency', currency: 'USD' });
            break;
        default:
            return `${value} ${currency}`
            break;
    }
}
function useDiscount() {

    let rootEle = $("div[ez-mall-type='payment']")[0];
    let storeId = $(rootEle).attr("ez-mall-store");
    let discountCode = $(rootEle).find('input#discount').val();
    let cart = JSON.parse(localStorage.getItem('paymentItems'));
    let paymentCurrencyVal = $(rootEle).find("#currency").val();
    let sumPrice = 0;
    cart.forEach(element => {
        let converCurrency = convertCurrency(Number(element.quantity) * Number(element.price), element.currency, paymentCurrencyVal)
        sumPrice += Number(converCurrency);
    });
    var payload = {
        "store_id": storeId,
        "code": discountCode,
        "total_price": sumPrice,
        "total_products": cart.length,
        "currency": paymentCurrencyVal
    }
    var data = JSON.stringify(payload);
    const rootUrl = $('script.ScriptClass').attr('src').match(/.+(?=\/js|css)/gm)
    const url = `${rootUrl}/discount/use-discount`
    fetch(url,
        {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: data
        })
        .then(function (res) { return res.json(); })
        .then(function (resData) {
            if (resData.statusCode == 200 && resData.data) {
                window.localStorage.setItem('discount', JSON.stringify(resData.data[0]));
                $(rootEle).find("#incorrect-discount-alert").hide();
                $(rootEle).find(".ezMall-discount-description").show();
                $(rootEle).find(".ezMall-discount-description-text").html(resData.data[0].code);
            } else {
                window.localStorage.removeItem('discount');
                $(rootEle).find(".ezMall-discount-description").hide();
                $(rootEle).find("#incorrect-discount-alert").show();
            }
        }).finally(() => {
            loadPaymentData(rootEle, false)
        })
}
function calculatorDiscount(sumPrice, paymentCurrencyVal) {
    let value = 0;
    let discountInfo = JSON.parse(localStorage.getItem('discount'));
    if (discountInfo) {
        let amount = discountInfo.amount;
        let discountCurrency = discountInfo.currency;

        if (discountInfo.type == 1) {
            value = convertCurrency(Number(amount), discountCurrency, paymentCurrencyVal)
        } else if (discountInfo.type == 0) {
            value = convertCurrency(Number(amount) * Number(sumPrice)/100, discountCurrency, paymentCurrencyVal)
        }
    }
    return value;
}

function removeDiscount() {
    let rootEle = $("div[ez-mall-type='payment']")[0];
    window.localStorage.removeItem('discount');
    $(rootEle).find(".ezMall-discount-description-text").html("");
    $(rootEle).find(".ezMall-discount-description").attr('style', 'display: none !important');
    loadPaymentData(rootEle, false)
}