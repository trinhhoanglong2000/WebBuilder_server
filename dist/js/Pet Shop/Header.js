const generateHeaderDropdownMenu = (mNavigation) => {
    let navbar = [];
    if (mNavigation) {
        mNavigation = mNavigation?.slice(0, 6);
        mNavigation.forEach((element) => {
            if (element.children && element.children.length > 0) {
                let dropdown =  `<li class="nav-item">
                <a class="nav-link" href="${element.link}">
                    ${element.title} <i class="fa fa-chevron-down" aria-hidden="true"></i>
                </a>
                <ul class="submenu">`;

                element.children.forEach((element, index) => {
                    if (element.children && element.children.length > 0) {
                        if (index != 0) {
                            dropdown += `<hr>`
                        }

                        dropdown += `<li> <a class="nav-link" href="${element.link}"> ${element.title} <i class="fa fa-chevron-right" aria-hidden="true"></i> </a>
                                        <ul class="submenu2">`

                        element.children.forEach((element, index) => {
                            if (index != 0) {
                                dropdown += `<hr>`
                            }
                            dropdown += `<li><a href="${element.link}"> ${element.title} </a></li>`;
                        });

                        dropdown += `</ul>`

                    } else {
                        if (index != 0) {
                            dropdown += `<hr>`
                        }

                        dropdown += `<li> <a href="${element.link}"> ${element.title}</a>  </li>`
                    }
                });

                navbar.push(dropdown)
            } else {
                navbar.push(`<li class="nav-item">
                    <a href="${element.link}" class="nav-link"> ${element.title} </a>
                    <a href="${element.link}" class="sx-nav-link">
                        ${element.title}
                    </a>
                </li>`)
            }
        })

        return navbar;
    };
    return navbar;
}

const generateHeaderExpandMenu = (mNavigation) => {
    let navbar = [];
    if (mNavigation) {
        mNavigation = mNavigation?.slice(0, 4);
        mNavigation.forEach((element) => {
            if (element.children && element.children.length > 0) {
                let dropdown =  `<li class="nav-item">
                <a class="sx-nav-link expanded" href="${element.link}">
                    ${element.title} <i class="fa fa-chevron-right" aria-hidden="true"></i>
                </a>
                <ul class="navbar-nav expand-ul"><li class="expand-li"> <a class="back-button" role="button"> <i class="fa fa-chevron-left"></i> Back </a> </li>`;

                element.children.forEach((element) => {
                    if (element.children && element.children.length > 0) {
                        dropdown += `<li class="expand-li"> <a class="expanded" href="${element.link}"> ${element.title} <i class="fa fa-chevron-right" aria-hidden="true"></i> </a>
                                        <ul class="navbar-nav expand-ul2"><li> <a class="back-button" role="button"> <i class="fa fa-chevron-left"></i> Back </a> </li>`;

                        element.children.forEach((element) => {
                            dropdown += `<li><a href="${element.link}"> ${element.title} </a></li>`;
                        });

                        dropdown += `</ul></li>`;

                    } else {
                        dropdown += `<li class="expand-li"> <a href="${element.link}"> ${element.title}</a>  </li>`;
                    }
                });

                dropdown += "</ul>";

                navbar.push(dropdown)
            } else {
                navbar.push(`<li class="nav-item">
                    <a href="${element.link}" class="nav-link p-1"> ${element.title} </a>
                    <a href="${element.link}" class="sx-nav-link">
                        ${element.title}
                    </a>
                </li>`)
            }
        })

        return navbar;
    };
    return navbar;
}

//==============|Data Selector|============
function embedHeaderData(deploy) {
    $('nav[name="header"]').parent().css('overflow', 'initial')
    $('nav[name="header"]').parent().css('overflowX', 'initial')

    $('nav[name="header"]').find('#cartIcon').attr('href', '/cart');

    let serverURL = $('script.ScriptClass').attr('src').match(/.+(?=\/js|css)/gm)
    let storeId = $('nav[name="header"]').attr("store-id");
    
    fetch(`${serverURL}/stores/${storeId}/headerData`)
    .then((response) => response.json())
    .then((response) => {
        data = response.data;

        $('nav[name="header"] .navbar-brand').attr("href", "/home");

        $('nav[name="header"] .navbar-brand h4').text(data.storeName);
        
        $('nav[name="header"] .navbar-nav.dropdown').html(generateHeaderDropdownMenu(data.menuItems));
        $('nav[name="header"] .navbar-nav.expand').html(generateHeaderExpandMenu(data.menuItems));

        let searchBound = `<div id="searchBound" class="search-bound">
                                <button type="button" id="closeSearchBound"><i class="fa fa-arrow-right" aria-hidden="true"></i></button>
                                <input type="text" placeholder="Search...">
                                <span><i class="fa fa-search"></i></span>
                            </div>`;

        $('nav[name="header"]').append(searchBound);

        $('#closeSearchBound').on('click', function() {
            $('#searchBound').animate({width: '85px'}, function() {
                $('#searchBound').hide();
            });
        })
        
        $('i.fa.fa-search').on('click', function() {
            $('#searchBound').css('display', 'flex');
            $('#searchBound').animate({width: '350px'});
        })

        $('#searchBound span').on('click', function() { 
            let key = $('#searchBound input')?.val();
            if (key && key.trim() != "" && deploy) {
                window.location.href = `/collections?key=${key}`;
            }
        });

        $('#searchBound input').on('keydown', function(e) { 
            if (e.which == 13) {
                let key = $('#searchBound input')?.val();
                if (key && key.trim() != "" && deploy) {
                    window.location.href = `/collections?key=${key}`;
                }
            } else {
                return true;
            }
        });

        let cart = JSON.parse(localStorage.getItem('cart'));
        let numberProduct = cart? cart.length : 0;
        if (numberProduct == 0) {
            $('i.fa.fa-shopping-bag > span').addClass('d-none');
        } else {
            $('i.fa.fa-shopping-bag > span').removeClass('d-none');
            $('#numberSelectedProduct').html(numberProduct);
        }

        $('nav[name="header"] .sx-nav-link.expanded i').on('click', function() {
            $('nav[name="header"] .expand > .nav-item > a.sx-nav-link').css('display', 'none');
            $(this).parent().parent().css('display', 'initial')
            $(this).parent().siblings('.expand-ul').css('display', 'flex');
       
            $(this).parent().siblings('.expand-ul').find('li.expand-li > .back-button').on('click', function() {
                $('nav[name="header"] .expand > .nav-item > a.sx-nav-link').css('display', 'flex');
                $(this).parents('ul.expand-ul').css('display', 'none');
            });

            $(this).parent().siblings('.expand-ul').find('li > a.expanded i').on('click', function() {
                $(this).parent().parents('ul.expand-ul').find('li.expand-li > a').css('display', 'none');
                $(this).parent().siblings('.expand-ul2').css('display', 'flex');

                $(this).parent().siblings('.expand-ul2').find('li > .back-button').on('click', function() {
                    $(this).parent().parents('ul.expand-ul2').css('display', 'none');
                    $(this).parent().parents('ul.expand-ul').find('li.expand-li > a').css('display', 'flex');
                });
            });
        })
    });
}

$(document).ready(function () {
    if ($('[data-gjs-type="wrapper"]').length) {
        $('[data-gjs-type="wrapper"]').ready(function () {
            embedHeaderData(false);
        })
    }
    else {
        embedHeaderData(true);
    } 
})
