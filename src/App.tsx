import './App.scss';
import { Main } from './component/Main';
import { NavProvider } from './component/NavProvider';
import { Nav } from './component/Nav';

function App() {
  return (
    <div className="App">
      <NavProvider>
        <Nav></Nav>
        <Main></Main>
      </NavProvider>
    </div>
  );
}

export default App;
