import { useEffect } from 'react';
import AppRoutes from './routes';

function App() {
  useEffect(() => {
    document.title = 'Red Velvet - Restaurante';
  }, []);

  return <AppRoutes />;
}

export default App;