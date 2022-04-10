$(document).ready(function () {
  const products = [
    {
      name: "TEST1",
      price: "$100.00",
      img: "HEHE",
    },
    {
      name: "TEST2",
      price: "$200.00",
      img: "HEHE",
    },
    {
      name: "TEST3",
      price: "$300.00",
      img: "HEHE",
    },
    {
      name: "TEST4",
      price: "$400.00",
      img: "HEHE",
    },
  ];
  const banners = [
    {
      name: "TEST1",
      description: "Test1",
    },
    {
      name: "TEST2",
      description: "Test2",
    },
    {
      name: "TEST3",
      description: "Test3",
    },
  ];
  //==============|Data Selector|============

  function productData(e) {
    console.log($(e))
    $(e)
      .find(".thumb-wrapper")
      .each(function (index) {
        $(this)
          .find("h4")
          .text(products[index % products.length].name);
        $(this)
          .find(".item-price strike")
          .text(products[index % products.length].price);
        $(this)
          .find(".item-price span")
          .text(products[index % products.length].price);
      });
  }
  function bannerData(e) {
    $(e)
      .find(".carousel-item")
      .each(function (index) {
        $(this)
          .find("h5")
          .text(banners[index % banners.length].name);
        $(this)
          .find("p")
          .text(banners[index % banners.length].description);
      });
  }
  //Init
  function init() {

    $("div[data-gjs-type= 'product-list'] ").each(function (i) {
      productData(this);
    });

  }
  init();

});
