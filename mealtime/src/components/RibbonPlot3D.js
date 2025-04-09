import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

// Función para convertir la fecha de formato YYYY-MM-DD a DD-MM-YYYY
const formatDate = (date) => {
  const parts = date.split('-'); // Separar por el guion
  return `${parts[2]}-${parts[1]}-${parts[0]}`; // Reorganizar como DD-MM-YYYY
};

// Función para convertir una hora en formato "HH:MM" a minutos desde medianoche
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const RibbonPlot3D = ({ selectedDate }) => {
  const [data, setData] = useState({ x: [], y: [], z: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const formattedDate = formatDate(selectedDate);
      setLoading(true);

      try {
        const response = await fetch(`http://localhost:8000/api/ventas-por-hora2/?fecha=${formattedDate}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          console.error('Error en la respuesta de la API:', response.status);
        }
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  // Agrupar y ordenar los datos por categoría y hora
  // Se incluye además la hora en formato string (times) para el tooltip
  const groupedData = {};
  data.x.forEach((hora, index) => {
    const categoria = data.y[index];
    const cantidad = data.z[index];

    if (!groupedData[categoria]) {
      groupedData[categoria] = { x: [], y: [], z: [], times: [] };
    }

    // Convertir la hora a minutos para el eje x y guardar la hora original
    groupedData[categoria].x.push(timeToMinutes(hora));
    groupedData[categoria].y.push(categoria);
    groupedData[categoria].z.push(cantidad);
    groupedData[categoria].times.push(hora);
  });

  // Aquí almacenaremos las trazas de puntos y de la línea de tendencia
  const categoryTraces = [];

  // Por cada categoría, creamos su traza (scatter) y la línea de tendencia (regresión)
  Object.keys(groupedData).forEach((categoria) => {
    const catData = groupedData[categoria];

    // Ordenar los puntos por hora en minutos para mantener el orden cronológico
    const sortedIndices = catData.x
      .map((val, index) => ({ val, index }))
      .sort((a, b) => a.val - b.val)
      .map((item) => item.index);

    const sortedX = sortedIndices.map(i => catData.x[i]);
    const sortedY = sortedIndices.map(i => catData.y[i]);
    const sortedZ = sortedIndices.map(i => catData.z[i]);
    const sortedTimes = sortedIndices.map(i => catData.times[i]); // Hora original "HH:MM"

    // Traza de los puntos de la categoría
    categoryTraces.push({
      x: sortedX,
      y: sortedY,
      z: sortedZ,
      mode: 'lines+markers', // Conecta los puntos con líneas y muestra marcadores
      type: 'scatter3d',
      name: categoria,
      marker: {
        size: 5,
        color: sortedZ, // Color según la cantidad
        colorscale: 'Viridis',
      },
      line: {
        color: 'rgba(0, 0, 0, 0.6)',
        width: 2
      },
      // Personalizamos el tooltip usando la hora original
      hovertemplate: sortedTimes.map((hora, idx) =>
        `Hora: ${hora}<br>Categoría: ${sortedY[idx]}<br>Cantidad: ${sortedZ[idx]}`
      )
    });

    // Calcular la línea de tendencia usando el método de mínimos cuadrados
    if (sortedX.length >= 2) {
      const n = sortedX.length;
      const sumX = sortedX.reduce((acc, v) => acc + v, 0);
      const sumZ = sortedZ.reduce((acc, v) => acc + v, 0);
      const meanX = sumX / n;
      const meanZ = sumZ / n;

      let num = 0, den = 0;
      sortedX.forEach((x, i) => {
        num += (x - meanX) * (sortedZ[i] - meanZ);
        den += (x - meanX) ** 2;
      });
      const slope = num / den;
      const intercept = meanZ - slope * meanX;

      // Generar puntos para la línea de regresión: 10 puntos entre el mínimo y el máximo
      const minX = sortedX[0];
      const maxX = sortedX[sortedX.length - 1];
      const numPoints = 10;
      const step = (maxX - minX) / (numPoints - 1);
      const regressionX = [];
      const regressionZ = [];
      for (let i = 0; i < numPoints; i++) {
        const x_val = minX + i * step;
        regressionX.push(x_val);
        regressionZ.push(slope * x_val + intercept);
      }

      // Traza de la línea de tendencia para la categoría (la y es constante para la categoría)
      categoryTraces.push({
        x: regressionX,
        y: new Array(numPoints).fill(categoria), // La categoría como valor constante en el eje y
        z: regressionZ,
        mode: 'lines',
        type: 'scatter3d',
        name: `Tendencia: ${categoria}`,
        line: {
          dash: 'dash',
          width: 4,
          color: 'red'
        }
      });
    }
  });

  // Configuramos el eje X con valores en minutos (de 8 AM a 1 PM) y etiquetas en formato "HH:MM"
  const layout = {
    title: 'Ventas por Hora y Categoría',
    scene: {
      xaxis: { 
        title: 'Hora',
        tickvals: Array.from({ length: 6 }, (_, i) => 480 + i * 60), // 480 corresponde a las 08:00 en minutos
        ticktext: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00']
      },
      yaxis: { title: 'Categoría' },
      zaxis: { title: 'Cantidad Vendida' },
    },
  };

  return (
    <div>
      <br></br>
      {loading ? (
        <div className="text-center">Cargando datos...</div>
      ) : (
        <Plot
          data={categoryTraces}
          layout={layout}
          style={{ width: '100%', height: '825px' }}
        />
      )}
    </div>
  );
};

export default RibbonPlot3D;
