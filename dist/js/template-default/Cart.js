function payMent(){
    let listIdCheck = [];
    let listProductBuy= [];
    let productCheck = $(".ezMall-cart-item");
    if(productCheck.length > 0){
        for(let i =0 ;i < productCheck.length; i++){
            let isCheckked = $(productCheck[i]).find("input.ezMall-cart-item-check:checked");
            if(isCheckked.length!=0){
                listIdCheck.push(isCheckked[i].id)
            }
        }
        console.log(listIdCheck)
        let cart = JSON.parse(localStorage.getItem('cart'));
        for(let i =0; i < cart.length;i++){
            if(cart[i].is_variant){
                if(listIdCheck.includes( cart[i].id)){
                    listProductBuy.push(cart[i])
                }
            }else{
                if(listIdCheck.includes( cart[i].variant_id)){
                    listProductBuy.push(cart[i])
                }
            }
        }
        console.log(productCheck)
    }
}