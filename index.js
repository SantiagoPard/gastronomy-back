const express = require('express');
const cors = require('cors');
const { products, categories, restaurantInfo } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a Gastronomy Heaven API',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      categories: '/api/categories',
      restaurant: '/api/restaurant',
      productById: '/api/products/:id',
      productsByCategory: '/api/products/category/:category'
    }
  });
});

// Obtener todos los productos
app.get('/api/products', (req, res) => {
  try {
    const { category, minPrice, maxPrice, available, spicyLevel, search } = req.query;
    
    let filteredProducts = [...products];
    
    // Filtrar por categoría
    if (category) {
      filteredProducts = filteredProducts.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Filtrar por precio mínimo
    if (minPrice) {
      filteredProducts = filteredProducts.filter(product => 
        product.price >= parseFloat(minPrice)
      );
    }
    
    // Filtrar por precio máximo
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(product => 
        product.price <= parseFloat(maxPrice)
      );
    }
    
    // Filtrar por disponibilidad
    if (available !== undefined) {
      filteredProducts = filteredProducts.filter(product => 
        product.available === (available === 'true')
      );
    }
    
    // Filtrar por nivel de picante
    if (spicyLevel !== undefined) {
      filteredProducts = filteredProducts.filter(product => 
        product.spicyLevel <= parseInt(spicyLevel)
      );
    }
    
    // Búsqueda por texto
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(searchTerm)
        )
      );
    }
    
    res.json({
      success: true,
      count: filteredProducts.length,
      data: filteredProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
});

// Obtener producto por ID
app.get('/api/products/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el producto',
      error: error.message
    });
  }
});

// Obtener productos por categoría
app.get('/api/products/category/:category', (req, res) => {
  try {
    const category = req.params.category;
    const categoryProducts = products.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    );
    
    if (categoryProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron productos en esta categoría'
      });
    }
    
    res.json({
      success: true,
      category: category,
      count: categoryProducts.length,
      data: categoryProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos por categoría',
      error: error.message
    });
  }
});

// Obtener todas las categorías
app.get('/api/categories', (req, res) => {
  try {
    const categoriesWithCount = categories.map(category => {
      const count = products.filter(product => product.category === category).length;
      return {
        name: category,
        count: count
      };
    });
    
    res.json({
      success: true,
      data: categoriesWithCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías',
      error: error.message
    });
  }
});

// Obtener información del restaurante
app.get('/api/restaurant', (req, res) => {
  try {
    res.json({
      success: true,
      data: restaurantInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener información del restaurante',
      error: error.message
    });
  }
});

// Obtener productos destacados (mejor valorados)
app.get('/api/products/featured', (req, res) => {
  try {
    const featuredProducts = products
      .filter(product => product.rating >= 4.5)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
    
    res.json({
      success: true,
      count: featuredProducts.length,
      data: featuredProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos destacados',
      error: error.message
    });
  }
});

// Obtener estadísticas del menú
app.get('/api/stats', (req, res) => {
  try {
    const stats = {
      totalProducts: products.length,
      totalCategories: categories.length,
      averagePrice: (products.reduce((sum, product) => sum + product.price, 0) / products.length).toFixed(2),
      averageRating: (products.reduce((sum, product) => sum + product.rating, 0) / products.length).toFixed(1),
      totalReviews: products.reduce((sum, product) => sum + product.reviews, 0),
      availableProducts: products.filter(product => product.available).length,
      vegetarianOptions: products.filter(product => product.category === 'Vegetariano').length,
      spicyOptions: products.filter(product => product.spicyLevel > 0).length
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});


// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
  console.log(`📊 API disponible en http://localhost:${PORT}/api`);
  console.log(`🍽️  Total de productos: ${products.length}`);
  console.log(`📂 Categorías disponibles: ${categories.length}`);
});
