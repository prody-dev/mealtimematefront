// ChartComponent.jsx
import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

const ChartComponent = () => {
  const [data, setData] = useState({ x: [], y: [], z: [] });

  useEffect(() => {
    // Obtener los datos de ventas desde el backend
    fetch('http://localhost:8000/api/ventas-por-hora/')
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const trace = {
    x: data.x,  // horas
    y: data.y,  // categorías
    z: data.z,  // cantidades de ventas
    colorscale: 'Viridis',
    type: 'scatter3d',
    mode: 'markers',
    marker: {
      size: 5,
      color: data.z,  // El color de cada punto depende de la cantidad
      colorscale: 'Viridis',
    },
  };

  const layout = {
    title: 'Ventas por Hora y Categoría',
    scene: {
      xaxis: { title: 'Hora' },
      yaxis: { title: 'Categoría' },
      zaxis: { title: 'Cantidad Vendida' },
    },
  };

  return (
    <div>
      <h1>Ventas 3D</h1>
      <Plot
        data={[trace]}
        layout={layout}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default ChartComponent;
