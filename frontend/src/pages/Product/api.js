// Mock products data
let productsData = [
    { id: 1, name: 'Product 1', price: 10 },
    { id: 2, name: 'Product 2', price: 20 },
    { id: 3, name: 'Product 3', price: 30 },
  ];
  
  // Function to fetch products
  export const fetchProducts = () => {
    return new Promise((resolve, reject) => {
      // Simulate API call delay
      setTimeout(() => {
        resolve(productsData);
      }, 500);
    });
  };
  
  // Function to export products
  export const exportProducts = (products) => {
    return new Promise((resolve, reject) => {
      // Simulate API call delay
      setTimeout(() => {
        // For demonstration, just resolve with the products array
        resolve(products);
      }, 500);
    });
  };
  
  // Function to import products
  export const importProducts = (file) => {
    return new Promise((resolve, reject) => {
      // Simulate API call delay
      setTimeout(() => {
        // For demonstration, just resolve with the file name
        resolve(file.name);
      }, 500);
    });
  };
  
  // Function to add a new product
  export const addProduct = (newProductData) => {
    return new Promise((resolve, reject) => {
      // Simulate generating a unique ID
      const newProductId = productsData.length + 1;
      // Create a new product object
      const newProduct = { id: newProductId, ...newProductData };
      // Add the new product to the products array
      productsData.push(newProduct);
      // Simulate API call delay
      setTimeout(() => {
        resolve(newProduct);
      }, 500);
    });
  };
  