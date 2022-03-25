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
    
    $("div[data-type= 'products-collections'] ").each(function (i) {
      productData(this);
    });
    $("div[data-type= 'banners'] ").each(function (i) {
      bannerData(this);
    });
  }
  init();
  // Handel event
  // $(document).bind("DOMNodeInserted", function (e) {
  //   if ($(e.target).attr("id")) {
  //     const regexExp =
  //       /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
  //     const str = $(e.target).attr("id").substring(1);

  //     if (regexExp.test(str)) {
  //       if ($(e.target).attr("data-type") == "products-collections")
  //         productData(e.target);
  //       else if ($(e.target).attr("data-type") == "banners")
  //         bannerData(e.target);
  //     }
  //   }
  // });
 
});
