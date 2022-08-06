function embedTermsOfServiceData() {
    let serverURL = $('script.ScriptClass').attr('src').match(/.+(?=\/js|css)/gm)
    let storeId = $('nav[name="header"]').attr("store-id");
    
    fetch(`${serverURL}/stores/${storeId}/user-mail`)
    .then((response) => response.json())
    .then((response) => {
        data = response.data[0];
        
        $('div[name="termsOfService"]').find('span#storeMail').html(data.email)
    });
}

$(document).ready(function () {
    if ($('[data-gjs-type="wrapper"]').length) {
        $('[data-gjs-type="wrapper"]').ready(function () {
            embedTermsOfServiceData();
        })
    }
    else {
        embedTermsOfServiceData();
    } 
})
