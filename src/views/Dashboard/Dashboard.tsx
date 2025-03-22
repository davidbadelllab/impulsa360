import React from 'react';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <h1>Panel de Control</h1>
      <div className="dashboard-content">
        <section className="stats">
          <h2>Estadísticas</h2>
          {/* Aquí irían los componentes de estadísticas */}
        </section>
        <section className="recent-activity">
          <h2>Actividad Reciente</h2>
          {/* Aquí iría la lista de actividades recientes */}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
