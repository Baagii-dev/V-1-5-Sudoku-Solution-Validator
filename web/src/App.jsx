import { useState } from 'react';
import { ROUTES, useRoute } from './router.js';
import Home from './pages/Home.jsx';
import Validator from './pages/Validator.jsx';
import About from './pages/About.jsx';

const PAGES = { '/': Home, '/validator': Validator, '/about': About };

const prefersDark = () => matchMedia('(prefers-color-scheme: dark)').matches;

function currentTheme() {
  return document.documentElement.dataset.theme || (prefersDark() ? 'dark' : 'light');
}

export default function App() {
  const route = useRoute();
  const [theme, setTheme] = useState(currentTheme);
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // хадгалж чадахгүй бол зөвхөн энэ нээлтэд үлдэнэ
    }
    setTheme(next);
  };
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
        <button type="button" className="themebtn" onClick={toggleTheme}>
          {theme === 'dark' ? 'Гэрэл горим' : 'Харанхуй горим'}
        </button>
      </header>
      <main className="app">
        <Page />
      </main>
    </>
  );
}
