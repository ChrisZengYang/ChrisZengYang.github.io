let products = [
    {
        name: "Antra® DP8, Top Optical Class 1/1/1/1, Auto Shading & Darkening Welding Helmet extended Shade Range 3/5-9/9-14",
        price: 172.00,
        img: "../resources/DP8-001X.jpg"
    },
    {
        name: "Antra® DP5A, Auto Shading & Darkening Welding Helmet",
        price: 92.00,
        img: "../resources/helmet.png"
    }
];

let productsSection = document.querySelector(".products .product-list");

products.forEach(product => {
    productsSection.innerHTML += `
        <div class="product-card">
            <div class="product-image-container">
                <img class="product-image" src="${product.img}" alt="${product.name}">
            </div>

            <h3>${product.name}</h3><br><br>
            <h2>$${product.price.toFixed(2)}</h2><br>
            <hr class="header center accent1">
            <br>
            <button class="accent2">Shop Now</button>
        </div>
    `
});