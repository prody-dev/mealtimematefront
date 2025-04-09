import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import axios from "axios";

// Convierte hora tipo "HH:MM" a decimal (ej: "08:30" => 8.5)
const horaToDecimal = (horaStr) => {
  const [h, m] = horaStr.split(":").map(Number);
  return h + m / 60;
};

// Convierte fecha "YYYY-MM-DD" a índice numérico
const fechaToIndex = (fechas, fechaActual) => {
  return fechas.indexOf(fechaActual);
};

const Grafica3D = () => {
  const [rawData, setRawData] = useState([]);
  const [x, setX] = useState([]); // Fecha como índice
  const [y, setY] = useState([]); // Hora decimal
  const [z, setZ] = useState([]); // Cantidad
  const [superficie, setSuperficie] = useState({ x: [], y: [], z: [] });

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/ventas_por_hora2/")
      .then((res) => {
        const fechas = [...new Set(res.data.x)];
        const xNumeric = res.data.x.map(f => fechaToIndex(fechas, f));
        const yDecimal = res.data.y.map(horaToDecimal);
        const zCantidad = res.data.z;

        setRawData(res.data);
        setX(xNumeric);
        setY(yDecimal);
        setZ(zCantidad);

        // === Regresión Lineal Múltiple ===
        // Modelo: z = a*x + b*y + c
        const n = xNumeric.length;
        let sumX = 0, sumY = 0, sumZ = 0, sumXY = 0, sumXZ = 0, sumYZ = 0, sumXX = 0, sumYY = 0;

        for (let i = 0; i < n; i++) {
          sumX += xNumeric[i];
          sumY += yDecimal[i];
          sumZ += zCantidad[i];
          sumXY += xNumeric[i] * yDecimal[i];
          sumXZ += xNumeric[i] * zCantidad[i];
          sumYZ += yDecimal[i] * zCantidad[i];
          sumXX += xNumeric[i] * xNumeric[i];
          sumYY += yDecimal[i] * yDecimal[i];
        }

        const denominator = (sumXX * sumYY - sumXY * sumXY);
        const a = (sumXZ * sumYY - sumYZ * sumXY) / denominator;
        const b = (sumYZ * sumXX - sumXZ * sumXY) / denominator;
        const c = (sumZ - a * sumX - b * sumY) / n;

        // Crear superficie de predicción
        const gridX = [...new Set(xNumeric)];
        const gridY = [...new Set(yDecimal)];

        const zPred = gridY.map(yVal =>
          gridX.map(xVal => a * xVal + b * yVal + c)
        );

        setSuperficie({
          x: gridX,
          y: gridY,
          z: zPred,
        });
      });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Regresión Lineal Múltiple 3D</h1>
      <Plot
        data={[
          {
            x: x,
            y: y,
            z: z,
            mode: "markers",
            type: "scatter3d",
            marker: { size: 4, color: "blue" },
            name: "Datos reales",
          },
          {
            x: superficie.x,
            y: superficie.y,
            z: superficie.z,
            type: "surface",
            opacity: 0.6,
            colorscale: "Reds",
            name: "Superficie de Regresión",
          },
        ]}
        layout={{
          title: "Regresión Lineal Múltiple (Fecha, Hora → Ventas)",
          scene: {
            xaxis: { title: "Fecha (índice)" },
            yaxis: { title: "Hora (decimal)" },
            zaxis: { title: "Cantidad Vendida" },
          },
          autosize: true,
        }}
      />
    </div>
  );
};

export default Grafica3D;
