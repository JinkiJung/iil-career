import './App.scss';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Main } from './component/Main';
import { NavProvider } from './component/NavProvider';
import { Nav } from './component/Nav';

function App() {
  return (
    <BrowserRouter basename="/iil-career">
      <div className="App">
        <NavProvider>
          <Nav></Nav>
          <Routes>
            <Route path="/en" element={<Main locale="en" />} />
            <Route path="/ko" element={<Main locale="ko" />} />
            <Route path="*" element={<Navigate to="/en" replace />} />
          </Routes>
        </NavProvider>
      </div>
    </BrowserRouter>
  );
}

export default App;
