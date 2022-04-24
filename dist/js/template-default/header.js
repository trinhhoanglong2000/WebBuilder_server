const config = {};
config.logoURL = "https://ezmall-bucket.s3.ap-southeast-1.amazonaws.com/assets/621b5a807ea079a0f7351fb8.jpeg"

// Example Data
config.storeName = "Store nameee";

// Example Data
config.headerNavigation = [{
    name: "ProductAAA",
    link: "#"
}, {
    name: "ContactVBBB",
    link: "#"
}];

const getHeaderNavigationButton = (mNavigation) => {
    let navbar = [];

    if (mNavigation) {
        mNavigation.forEach((element) => {
            navbar.push(`<li data-highlightable="1" class="nav-item"><a href="#" class="nav-link p-1"> ${element.name} </a></li>`)
        })

        return navbar;
    };
    return navbar;
}

//==============|Data Selector|============

function embeData(e) {
   
    if (config.logoURL) {
        $(e).find(".navbar-brand").html(`<img src=${config.logoURL}></img>`)
        
    } else {
        $(e).find(".navbar-brand").html(`<h4>${config.storeName}</h4>`)
    }

    $(e).find(".navbar-nav").html(getHeaderNavigationButton(config.headerNavigation))
}


$(document).ready(function () {

    if ($('[data-gjs-type="wrapper"]').length) {
        $('[data-gjs-type="wrapper"]').ready(function () {
            embeData(this);
        })
    }
    else {
        embeData(this);
    }

})
