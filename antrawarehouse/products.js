//Extract product name from URL
let product = window.location.href.split("product=")[1];
product = decodeURIComponent(product || "");

// Product list
let products = [
    {
        SKU: "DP8-001X", //Product Code
        name: "Antra® DP8-001X, Auto Shading & Darkening Welding Helmet", //Product Name
        price: 274.00, //Product Price
        img: "../resources/DP8-001X.jpg", //Product Image Path
        sale: 173.00 //Sale Price (if applicable)
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
        price: 144.00,
        img: "../resources/DP3+.jpg",
        sale: 87.00
    },
    {
        SKU: "DP6-12",
        name: "Antra® DP6-12, Auto Darkening Welding Helmet",
        price: 97.00,
        img: "../resources/DP6-12.jpg"
    },
    {
        SKU: "AH7-860-6218",
        name: "Antra® AH7-860-6218, Welding Helmet",
        price: 108.00,
        img: "../resources/AH7-860-6218.jpg"
    }
];

//Get the products container and section elements
let productsContainer = document.querySelector(".products");
let productsSection = document.querySelector(".products .product-list");

//If no specific product is requested, show all products
if (!product) {
    //Add header and product list container
    productsContainer.innerHTML = `
        <h2>OUR LATEST PRODUCTS</h2>
        <hr class="header center">
        <div class="product-list"></div>
    `;

    //Fill the product list with all the products
    productsSection = document.querySelector(".products .product-list");    
    products.forEach(product => {
        productsSection.innerHTML += `
            <div class="product-card">
                <div class="product-image-container">
                    ${product.sale ? `
                        <img src="../resources/saletag.png" class="sale-badge">
                        <p class="sale-text">${((product.price - product.sale) / product.price * 100).toFixed(0)}% off</p>
                    ` : ""}
                    <img class="product-image" src="${product.img}" alt="${product.name}">
                </div>

                <h5>${product.name}</h5><br><br>

                <div>
                    ${product.sale ? `<h3>$${product.sale.toFixed(2)}</h3>` : ""}
                    <h3 style="${product.sale ? 'color: grey; text-decoration: line-through; text-decoration-color: red;' : ''}">$${product.price.toFixed(2)}</h3>
                </div>
                
                <br>
                <hr class="header center accent1">
                <br>
                <button class="card-button accent2" onclick="window.location.href='./?product=${encodeURIComponent(product.SKU)}'">Shop Now</button>
            </div>
        `
    });
} else{
    let selectedProduct = products.find(p => p.SKU === product); //Find product by SKU in the array

    //Find requested product and display its details
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