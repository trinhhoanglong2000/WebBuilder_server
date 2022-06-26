function ValidateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)){
        return (true)
    }
    return (false)
}

function embedOrderTrackingScriptForm(isDeploy) {
    $('div[name="trackingOrderForm"] #submitBtn').click((e) => {
        $('div[name="trackingOrderForm"] .error').css('display', 'none')
        let mail = $('div[name="trackingOrderForm"] #email').val();
        let orderId = $('div[name="trackingOrderForm"] #orderCode').val().trim();
        if (mail && orderId && ValidateEmail(mail) && orderId != "") {
            let serverURL = $('script.ScriptClass').attr('src').match(/.+(?=\/js|css)/gm);
            //let storeId = $('nav[name="header"]').attr("store-id");
            let storeId = '7b06cf0f-c51d-416b-ba37-f37969629355'
            let orderId = "ACICBIDGBGFGB"
            mail = "ttlgame123@gmail.com"
            fetch(`${serverURL}/stores/${storeId}/order/${orderId}?email=${mail}`)
            .then((response) => response.json())
            .then((response) => {
                if (response.statusCode === 200 || response.statusCode === 304) {
                    // TODO - REDIRECT TO TRACKING ORDER
                } else {
                    $('div[name="trackingOrderForm"] .error').html('Server erorr!')
                    $('div[name="trackingOrderForm"] .error').css('display', 'initial');
                }
            })
        } else {
            $('div[name="trackingOrderForm"] .error').html('Invalid input!')
            $('div[name="trackingOrderForm"] .error').css('display', 'initial')
        }
    });
}

$(document).ready(function () {
    if ($('[data-gjs-type="wrapper"]').length) {
        $('[data-gjs-type="wrapper"]').ready(function () {
            embedOrderTrackingScriptForm(false);
        })
    }
    else {
        embedOrderTrackingScriptForm(true);
    } 
})
