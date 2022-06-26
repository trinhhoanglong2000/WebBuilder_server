function ValidateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)){
        return (true)
    }
    return (false)
}

function validPhonenumber(inputtxt) {
    let phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if(inputtxt.value.match(phoneno)) {
      return true;
    }
    else {
      alert("message");
      return false;
    }
}

function embedContact() {
    $('[name="contactForm"] #submitBtn').on('click', () => {
        let errorLabel = $('[name="contactForm"] #error').css('display', 'none');

        let name = $('[name="contactForm"] #name').val().trim();
        let email = $('[name="contactForm"] #email').val().trim();
        let pNumber = $('[name="contactForm"] #pNumber').val().trim();
        let comment = $('[name="contactForm"] #comment').val().trim();

        if (name && email && pNumber && comment && name != "" && comment != "" && 
            validPhonenumber(pNumber) && ValidateEmail(email)) {
            
            // TO DO - fetch
        } else {
            errorLabel.css('display', 'initial').html('Invalid error!');
        }
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
