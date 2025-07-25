import express from 'express';

// Función para listar todas las rutas registradas
function listRoutes(app) {
  console.log('\n🔍 RUTAS REGISTRADAS EN EL SERVIDOR:');
  console.log('=====================================');
  
  function printRoutes(path, layer) {
    if (layer.route) {
      // Ruta específica
      const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
      console.log(`${methods.padEnd(15)} ${path}${layer.route.path}`);
    } else if (layer.name === 'router') {
      // Router middleware
      console.log(`\n📁 Router en: ${path}`);
      layer.handle.stack.forEach(function(stackItem) {
        printRoutes(path, stackItem);
      });
    }
  }
  
  app._router.stack.forEach(function(layer) {
    printRoutes('', layer);
  });
  
  console.log('=====================================\n');
}

// Agregar al server.js justo antes de app.listen()
export { listRoutes };
