function ValidateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)){
        return (true)
    }
    return (false)
}

function embedOrderTrackingScriptForm(deploy) {
    $('div[name="trackingOrderForm"]').each(function() {

        $(this).find('#submitBtn').click(() => {
            let errorAlert  = $(this).find('.error').css('display', 'none');
            let notifyAlert = $(this).find('.notify').css('display', 'none');
            let mail = $(this).find('#email').val();
            let orderId = $(this).find('#orderCode').val().trim();
            debugger
            if (mail && orderId && ValidateEmail(mail) && orderId != "") {
                let serverURL = $('script.ScriptClass').attr('src').match(/.+(?=\/js|css)/gm);
                let storeId = $('nav[name="header"]').attr("store-id");

                fetch(`${serverURL}/stores/${storeId}/order/${orderId}?email=${mail}`)
                .then((response) => response.json())
                .then((response) => {
                    if (response.statusCode === 200 || response.statusCode === 304) {
                        if (response.data.length > 0 && deploy) {
                            window.location.href = `/order/${orderId}`
                        } else if (response.data.length <= 0) {
                            notifyAlert.html('Order could not be found!')
                            notifyAlert.css('display', 'initial');
                        } 
                    } else {
                        errorAlert.html('Server error!')
                        errorAlert.css('display', 'initial');
                    }
                })
            } else {
                errorAlert.html('Invalid input!')
                errorAlert.css('display', 'initial')
            }
        });
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
