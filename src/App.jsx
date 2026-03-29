import { useState, useCallback } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Accordion from './components/Accordion/Accordion';
import Alert from './components/Alert/Alert';
import Breadcrumb from './components/Breadcrumb/Breadcrumb';
import Button from './components/Button/Button';
import Carousel from './components/Carousel/Carousel';
import Checkbox from './components/Checkbox/Checkbox';
import Combobox from './components/Combobox/Combobox';
import Disclosure from './components/Disclosure/Disclosure';
import Feed from './components/Feed/Feed';
import Grid from './components/Grid/Grid';
import Landmarks from './components/Landmarks/Landmarks';
import LinkDemo from './components/Link/Link';
import Listbox from './components/Listbox/Listbox';
import MenuAndMenubar from './components/MenuAndMenubar/MenuAndMenubar';
import MenuButton from './components/MenuButton/MenuButton';
import Meter from './components/Meter/Meter';
import ModalDialog from './components/ModalDialog/ModalDialog';
import MultiThumbSlider from './components/MultiThumbSlider/MultiThumbSlider';
import RadioGroup from './components/RadioGroup/RadioGroup';
import Slider from './components/Slider/Slider';
import SortableTable from './components/SortableTable/SortableTable';
import Spinbutton from './components/Spinbutton/Spinbutton';
import Switch from './components/Switch/Switch';
import TabPanel from './components/TabPanel/TabPanel';
import Toolbar from './components/Toolbar/Toolbar';
import Tooltip from './components/Tooltip/Tooltip';
import TreeView from './components/TreeView/TreeView';
import Treegrid from './components/Treegrid/Treegrid';
import WindowSplitter from './components/WindowSplitter/WindowSplitter';
import { enableRemediation, disableRemediation } from './remediation/index.js';
import './App.css';

const demos = [
  { path: '/accordion', label: 'Accordion', component: Accordion },
  { path: '/alert', label: 'Alert', component: Alert },
  { path: '/breadcrumb', label: 'Breadcrumb', component: Breadcrumb },
  { path: '/button', label: 'Button', component: Button },
  { path: '/carousel', label: 'Carousel', component: Carousel },
  { path: '/checkbox', label: 'Checkbox', component: Checkbox },
  { path: '/combobox', label: 'Combobox', component: Combobox },
  { path: '/modal', label: 'Dialog (Modal)', component: ModalDialog },
  { path: '/disclosure', label: 'Disclosure', component: Disclosure },
  { path: '/feed', label: 'Feed', component: Feed },
  { path: '/grid', label: 'Grid', component: Grid },
  { path: '/landmarks', label: 'Landmarks', component: Landmarks },
  { path: '/link', label: 'Link', component: LinkDemo },
  { path: '/listbox', label: 'Listbox', component: Listbox },
  { path: '/menu', label: 'Menu & Menubar', component: MenuAndMenubar },
  { path: '/menubutton', label: 'Menu Button', component: MenuButton },
  { path: '/meter', label: 'Meter', component: Meter },
  { path: '/multislider', label: 'Multi-Thumb Slider', component: MultiThumbSlider },
  { path: '/radio', label: 'Radio Group', component: RadioGroup },
  { path: '/slider', label: 'Slider', component: Slider },
  { path: '/table', label: 'Sortable Table', component: SortableTable },
  { path: '/spinbutton', label: 'Spinbutton', component: Spinbutton },
  { path: '/switch', label: 'Switch', component: Switch },
  { path: '/tabs', label: 'Tab Panel', component: TabPanel },
  { path: '/toolbar', label: 'Toolbar', component: Toolbar },
  { path: '/tooltip', label: 'Tooltip', component: Tooltip },
  { path: '/tree', label: 'Tree View', component: TreeView },
  { path: '/treegrid', label: 'Treegrid', component: Treegrid },
  { path: '/splitter', label: 'Window Splitter', component: WindowSplitter },
];

function Home() {
  return (
    <div className="home">
      <h1>Accessibility Challenge Components</h1>
      <p className="home-desc">
        Each component below contains intentional accessibility issues for
        research into post-rendered remediation techniques.
      </p>
      <div className="demo-grid">
        {demos.map((demo) => (
          <Link key={demo.path} to={demo.path} className="demo-card">
            <div className="demo-card-title">{demo.label}</div>
            <div className="demo-card-link">View demo →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const currentDemo = demos.find((d) => d.path === location.pathname);
  const [remediationOn, setRemediationOn] = useState(false);

  const handleToggleRemediation = useCallback(() => {
    if (remediationOn) {
      disableRemediation();
    } else {
      enableRemediation();
    }
    setRemediationOn(!remediationOn);
  }, [remediationOn]);

  return (
    <div className="app">
      <nav className="app-nav">
        <Link to="/" className="nav-brand">A11y Challenges</Link>
        <button
          className={`remediation-toggle ${remediationOn ? 'on' : ''}`}
          onClick={handleToggleRemediation}
          aria-pressed={remediationOn}
        >
          {remediationOn ? 'Remediation ON' : 'Remediation OFF'}
        </button>
      </nav>

      <main className="app-main">
        {currentDemo && (
          <div className="demo-header">
            <Link to="/" className="back-link">← Back to all components</Link>
            <h1>{currentDemo.label}</h1>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Home />} />
          {demos.map((demo) => (
            <Route key={demo.path} path={demo.path} element={<demo.component />} />
          ))}
        </Routes>
      </main>
    </div>
  );
}
