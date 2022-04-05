carousel_block_js = true;
debugger
alert('Carousel are loaded');
console.log(document)
function callback(mutationList) {
  mutationList.forEach(function (mutation) {
    switch (mutation.type) {
      case "attributes":
        switch (mutation.attributeName) {
          case "data":
            console.log(mutation.target.getAttribute("data"));
            break
        }
        break;
    }
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
function GetData() {

}
async function GenerateCode() {
  let carouselListElement = $("div[ez-mall-type='carousel']")
  for (let i = 0; i < carouselListElement.length; i++) {
    let categoryId = carouselListElement[i].getAttribute("data");
    const response = await fetch(`http://localhost:5000/collections/category/${categoryId}`
      , {
        mode: 'cors',
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      });
    let myJson = await response.json();
    debugger
    let carouselIndicators = $("div[ez-mall-type='carousel'] .carousel-indicators")[0]
    let htmlButtonInsert = `<button type="button" data-bs-target="#myCarousel" data-bs-slide-to="1" aria-label="Slide 4"></button>`
    carouselIndicators.insertAdjacentHTML("beforeend", htmlButtonInsert);

    let carouselInner = $("div[ez-mall-type='carousel'] .carousel-inner")[0];
    let htmlCarouselItemInsert = `
    <div class="carousel-item">
      <img src="https://dummyimage.com/1360x540/55595c/fff " class="d-block w-100" alt="https://dummyimage.com/1360x540/55595c/fff ">
      <div class="carousel-caption d-none d-md-block">
        <h5>NEW slide label</h5>
        <p>Some representative placeholder content for the second slide.</p>
      </div>
    </div>
  `
    carouselInner.insertAdjacentHTML("beforeend", htmlCarouselItemInsert)
  }
}
GenerateCode();
SetListenOnChangeAtrribute();

