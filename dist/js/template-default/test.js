
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

//Init
function init() {

  $("div[data-gjs-type= 'product-list'] ").each(function (i) {
    productData(this);
  });
}
$(document).ready(function () {

  if ($('[data-gjs-type="wrapper"]').length){
    $('[data-gjs-type="wrapper"]').ready(function(){
      init();
  
    })
  }
  else{
    init();

  }
  
})
