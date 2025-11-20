//Extract product name from URL
let product = window.location.href.split("product=")[1];
product = decodeURIComponent(product || "");

// Product list
let products = [
    {
        SKU: "DP8-001X",
        name: "Antra® DP8-001X, Auto Shading & Darkening Welding Helmet",
        price: 172.00,
        img: "../resources/DP8-001X.jpg"
    },
    {
        SKU: "DP5A-0000",
        name: "Antra® DP5A-0000, Auto Shading & Darkening Welding Helmet",
        price: 92.00,
        img: "../resources/DP5A.png"
    },
    {
        SKU: "DP3+-6404",
        name: "Antra® DP3+, Digital Solar Power Auto Darkening Welding Helmet",
        price: 87.00,
        img: "../resources/DP3+.jpg"
    }
];

let productsContainer = document.querySelector(".products");
let productsSection = document.querySelector(".products .product-list");

//If no specific product is requested, show all products
if (!product) {
    productsContainer.innerHTML = `
        <h2>OUR LATEST PRODUCTS</h2>
        <hr class="header center">
        <div class="product-list"></div>
    `;
    productsSection = document.querySelector(".products .product-list");    
    products.forEach(product => {
        productsSection.innerHTML += `
            <div class="product-card">
                <div class="product-image-container">
                    <img class="product-image" src="${product.img}" alt="${product.name}">
                </div>

                <h5>${product.name}</h5><br><br>
                <h3>$${product.price.toFixed(2)}</h3><br>
                <hr class="header center accent1">
                <br>
                <button class="card-button accent2" onclick="window.location.href='./?product=${encodeURIComponent(product.SKU)}'">Shop Now</button>
            </div>
        `
    });
} else{
    let selectedProduct = products.find(p => p.SKU === product); //Find product by SKU in the array
    if (selectedProduct) {
        productsContainer.innerHTML = `
            <div class="horizontal-row">
                <div class="row-item product-image-container shadow" style="flex-grow: 0.3;">
                    <img class="detailed-product-image" src="${selectedProduct.img}" alt="${selectedProduct.name}">
                </div>
                <div class="vertical-column row-item" style="text-align: left; flex-grow: 0.5; justify-content: space-between;">
                    <div>
                        <h3>${selectedProduct.name}</h3>
                        <hr class="header left accent2">
                    </div>
                    <div>
                        <h4>$${selectedProduct.price.toFixed(2)}</h4>
                        <button class="card-button accent1" onclick="alert('Added to cart!')">Add to Cart</button>
                    </div>
                </div>
            </div>
        `
    } else {
        productsSection.innerHTML = `<h2>Product not found.</h2>`;
    }
}