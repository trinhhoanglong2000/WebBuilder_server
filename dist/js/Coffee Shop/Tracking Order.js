function getOrderParam(param){
    let url = new URL(window.location.href);
    var value = url.searchParams.get(param);
    return value
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

function embedOrderTrackingData(deploy) {
    let serverURL = $('script.ScriptClass').attr('src').match(/.+(?=\/js|css)/gm)
    let storeId =$('nav[name="header"]').attr("store-id");
    let orderId = getOrderParam("id");

    $('.modal-loader').css('display', 'block')
    $('.modal-loader').find('#loader-popup').css('display', 'initial');

    fetch(`${serverURL}/stores/${storeId}/order/${orderId}`)
    .then((response) => response.json())
    .then((response) => {
        data = response.data;
        if ((response.statusCode === 200 || response.statusCode === 304) && data) {
            if (data.length <= 0 && deploy) {
                $('.modal-loader').find('#loader-popup').css('display', 'none');
                $('.modal-loader').find('#error-popup').find('#title').html('Order could not found... !');
                $('.modal-loader').find('#error-popup').css('display', 'initial');
                $('.modal-loader').find('#error-popup .footer-button .btn-ok');
            } else {
                $('.modal-loader').css('display', 'none');
                
                $('div[name="trackingOrder"]').find('#order_id span').html(data.order.id)
                $('div[name="trackingOrder"]').find('#customer_name span').html(data.order.name)
                $('div[name="trackingOrder"]').find('#delivery_address span').html(data.order.address + ", " + data.order.district + ", " + data.order.city)
                $('div[name="trackingOrder"]').find('#phone span').html(data.order.phone)
                if (data.order.payment_method  === 0) {
                    $('div[name="trackingOrder"]').find('#payment_method span').html("Cash on delivery");
                } else if (data.order.payment_method === 1) {
                    $('div[name="trackingOrder"]').find('#payment_method span').html("Paypal");
                }

                if (data.order.shipping_method === 0) {
                    $('div[name="trackingOrder"]').find('#delivery_method span').html("Take it at store")
                } else if (data.order.shipping_method  === 1) {
                    $('div[name="trackingOrder"]').find('#delivery_method span').html("Standard shipping")
                }
                
                $('div[name="trackingOrder"]').find('#order_note span').html(data.status[0].note);

                let productList = $('.product-bill').find('.product');
                data.products && data.products.forEach(element => {
                    let totalPrice = element.price * element.quantity;
                    if (element.existed) {
                        productList.append(`
                        <div class="row">
                            <div class="col-8"> <a href="/products?id=${element.id}">${element.product_name}</a> x${element.quantity}</div>
                            <div class="col-3"> ${priceToString(totalPrice, data.order.currency)} </div>
                        </div>`)
                    } else {
                        productList.append(`
                        <div class="row">
                            <div class="col-8"> ${element.quantity}x ${element.product_name}</div>
                            <div class="col-3"> ${priceToString(totalPrice, data.order.currency)} </div>
                        </div>`)
                    }
                });
                
                let original_price = priceToString(data.order.original_price, data.order.currency);
                let discount_price = priceToString(data.order.discount_price, data.order.currency);
                let totalPrice = data.order.original_price - data.order.discount_price;
                totalPrice = priceToString(totalPrice, data.order.currency);

                $('.product-bill').find('.billing #subtotal_price').html(original_price);
                $('.product-bill').find('.billing #discount_price').html(discount_price);
                $('.product-bill').find('.billing #total_price').html(totalPrice);
                
                $('#show_order_details button.btn-show-orders').on('click', function() {
                    $(this).css('display', 'none');
                    $('#order_details').css('display', 'initial');
                })

                let trackingStep = $('#tracking-order').find('.track .step').removeClass('active').removeClass('cancel');
                let buttonCancel = $('div[name="trackingOrder"]').find('#show_order_details button.btn-cancel_order');
                let btnPayment = $('div[name="trackingOrder"]').find('#show_order_details button.btn-payment'); 
                if (data.status && data.status.length && data.status[0].status === "DELETED") {
                    $('div[name="trackingOrder"]').find('#order_status span').html("Canceled");
                    btnPayment.css('display', 'none')
                    buttonCancel.css('display', 'none');

                    if (data.status[0].status === "PREPAID & RESTOCK" || data.status[0].status === "PRE-PAID") {
                        if (data.order.payment_method === 0){
                            trackingStep.eq(0).css('display', 'none');
                        } else {
                            trackingStep.eq(0).css('display', 'initial');
                            trackingStep.eq(0).addClass('active');
                        }
                        trackingStep.eq(1).addClass('active');
                    } else if (data.status[1].status === "RESTOCK" || data.status[1].status === "CREATED") {
                        if (data.order.payment_method === 0){
                            trackingStep.eq(0).css('display', 'none');
                        } else {
                            trackingStep.eq(0).css('display', 'initial');
                            trackingStep.eq(0).addClass('active');
                        }
                        trackingStep.eq(1).addClass('active');
                        trackingStep.eq(1).addClass('cancel');
                    } else if (data.status[1].status === "CONFIRMED") {
                        if (data.order.payment_method === 0){
                            trackingStep.eq(0).css('display', 'none');
                        } else {
                            trackingStep.eq(0).css('display', 'initial');
                            trackingStep.eq(0).addClass('active');
                        }
                        trackingStep.eq(1).addClass('active');
                        trackingStep.eq(2).addClass('active');
                        trackingStep.eq(2).addClass('cancel');
                    } else if (data.status[1].status === "SHIPPING") {
                        if (data.order.payment_method === 0){
                            trackingStep.eq(0).css('display', 'none');
                        } else {
                            trackingStep.eq(0).css('display', 'initial');
                            trackingStep.eq(0).addClass('active');
                        }
                        trackingStep.eq(1).addClass('active');
                        trackingStep.eq(2).addClass('active');
                        trackingStep.eq(3).addClass('active');
                        trackingStep.eq(3).addClass('cancel');
                    }
                } else {
                    if (data.status[0].status === "PREPAID & RESTOCK" || data.status[0].status === "PRE-PAID") {
                        $('div[name="trackingOrder"]').find('#order_status span').html("Prepay");
                        trackingStep.eq(0).addClass('active');
                        buttonCancel.css('display', 'initial');
                        btnPayment.css('display', 'initial');
                    } else if (data.status[0].status === "RESTOCK" || data.status[0].status === "CREATED" || data.status[0].status === "PAID" || data.status[0].status === "PAID & RESTOCK") {
                        $('div[name="trackingOrder"]').find('#order_status span').html("Order placed");
                        if (data.order.payment_method === 0){
                            trackingStep.eq(0).css('display', 'none');
                        } else {
                            trackingStep.eq(0).css('display', 'initial');
                            trackingStep.eq(0).addClass('active');
                        }
                        trackingStep.eq(1).addClass('active');
                        buttonCancel.css('display', 'initial');
                        btnPayment.css('display', 'none');
                    } else if (data.status[0].status === "CONFIRMED") {
                        $('div[name="trackingOrder"]').find('#order_status span').html("In production");
                        if (data.order.payment_method === 0){
                            trackingStep.eq(0).css('display', 'none');
                        } else {
                            trackingStep.eq(0).css('display', 'initial');
                            trackingStep.eq(0).addClass('active');
                        }
                        trackingStep.eq(1).addClass('active');
                        trackingStep.eq(2).addClass('active');
                        buttonCancel.css('display', 'initial');
                        btnPayment.css('display', 'none');
                    } else if (data.status[0].status === "SHIPPING") {
                        $('div[name="trackingOrder"]').find('#order_status span').html("In shipping");
                        if (data.order.payment_method === 0){
                            trackingStep.eq(0).css('display', 'none');
                        } else {
                            trackingStep.eq(0).css('display', 'initial');
                            trackingStep.eq(0).addClass('active');
                        }
                        trackingStep.eq(1).addClass('active');
                        trackingStep.eq(2).addClass('active');
                        trackingStep.eq(3).addClass('active');
                        btnPayment.css('display', 'none');
                    } else if (data.status[0].status === "COMPLETED") {
                        $('div[name="trackingOrder"]').find('#order_status span').html("Delivered");
                        if (data.order.payment_method === 0){
                            trackingStep.eq(0).css('display', 'none');
                        } else {
                            trackingStep.eq(0).css('display', 'initial');
                            trackingStep.eq(0).addClass('active');
                        }

                        trackingStep.eq(1).addClass('active');
                        trackingStep.eq(2).addClass('active');
                        trackingStep.eq(3).addClass('active');
                        trackingStep.eq(4).addClass('active');
                        btnPayment.css('display', 'none');
                    }
                }

                function pgFormatDate(date) {
                    function zeroPad(d) {
                    return ("0" + d).slice(-2)
                    }
                
                    var parsed = new Date(date);
                    parsed.setHours( parsed.getHours() + 10 )
                    return zeroPad(parsed.getDate()) + "/" + zeroPad(parsed.getMonth() + 1) + "/" + parsed.getUTCFullYear()
                    + " " + zeroPad(parsed.getHours()) + ":" + zeroPad(parsed.getMinutes()) + ":" + zeroPad(parsed.getSeconds());
                }

                let createTime = pgFormatDate(data.status[data.status.length - 1].create_at);  
                $('div[name="trackingOrder"]').find('#order_time span').html(createTime)

                buttonCancel.on('click', function() {
                    $('.modal-loader').css('display', 'block')
                    $('.modal-loader').find('#confirm-popup').css('display', 'initial');
                    $('.modal-loader').find('#reason-popup').css('display', 'none');
                    $('.modal-loader').find('#loader-popup').css('display', 'none');
                    $('.modal-loader').find('#success-popup').css('display', 'none');
                    $('.modal-loader').find('#error-popup').css('display', 'none');

                    $('.modal-loader').find('.footer-button .btn-no')
                        .on('click', function() {
                            $('.modal-loader').css('display', 'none')
                        })

                    $('.modal-loader').find('#confirm-popup .footer-button .btn-yes')
                        .on('click', function() {
                            $('.modal-loader').find('#confirm-popup').css('display', 'none');
                            $('.modal-loader').find('#reason-popup').css('display', 'initial')
                                .find('input').val('');
                        })
                        
                    $('.modal-loader').find('#reason-popup .footer-button .btn-yes')
                    .on('click', function() {
                        $('.modal-loader').find('#reason-popup').css('display', 'none');
                        $('.modal-loader').find('#loader-popup').css('display', 'initial');
                        
                        let note = $('.modal-loader').find('#reason-popup').find('textarea').val();

                        let requestOptions = {
                            method: 'POST',
                            body: JSON.stringify({
                                store_id: storeId,
                                note: note
                            }),
                            headers: {"Content-type": "application/json; charset=UTF-8"}
                        };

                        fetch(`${serverURL}/order/${orderId}/delete-status`, requestOptions)
                            .then((response) => response.json())
                            .then((response) => {
                                if (response.statusCode == 200) {
                                    $('.modal-loader').find('#loader-popup').css('display', 'none');
                                    $('.modal-loader').find('#success-popup').css('display', 'initial');

                                    $('#tracking-order').find('.track .step.active').last().addClass('cancel');
                                    $('div[name="trackingOrder"]').find('#order_status span').html("Canceled");
                                    $('div[name="trackingOrder"]').find('#order_note span').html(note);
                                    buttonCancel.css("display", "none");
                                } else {
                                    $('.modal-loader').find('#loader-popup').css('display', 'none');
                                    $('.modal-loader').find('#error-popup').find('#title').html('Server error... !');
                                    $('.modal-loader').find('#error-popup').css('display', 'initial');
                                }
                            });
                    })

                    $('.modal-loader').find('#success-popup .footer-button .btn-ok')
                    .on('click', function() {
                        $('.modal-loader').css('display', 'none');
                    })
                })

                btnPayment.on('click', ()=>{
                    window.location.href = data.approveLink;
                })
            }
        } else {
            $('.modal-loader').find('#loader-popup').css('display', 'none');
            $('.modal-loader').find('#error-popup').find('#title').html('Order could not found... !');
            $('.modal-loader').find('#error-popup').css('display', 'initial');
            $('.modal-loader').find('#error-popup .footer-button .btn-ok');
        }

        $('.modal-loader').find('#error-popup .footer-button .btn-ok')
        .on('click', function() {
            $('.modal-loader').css('display', 'none');
            window.location.href = '/home';
        })
    });
    
}

$(document).ready(function () {
    if ($('[data-gjs-type="wrapper"]').length) {
        $('[data-gjs-type="wrapper"]').ready(function () {
            embedOrderTrackingData(false);
        })
    }
    else {
        embedOrderTrackingData(true);
    } 
})
