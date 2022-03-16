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
  //Init
  function init() {
    $("div[name= 'products-collections'] ").each(function (i) {
      $(this)
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
    });
  }
  init();
  // Handel event
  $(document).bind("DOMNodeInserted", function (e) {
    if ($(e.target).attr("id")) {
      const regexExp =
        /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
      const str = $(e.target).attr("id").substring(1);

      if (regexExp.test(str)) {
        init();
      }
    }
  });
});
