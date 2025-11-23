//Align Product Card Components to each other so it doesn't look bad
function alignProductCards() {
    let productCards = document.querySelectorAll(".product-card");
    const numOfChildren = productCards[0].children.length;

    if(!productCards.length) return; // No product cards found

    for(let i = 0; i < numOfChildren; i++) {
        let maxHeight = 0;

        //Find the max height of this child index
        productCards.forEach(card => {
            const child = card.children[i];
            if(child.offsetHeight > maxHeight) {
                maxHeight = child.offsetHeight;
            }
        });
        console.log(maxHeight)

        productCards.forEach(card => {
            const child = card.children[i];
            child.style.height = maxHeight + "px";
        });
    }
}

//Extract product name from URL
let urlParams = new URLSearchParams(window.location.search);
let product = urlParams.get('product');
let type = urlParams.get('type');

// Product list
let products = [
    {
        type: "helmets", //Product Type
        SKU: "DP8-G", //Product Code
        name: "Antra® DP8-G, Auto Shading & Darkening Welding Helmet", //Product Name
        price: 199.00, //Product Price
        img: "../resources/DP8-G.jpg", //Product Image Path
        sale: 119.00 //Sale Price (if applicable)
    },
    {
        type: "helmets",
        SKU: "DP8-001X", 
        name: "Antra® DP8-001X, Auto Shading & Darkening Welding Helmet", 
        price: 274.00, 
        img: "../resources/DP8-001X.jpg", 
        sale: 173.00
    },
    {
        type: "helmets",
        SKU: "DP5A-0000",
        name: "Antra® DP5A-0000, Auto Shading & Darkening Welding Helmet",
        price: 92.00,
        img: "../resources/DP5A.png"
    },
    {
        type: "helmets",
        SKU: "DP3+-6404",
        name: "Antra® DP3+, Digital Solar Power Auto Darkening Welding Helmet",
        price: 144.00,
        img: "../resources/DP3+.jpg",
        sale: 87.00
    },
    {
        type: "helmets",
        SKU: "DP6-12",
        name: "Antra® DP6-12, Auto Darkening Welding Helmet",
        price: 97.00,
        img: "../resources/DP6-12.jpg"
    },
    {
        type: "helmets",
        SKU: "AH7-860-6218",
        name: "Antra® AH7-860-6218, Welding Helmet",
        price: 108.00,
        img: "../resources/AH7-860-6218.jpg"
    },
    {
        type: "gear",
        SKU: "WGL-118",
        name: "Antra™ Premium Leather Split Cowhide Welding Gloves with Cushion Liner",
        price: 19.00,
        img: "../resources/gloves.jpg",
    },
    {
        type: "gear",
        SKU: "PAPR",
        name: "Antra® PAPR, Powered Air Purifying Respirator for Welding",
        price: 1295.00,
        img: "../resources/PAPR.jpg",
        sale: 864.00
    },
    {
        type: "gear",
        SKU: "WGL-COMB",
        name: "Combo of Welding Gloves for MIG, TIG, MMA",
        price: 36.00,
        img: "../resources/WGL-COMB.jpg",
    }
];

//Get the products container and section elements
let productsContainer = document.querySelector(".products");
let productsSection = document.querySelector(".products .product-list");

//If no specific product is requested, show all products (or filtered by type)
if (!product) {
    if (type) {
        //Add header and product list container
        productsContainer.insertAdjacentHTML("afterbegin", `
            <h2>${products.filter(p => p.type === type).length > 0 ? "SHOP " + type.toUpperCase() : "NO PRODUCTS FOUND"}</h2> <!-- Make sure there are products of that type -->
            <hr class="header center">
        `);

        //Create product list container after the filter dropdown
        productsContainer.insertAdjacentHTML("beforeend", `
            <div class="product-list"></div>
        `);

        productsSection = document.querySelector(".products .product-list");

        products = products.filter(p => p.type === type); //Filter products by type if specified
        products.forEach(product => {
            if(product.type === type) {
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
                        <a href="./?product=${encodeURIComponent(product.SKU)}"><button class="card-button accent2">Shop Now</button></a>
                    </div>
                `
            }
        });
        
        alignProductCards();
    } else {
        //Add header and product list container
        productsContainer.insertAdjacentHTML("afterbegin", `
            <h2>OUR LATEST PRODUCTS</h2>
            <hr class="header center">
        `);

        //Create product list container after the filter dropdown
        productsContainer.insertAdjacentHTML("beforeend", `
            <div class="product-list"></div>
        `);

        productsSection = document.querySelector(".products .product-list");

        //Fill the product list with all the products 
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
                    <a href="./?product=${encodeURIComponent(product.SKU)}"><button class="card-button accent2">Shop Now</button></a>
                </div>
            `
        });
        
        alignProductCards();
    }
} else{
    let selectedProduct = products.find(p => p.SKU === product); //Find product by SKU in the array

    //Find requested product and display its details
    if (selectedProduct !== undefined) {
        productsContainer.innerHTML = `
            <a href="./"><button class="transparent" style="float: left; font-size: 1rem; margin-bottom: 50px;">&larr; Back to Products</button></a>
            <div class="horizontal-row" style="clear: left;">
                <div class="row-item product-image-container shadow" style="flex-grow: 0.3;">
                    <img src="../resources/saletag.png" class="sale-badge" style="${selectedProduct.sale ? '' : 'display: none;'}">
                    <p class="sale-text" style="${selectedProduct.sale ? '' : 'display: none;'}">${((selectedProduct.price - selectedProduct.sale) / selectedProduct.price * 100).toFixed(0)}% off</p>
                    <img class="detailed-product-image" src="${selectedProduct.img}" alt="${selectedProduct.name}">
                </div>
                <div class="vertical-column row-item" style="text-align: left; flex-grow: 0.5; justify-content: space-between;">
                    <div>
                        <h3>${selectedProduct.name}</h3>
                        <hr class="header left accent2">
                    </div>
                    <div>
                        <div class="horizontal-row" style="justify-content: flex-start; align-items: center; gap: 20px;">
                            ${selectedProduct.sale ? `<h4>$${selectedProduct.sale.toFixed(2)}</h4>` : ""}
                            <h4 style="${selectedProduct.sale ? 'color: grey; text-decoration: line-through; text-decoration-color: red;' : ''}">$${selectedProduct.price.toFixed(2)}</h4>
                        </div>
                        <button class="card-button accent1" onclick="alert('Added to cart!')">Add to Cart</button>
                    </div>
                </div>
            </div>
        `
    } else {
        //Display a message if the product is not found
        productsContainer.innerHTML = `<h2>Product not found.</h2>`;
    }
}