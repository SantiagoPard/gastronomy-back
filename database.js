// Base de datos simulada con productos gastronómicos
const fs = require('fs');
const path = require('path');

// Cargar datos desde archivo JSON
const loadData = () => {
  try {
    const dataPath = path.join(__dirname, 'data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error al cargar datos:', error);
    return { products: [], categories: [], restaurantInfo: {} };
  }
};

// Cargar datos al inicializar
const data = loadData();
const products = data.products;
const categories = data.categories;
const restaurantInfo = data.restaurantInfo;

module.exports = {
  products,
  categories,
  restaurantInfo
};