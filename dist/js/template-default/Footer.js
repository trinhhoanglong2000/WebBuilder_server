
//==============|Data Selector|============
function embedFooterData() {
    let serverURL = $('script.ScriptClass').attr('src').match(/.+(?=\/js|css)/gm)

    $('div[name="QuickLink"]').each(function() {
        const menu = $(this).find('.quicklinks-menu');
        const id = $(this).attr('menu-collection')
        if (!id) return;
        
        fetch(`${serverURL}/menu/${id}`)
        .then((response) => response.json())
        .then((response) => {
            if (response.data?.listMenuItem) {
                menu_data = response.data.listMenuItem;
            }
            let data = "";
            menu_data.forEach(element => data += `<li><a href="${element.link}">${element.name}</a></li>`);

            menu.html(data);
        });
    });
}

$(document).ready(function () {
    if ($('[data-gjs-type="wrapper"]').length) {
        $('[data-gjs-type="wrapper"]').ready(function () {
            embedFooterData();
        })
    }
    else {
        embedFooterData();
    }
})
