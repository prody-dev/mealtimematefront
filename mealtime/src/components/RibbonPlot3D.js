import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

// Función para convertir la fecha de formato YYYY-MM-DD a DD-MM-YYYY
const formatDate = (date) => {
  const parts = date.split('-'); // Separar por el guion
  return `${parts[2]}-${parts[1]}-${parts[0]}`; // Reorganizar como DD-MM-YYYY
};

const RibbonPlot3D = ({ selectedDate }) => {
  const [data, setData] = useState({ x: [], y: [], z: [] });
  const [loading, setLoading] = useState(false); // Estado de carga

  useEffect(() => {
    const fetchData = async () => {
      const formattedDate = formatDate(selectedDate); // Formatear la fecha correctamente
      setLoading(true); // Activar el estado de carga

      try {
        const response = await fetch(`http://localhost:8000/api/ventas-por-hora2/?fecha=${formattedDate}`);
        if (response.ok) {
          const result = await response.json();
          setData(result); // Actualizar los datos con la respuesta de la API
        } else {
          console.error('Error en la respuesta de la API:', response.status);
        }
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      } finally {
        setLoading(false); // Desactivar el estado de carga
      }
    };

    fetchData(); // Llamada a la API para obtener los datos

  }, [selectedDate]); // Re-fetch cuando la fecha seleccionada cambie

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

      {/* Mostrar mensaje de carga mientras se obtienen los datos */}
      {loading ? (
        <div className="text-center">Cargando datos...</div>
      ) : (
        // Mostrar la gráfica solo si no está cargando
        <Plot
          data={[trace]}
          layout={layout}
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </div>
  );
};

export default RibbonPlot3D;
