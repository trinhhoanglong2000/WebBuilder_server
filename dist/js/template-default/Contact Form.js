function ValidateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)){
        return (true)
    }
    return (false)
}

function validPhonenumber(pNumber) {
    let phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if(pNumber.match(phoneno)) {
      return true;
    }
    else {
      return false;
    }
}

function embedContact() {
    $('[name="contactForm"]').each(function() {  
        $(this).find('#submitBtn').on('click', () => {
            let name = $(this).find('#name').val().trim();
            let email = $(this).find('#email').val().trim();
            let pNumber = $(this).find('#pNumber').val().trim();
            let comment = $(this).find('#comment').val().trim();

            if (name && email && pNumber && comment && name != "" && comment != "" && 
                validPhonenumber(pNumber) && ValidateEmail(email)) {

                $(this).find('.modal-loader').css('display', 'block');
                $(this).find('#loader-popup').css('display', 'initial');
                $(this).find('#success-popup').css('display', 'none');
                $(this).find('#error-popup').css('display', 'none');
                $(this).find('#error').css('display', 'none');
    
                let serverURL = $('script.ScriptClass').attr('src').match(/.+(?=\/js|css)/gm)
                let storeId = $('nav[name="header"]').attr("store-id");
                
                let requestOptions = {
                    method: 'POST',
                    body: JSON.stringify({
                        "name": name,
                        "email": email,
                        "phone": pNumber,
                        "comment": comment,
                    }),
                    headers: {"Content-type": "application/json; charset=UTF-8"}
                };
    
                fetch(`${serverURL}/stores/${storeId}/contact-form`, requestOptions)
                    .then((response) => response.json())
                    .then((response) => {
                        if (response.statusCode == 200) {
                            $(this).find('#loader-popup').css('display', 'none');
                            $(this).find('#success-popup').css('display', 'initial');
    
                            $(this).find('#success-popup').find('.footer-button .btn-ok')
                            .on('click', () => {
                                $(this).find('.modal-loader').css('display', 'none');
                            })
                        } else {
                            $(this).find('#loader-popup').css('display', 'none');
                            $(this).find('#error-popup').css('display', 'initial');
    
                            $(this).find('#error-popup').find('.footer-button .btn-ok')
                            .on('click', () => {
                                $(this).find('.modal-loader').css('display', 'none');
                            })
                        }
                    });
            } else {
                $(this).find('#error').css('display', 'initial').html('Invalid input!');
            }
        })
    })
}

$(document).ready(function () {
    if ($('[data-gjs-type="wrapper"]').length) {
        $('[data-gjs-type="wrapper"]').ready(function () {
            embedContact();
        })
    }
    else {
        embedContact();
    } 
})
