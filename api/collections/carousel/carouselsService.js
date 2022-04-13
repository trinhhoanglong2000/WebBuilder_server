const Collections = [
    {
        categoryId: 1,
        storeID: 1,
        type: null,
        name: "Bo suu tap 1",
        thumnail: null,
        description: "Bo suu tap mua he",
    },
    {
        categoryId: 2,
        type: null,
        name: "Bo suu tap 2",
        thumnail: null,
        description: "Bo suu tap mua he",
        storeID: 1,
    },
    {
        categoryId: 3,
        storeID: 1,
        type: null,
        name: "Bo suu tap 3",
        thumnail: null,
        description: "Bo suu tap mua he",
    },
];
const Banners= [
    {
        id: 1,
        categoryId: 1,
        image : `https://cdn.shopify.com/s/files/1/0607/3833/9033/files/Sale_Rustic_Ecommerce_Shopping_Website_Banner_1400_x_500_px_3840_x_2160_px_5_1400x.png?v=1647988469`,
        caption: "Bo suu tap mua he 1",
        description: "Day chinh la bo suu tap mua he qua kinh khung",
        type: null
    },
    {
        id: 2,
        categoryId: 1,
        image : `https://wallpaperaccess.com/full/1448061.jpg`,
        caption: "Bo suu tap mua he 2",
        description: "Day chinh la bo suu tap mua he qua kinh khung",
        type: null
    },
    {
        id: 3,
        categoryId: 1,
        image : `https://www.incimages.com/uploaded_files/image/1920x1080/getty_506481516_200011512000928031_324666.jpg`,
        caption: "Bo suu tap mua he 3",
        description: "Day chinh la bo suu tap mua he qua kinh khung",
        type: null
    },
    {
        id: 4,
        categoryId: 2,
        image : `https://previews.123rf.com/images/beo88/beo881801/beo88180100028/93968762-fashion-mens-clothing-and-accessories-in-casual-style-flat-lay-copy-space.jpg`,
        caption: "Bo suu tap mua dong 1",
        description: "Day chinh la bo suu tap mua dong qua kinh khung",
        type: null
    },
    {
        id: 5,
        categoryId: 2,
        image : `https://previews.123rf.com/images/stillab/stillab1709/stillab170900060/86689103-fashionable-concept-men-s-clothes-with-accessories-items-on-white-wooden-board-background-with-copy-.jpg`,
        caption: "Bo suu tap mua dong 2",
        description: "Day chinh la bo suu tap mua dong qua kinh khung",
        type: null
    },
    {
        id: 6,
        categoryId: 2,
        image : `https://previews.123rf.com/images/peshkov/peshkov1506/peshkov150600070/69319803-set-of-men-s-clothing-and-accessories-on-white-background.jpg`,
        caption: "Bo suu tap mua dong 3",
        description: "Day chinh la bo suu tap mua dong qua kinh khung",
        type: null
    },
    {
        id: 7,
        categoryId: 3,
        image : `https://img.freepik.com/free-psd/fashion-store-banner-template_23-2148675200.jpg?w=2000`,
        caption: "Bo suu tap mua thu 1",
        description: "Day chinh la bo suu tap mua thu qua kinh khung",
        type: null
    },
    {
        id: 8,
        categoryId: 3,
        image : `https://img.freepik.com/free-psd/horizontal-banner-template-online-fashion-sale_23-2148585405.jpg?w=2000`,
        caption: "Bo suu tap mua thu 2",
        description: "Day chinh la bo suu tap mua thu qua kinh khung",
        type: null
    },
    {
        id: 9,
        categoryId: 3 ,
        image : `https://img.freepik.com/free-psd/banner-template-online-fashion-sale_23-2148585403.jpg?w=2000`,
        caption: "Bo suu tap mua thu 3",
        description: "Day chinh la bo suu tap mua thu qua kinh khung",
        type: null
    },
]



exports.getAllCarouselCollections = (storeId) => {
    try {
        return Collections.filter((value)=> value.storeID == storeId);
    } catch (error) {
        console.log(error);
        return null;
    }
};
exports.getCategoryData = (categoryId) => {
    try {
        return Banners.filter((value)=> value.categoryId == categoryId);
    } catch (error) {
        console.log(error);
        return null;
    }
};