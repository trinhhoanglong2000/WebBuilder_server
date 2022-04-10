carousel_block_js = true;
//('Carousel are loaded');
console.log(document)
function callback(mutationList) {
  mutationList.forEach(function (mutation) {
    switch (mutation.type) {
      case "attributes":
        switch (mutation.attributeName) {
          case "data":
            let carouselIndicators = $(`#${mutation.target.getAttribute("id")} .carousel-indicators`)[0]
            let carouselInner = $(`#${mutation.target.getAttribute("id")} .carousel-inner`)[0];
            carouselIndicators.innerHTML  ="";
            carouselInner.innerHTML = "";
            CarouselsGenerateCodeItem(mutation.target.getAttribute("data"),mutation.target.getAttribute("id"))
            break
        }
        break;
    }alert
  });
}

function SetListenOnChangeAtrribute() {
  let carouselListElement = $("div[ez-mall-type='carousel']")
  for (let i = 0; i < carouselListElement.length; i++) {
    let observer = new MutationObserver(callback);
    observer.observe(carouselListElement[i], {
      attributeFilter: ["data"],
      attributeOldValue: true,
      subtree: true
    });
  }
}

async function CarouselsGenerateCodeItem(categoryId, itemID) {
  const response = await fetch(`http://localhost:5000/collections/category/${categoryId}`
    , {
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  let myJson = await response.json();
  let data = myJson.data;
  console.log(myJson)
  let carouselIndicators = $(`#${itemID} .carousel-indicators`)[0]
  let carouselInner = $(`#${itemID} .carousel-inner`)[0];
  data.forEach((item, index) => {
    let htmlButtonInsert = `
  <button type="button" data-bs-target="#myCarousel" data-bs-slide-to="${index}" class = "${index == 0 ? "active" : ""}" aria-label="Slide ${index}"></button>
  `
    carouselIndicators.insertAdjacentHTML("beforeend", htmlButtonInsert);

    let htmlCarouselItemInsert = `
  <div class="carousel-item ${index == 0 ? "active" : ""}">
    <img src="${item.image}" class="d-block w-100" alt="${item.image}">
    <div class="carousel-caption d-none d-md-block">
      <h5>${item.caption}</h5>
      <p>${item.description}</p>
    </div>
  </div>
`
    carouselInner.insertAdjacentHTML("beforeend", htmlCarouselItemInsert)
  })
}
function CarouselsGenerateCodeStart() {
  let carouselListElement = $(`div[ez-mall-type='carousel']`)
  for (let i = 0; i < carouselListElement.length; i++) {
    let categoryId = carouselListElement[i].getAttribute("data");
    let itemID = carouselListElement[i].getAttribute("id");
    CarouselsGenerateCodeItem(categoryId,itemID)
  }
}

//SetListenOnChangeAtrribute();
$(document).ready(function () {
  CarouselsGenerateCodeStart();
})