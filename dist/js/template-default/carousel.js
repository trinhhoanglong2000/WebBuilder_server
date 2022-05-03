async function CarouselsGenerateCodeItem(categoryId, itemID) {
  const response = await fetch(`http://localhost:5000/collections/category/${categoryId}`
    , {
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }).then( res =>res.json()).then(myJson => myJson.data).then(data =>{
      let carouselIndicators = $(`#${itemID} .carousel-indicators`)[0]
      let carouselInner = $(`#${itemID} .carousel-inner`)[0];
      carouselIndicators.innerHTML = "";
      carouselInner.innerHTML = "";
      data.forEach((item, index) => {
        let htmlButtonInsert = `
      <button type="button" data-bs-target="#${itemID}" data-bs-slide-to="${index}" class = "${index == 0 ? "active" : ""}" aria-label="Slide ${index}"></button>
      `
        carouselIndicators.insertAdjacentHTML("beforeend", htmlButtonInsert);
        let htmlCarouselItemInsert = `
      <div class="carousel-item ${index == 0 ? "active" : ""}">
        <img src="${item.image}" class="d-block w-100" alt="${item.image}">
        <div class="carousel-caption d-none d-md-block">
          <div class = "ezMall-carousel-contents">
            <h2 class="bolder">${item.caption}</h2>
            <p>${item.description}</p>
            <a class="btn ezMall-btn bolder" href=${item.link} role="button">Shop Now</a>
          </div>
        </div>
      </div>
    `
        carouselInner.insertAdjacentHTML("beforeend", htmlCarouselItemInsert)
      })
    })
}
function CarouselsGenerateCodeStart() {
  let carouselListElement = $(`div[ez-mall-type='carousel']`)
  for (let i = 0; i < carouselListElement.length; i++) {
    let categoryId = carouselListElement[i].getAttribute("data");
    let itemID = carouselListElement[i].getAttribute("id");
    CarouselsGenerateCodeItem(categoryId, itemID)
  }
}

//SetListenOnChangeAtrribute();
$(document).ready(function () {
  if ($('[data-gjs-type="wrapper"]').length) {
    $('[data-gjs-type="wrapper"]').ready(function () {
      CarouselsGenerateCodeStart();
    })
  }
  else {
    CarouselsGenerateCodeStart();
  }

})
