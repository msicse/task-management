import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        // The delay after which the progress bar will appear, in milliseconds
        delay: 250,
        // The color of the progress bar
        color: '#4f46e5',
        // Whether to include the default NProgress styles
        includeCSS: true,
        // Whether the NProgress spinner will be shown
        showSpinner: true,
    },
});
