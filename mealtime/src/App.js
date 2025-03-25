// src/App.js
import React from "react";
import RibbonPlot3D from "./components/RibbonPlot3D";

function App() {
  return (
    <div className="App">
      <header className="bg-gray-800 text-white p-4 text-center">
        <h1 className="text-2xl">Dashboard de Ventas de Comida en 3D</h1>
      </header>
      <main className="p-6">
        <RibbonPlot3D />
      </main>
    </div>
  );
}

export default App;
