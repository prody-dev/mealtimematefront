// src/App.js
import React from "react";
import RibbonPlot3D from "./components/RibbonPlot3D";
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="TituloProContainer">
        <h1 className="TituloPro">MealTime 7C</h1>
      </div>
      <div className="Header">
        <div className="BotonesContainer">
          <button className="Botones">Boton1</button>
          <button className="Botones">Boton2</button>
          <button className="Botones">Boton3</button>
          <button className="Botones">Boton4</button>
          <button className="Botones">Boton5</button>
        </div>
      </div>
        {/*Content */}
      <div className="Informacion">
        <div className="left">
          <h1 className="h1">Grafica</h1>
          {/*<RibbonPlot3D />*/}
        </div>
        <div className="right"> {/* ME VOY A HECHAR UN CAGUE YO TMBN SON LAS  8:40 */}
          <h1 className="h1">Filtros</h1>
          <div className="Cosas">
            <div className="Categorias">
              <h2 className="h2">Categoria</h2>
              <select className="select">
                <option disabled selected>Selecciona una Categoria</option>
                <option>Tacos</option>
                <option>Burrito</option>
                <option>Sodas</option>
              </select>
            </div>
            <div className="Horas">
              <h2 className="h2">Hora</h2>
              <select className="select">
                <option disabled selected>Selecciona una Hora</option>
                <option>8:00 AM - 9:00 AM</option>
                <option>10:00 AM - 11:00 AM</option>
                <option>12:00 PM - 1:00 PM</option>
              </select>
            </div>
          </div>
          <div className="Prediccion">
            <h2 className="h1">Predicción para Categoria entre las Hora</h2>
            <p className="h1">Prediccion</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
