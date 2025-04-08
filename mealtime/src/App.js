import React, { useState, useEffect } from "react";
import RibbonPlot3D from "./components/RibbonPlot3D";
import './App.css';

// Función para obtener los lunes entre dos fechas
const getMondaysBetweenDates = (startDate, endDate) => {
  let mondays = [];
  let currentDate = new Date(startDate);

  // Asegurarse de que el primer día es un lunes
  while (currentDate.getDay() !== 1) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Generar los lunes hasta la fecha final
  while (currentDate <= endDate) {
    mondays.push(currentDate.toISOString().split('T')[0]); // Formato YYYY-MM-DD
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return mondays;
};

function App() {
  // Estados para la gráfica (fecha seleccionada)
  const [selectedDate, setSelectedDate] = useState('2025-01-20');
  const [mondays, setMondays] = useState([]);

  // Estados para el pronóstico (panel derecho)
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [forecast, setForecast] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  useEffect(() => {
    const startDate = new Date(2025, 0, 20); // 20 de enero de 2025
    const endDate = new Date(2025, 1, 17);   // 17 de febrero de 2025
    const mondaysList = getMondaysBetweenDates(startDate, endDate);
    setMondays(mondaysList);
  }, []);

  // Función que realiza la solicitud a la API de pronóstico
  const handleForecast = () => {
    if (selectedCategory && selectedBlock) {
      setLoadingForecast(true);
      fetch(`http://localhost:8000/api/pronostico2/?categoria_id=${selectedCategory}&bloque_horario=${selectedBlock}`)
        .then(response => response.json())
        .then(data => {
          console.log("Forecast data:", data);
          setForecast(data.ventas_pronosticadas_redondeadas);
        })
        .catch(error => console.error("Error fetching forecast:", error))
        .finally(() => setLoadingForecast(false));
    }
  };

  return (
    <div className="App">
      <div className="TituloProContainer">
        <h1 className="TituloPro">MealTime 7C</h1>
      </div>
      <div className="Header">
        <div className="BotonesContainer">
          {mondays.map((monday, index) => (
            <button
              key={index}
              onClick={() => setSelectedDate(monday)}
              className="Botones"
            >
              {monday.split('-').reverse().join('-')}  {/* Se muestra en formato DD-MM-YYYY */}
            </button>
          ))}
        </div>
      </div>
      {/* Content */}
      <div className="Informacion">
        <div className="left">
          <h1 className="h1">Grafica</h1>
          <RibbonPlot3D selectedDate={selectedDate} />
        </div>
        <div className="right">
          <h1 className="h1">Filtros</h1>
          <div className="Cosas">
            <div className="Categorias">
              <h2 className="h2">Categoria</h2>
              <select 
                className="select" 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="" disabled>Selecciona una Categoria</option>
                <option value="1">Burritos</option>
                <option value="2">Postres</option>
                <option value="3">Snacks</option>
              </select>
            </div>
            <div className="Horas">
              <h2 className="h2">Hora</h2>
              <select 
                className="select"
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
              >
                <option value="" disabled>Selecciona un Bloque Horario</option>
                <option value="1">8:00 AM - 9:00 AM</option>
                <option value="2">9:00 AM - 10:00 AM</option>
                <option value="3">10:00 AM - 11:00 AM</option>
                <option value="4">11:00 AM - 12:00 PM</option>
                <option value="5">12:00 PM - 1:00 PM</option>
              </select>
            </div>
          </div>
          <div className="Prediccion">
            <h2 className="h1">Predicción para Categoria entre las Hora</h2>
            <button onClick={handleForecast} className="Botones">
              Obtener Predicción
            </button>
            {loadingForecast ? (
              <p className="h1">Cargando predicción...</p>
            ) : (
              forecast !== null && <p className="h1">Predicción: {forecast}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
