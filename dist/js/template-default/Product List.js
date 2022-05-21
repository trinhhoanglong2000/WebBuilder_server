let urlProductList = null;

function productData(e) {
    let products_data = [
      {
        title: "Product Title",
        price: "$100.00",
        thumbnail: "https://dummyimage.com/600x400/55595c/fff",
      },
    ];
    const id = $(e).data('ez-mall-collection') || " ";
  
    fetch(`${urlProductList}/collections/product/${id}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.data.products) 
        products_data = data.data.products;
      $(e)
      .find(".thumb-wrapper")
      .each(function (index) {
        $(this)
          .find("h4")
          .text(products_data[index % products_data.length].title);
        $(this)
          .find(".item-price strike")
          .text(products_data[index % products_data.length].price);
        $(this)
          .find(".item-price span")
          .text(products_data[index % products_data.length].price);
        $(this)
          .find("img").attr("src",products_data[index % products_data.length].thumbnail);
      });
    });
    
  }
  
  //Init
  function init() {
    if (!urlProductList){
      urlProductList = $('script.ScriptClass').attr('src').match(/^.*?(?=\/files)/gm)[0]
    }
  
    $("div[name='products-collections'] ").each(function (i) {
      productData(this);
    });
  }
  $(document).ready(function () {
    if ($('[data-gjs-type="wrapper"]').length) {
      $('[data-gjs-type="wrapper"]').ready(function () {
        init();
      });
    } else {
      init();
    }
  });
  