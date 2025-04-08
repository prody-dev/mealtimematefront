import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import axios from "axios";

const GraficaPronostico = ({ categoriaId, bloqueHorario }) => {
  const [dataPoints, setDataPoints] = useState({ x: [], y: [] });
  const [trendline, setTrendline] = useState({ x: [], y: [] });

  useEffect(() => {
    if (!categoriaId || !bloqueHorario) return;

    axios
      .get(`http://127.0.0.1:8000/api/pronostico2/?categoria_id=${categoriaId}&bloque_horario=${bloqueHorario}`)
      .then((res) => {
        const ordenes = res.data.ordenes_involucradas;

        const x = ordenes.map((item) => item.fecha);
        const y = ordenes.map((item) => item.cantidad_total);

        setDataPoints({ x, y });

        // Convertimos las fechas a índices para regresión (simple pero efectivo)
        const xNum = x.map((_, i) => i);
        const n = y.length;
        const sumX = xNum.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = xNum.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = xNum.reduce((sum, xi) => sum + xi * xi, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        const yTrend = xNum.map((xi) => slope * xi + intercept);

        setTrendline({ x, y: yTrend });
      })
      .catch((err) => {
        console.error("Error al cargar datos para la gráfica:", err);
        setDataPoints({ x: [], y: [] });
        setTrendline({ x: [], y: [] });
      });
  }, [categoriaId, bloqueHorario]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Ventas Históricas con Línea de Tendencia</h2>
      <Plot
        data={[
          {
            x: dataPoints.x,
            y: dataPoints.y,
            type: "scatter",
            mode: "markers+lines",
            name: "Ventas",
            marker: { color: "blue" },
          },
          {
            x: trendline.x,
            y: trendline.y,
            type: "scatter",
            mode: "lines",
            name: "Tendencia Lineal",
            line: { color: "red", dash: "dot" },
          },
        ]}
        layout={{
          title: "Regresión Lineal de Ventas por Día",
          xaxis: { title: "Fecha" },
          yaxis: { title: "Cantidad Vendida" },
        }}
      />
    </div>
  );
};

export default GraficaPronostico;
