import { ROUTES, useRoute } from './router.js';
import Home from './pages/Home.jsx';
import Validator from './pages/Validator.jsx';
import About from './pages/About.jsx';

const PAGES = { '/': Home, '/validator': Validator, '/about': About };

export default function App() {
  const route = useRoute();
  const Page = PAGES[route];
  return (
    <>
      <header className="top">
        <a className="brand" href="#/">Sudoku Validator <span>V-1-5</span></a>
        <nav aria-label="Үндсэн цэс">
          {ROUTES.map((r) => (
            <a key={r.path} href={`#${r.path}`} aria-current={route === r.path ? 'page' : undefined}>
              {r.label}
            </a>
          ))}
        </nav>
      </header>
      <main className="app">
        <Page />
      </main>
    </>
  );
}
