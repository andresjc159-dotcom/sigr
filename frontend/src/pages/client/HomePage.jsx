const ClientHomePage = () => {
  return (
    <div className="container">
      <h1>Hola, bienvenido</h1>
      <p>Explora nuestro menú o realiza una reserva</p>
      
      <div className="-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginTop: 24 }}>
        <div className="card">
          <h3>Nuestro Menú</h3>
          <p>Descubre todos nuestros platillos</p>
          <a href="/cliente/menu" className="btn btn-primary">Ver Menú</a>
        </div>
        
        <div className="card">
          <h3>Reservar Mesa</h3>
          <p>Reserva tu mesa favorita</p>
          <a href="/cliente/reservas" className="btn btn-primary">Reservar</a>
        </div>
      </div>
    </div>
  );
};

export default ClientHomePage;