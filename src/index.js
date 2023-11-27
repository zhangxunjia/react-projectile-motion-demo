import React from 'react';
import ReactDOM from 'react-dom/client';
import DemoContainer from './pages/DemoContainer';
import 'src/assets/css/index.scss';
import 'src/i18n/index.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <DemoContainer />
    </React.StrictMode>
);
