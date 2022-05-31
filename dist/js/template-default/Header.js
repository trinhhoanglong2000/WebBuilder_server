const generateHeaderMenu = (mNavigation) => {
    let navbar = [];
    if (mNavigation) {
        mNavigation.forEach((element) => {
            navbar.push(`<li data-highlightable="1" class="nav-item"><a href="${element.name}" class="nav-link p-1"> ${element.name} </a></li>`)
        })

        return navbar;
    };
    return navbar;
}

//==============|Data Selector|============
function embedHeaderData() {
    let serverURL = $('script.ScriptClass').attr('src').match(/.+(?=\/js|css)/gm)
    let storeId = $('nav[name="header"]').attr("store-id");
    
    fetch(`${serverURL}/stores/${storeId}/headerData`)
    .then((response) => response.json())
    .then((response) => {
        data = response.data;

        $('nav[name="header"] .navbar-brand img').attr('src', data.logoURL)
        $('nav[name="header"] .navbar-brand h4').text(data.storeName)
        if (data.logoURL) {
            $('nav[name="header"] .navbar-brand img').removeClass("d-none");
            $('nav[name="header"] .navbar-brand h4').addClass("d-none");
        } else {
            $('nav[name="header"] .navbar-brand img').addClass("d-none");
            $('nav[name="header"] .navbar-brand h4').removeClass("d-none");
        }
        
        $('nav[name="header"] .navbar-nav').html(generateHeaderMenu(data.menuItems));
    });
}

$(document).ready(function () {
    if ($('[data-gjs-type="wrapper"]').length) {
        $('[data-gjs-type="wrapper"]').ready(function () {
            embedHeaderData();
        })
    }
    else {
        embedHeaderData();
    } 
})
