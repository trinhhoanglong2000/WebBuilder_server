async function CarouselsGenerateCodeItem(e) {
  const categoryId = e.getAttribute("data");
  const itemID = $(e).find(".ezMall-carousel").attr("id")
  if(categoryId == null){
    Render(null,itemID,e)
  }else{
    const rootUrl= $('script.ScriptClass').attr('src').match(/.+(?=\/js|css)/gm)
    await fetch(`${rootUrl}/collections/banner/${categoryId}`
    , {
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }).then( res =>res.json()).then(myJson => myJson.data).then(data =>{
      Render(data,itemID,e)
    }).catch(error => {
      console.log(error)
      insertCarouselData(defaultData, carouselIndicators, carouselInner)
  })
  }
}

function Render(data,itemID,e){
  const defaultData = [
  {
      image: "https://dummyimage.com/1980x1080/55595c/ffffff",
      caption: "Image banner",
      description: "Give customers details about the banner image(s) or content on the template.",
      link: "/",
    },
    {
      image: "https://dummyimage.com/1980x1080/55595c/ffffff",
      caption: "Image banner",
      description: "Give customers details about the banner image(s) or content on the template.",
      link: "/",
    },
    {
      image: "https://dummyimage.com/1980x1080/55595c/ffffff",
      caption: "Image banner",
      description: "Give customers details about the banner image(s) or content on the template.",
      link: "/",
    }
  ]
  let listBanners = data == null ? [] : data.listBanners;
  let carouselIndicators =$(e).find('.carousel-indicators')[0];
  let carouselInner =  $(e).find('.carousel-inner')[0]
  carouselIndicators.innerHTML = "";
  carouselInner.innerHTML = "";
  if (listBanners == null || typeof listBanners == "undefined"){
    listBanners = [...defaultData]
  }
  else if (listBanners.length == 0) {
    listBanners = [...defaultData]
  } 
  listBanners.forEach((item, index) => {
    let htmlButtonInsert = `
  <button type="button" data-bs-target="#${itemID}" data-bs-slide-to="${index}" class = "${index == 0 ? "active" : ""}" aria-label="Slide ${index}"></button>
  `
    carouselIndicators.insertAdjacentHTML("beforeend", htmlButtonInsert);
    let htmlCarouselItemInsert = `
  <div class="carousel-item ${index == 0 ? "active" : ""}">
    <div  class="d-block w-100 image-container">
      <img src="${item.image}" alt="${item.image}">
    </div>
    <div class="carousel-caption">
      <div class = "ezMall-carousel-contents">
        <div class="ezMall-carousel-text-container d-block">
          <h2 class="bolder">${item.caption}</h2>
          <p>${item.description}</p>
          <a class="btn ezMall-btn bolder" href=${item.link} role="button">Shop Now</a>
          </div>
      </div>
    </div>
  </div>
`
    carouselInner.insertAdjacentHTML("beforeend", htmlCarouselItemInsert)
  })
}

function CarouselsGenerateCodeStart() {
  $("div[ez-mall-type='carousel']").each(function (i) {
    CarouselsGenerateCodeItem(this)
  });
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