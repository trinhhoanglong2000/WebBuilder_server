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
        image : null,
        caption: "Bo suu tap mua he 1",
        description: "Day chinh la bo suu tap mua he qua kinh khung",
        type: null
    },
    {
        id: 2,
        categoryId: 1,
        image : null,
        caption: "Bo suu tap mua he 2",
        description: "Day chinh la bo suu tap mua he qua kinh khung",
        type: null
    },
    {
        id: 3,
        categoryId: 1,
        image : null,
        caption: "Bo suu tap mua he 3",
        description: "Day chinh la bo suu tap mua he qua kinh khung",
        type: null
    },
    {
        id: 4,
        categoryId: 2,
        image : null,
        caption: "Bo suu tap mua dong 1",
        description: "Day chinh la bo suu tap mua dong qua kinh khung",
        type: null
    },
    {
        id: 5,
        categoryId: 2,
        image : null,
        caption: "Bo suu tap mua dong 2",
        description: "Day chinh la bo suu tap mua dong qua kinh khung",
        type: null
    },
    {
        id: 6,
        categoryId: 2,
        image : null,
        caption: "Bo suu tap mua dong 3",
        description: "Day chinh la bo suu tap mua dong qua kinh khung",
        type: null
    },
    {
        id: 7,
        categoryId: 3,
        image : null,
        caption: "Bo suu tap mua thu 1",
        description: "Day chinh la bo suu tap mua thu qua kinh khung",
        type: null
    },
    {
        id: 8,
        categoryId: 3,
        image : null,
        caption: "Bo suu tap mua thu 2",
        description: "Day chinh la bo suu tap mua thu qua kinh khung",
        type: null
    },
    {
        id: 9,
        categoryId: 3 ,
        image : null,
        caption: "Bo suu tap mua thu 3",
        description: "Day chinh la bo suu tap mua thu qua kinh khung",
        type: null
    },
]



exports.getAllCarouselCollections = (storeId) => {
    console.log(storeId)
    try {
        return Collections.filter((value)=> value.storeID == storeId);
    } catch (error) {
        console.log(error);
        return null;
    }
};