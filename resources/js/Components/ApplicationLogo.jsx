import { useState, useEffect } from 'react';

export default function ApplicationLogo({ width = '150px', height = '150px' }) {
    const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

    // Listen for theme changes
    useEffect(() => {
        // Function to check if dark mode is enabled
        const checkTheme = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setIsDarkMode(isDark);
        };

        // Set initial state
        checkTheme();

        // Create a mutation observer to watch for class changes on the html element
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'class') {
                    checkTheme();
                }
            });
        });

        // Start observing
        observer.observe(document.documentElement, { attributes: true });

        // Clean up the observer on component unmount
        return () => {
            observer.disconnect();
        };
    }, []);

    // Use rsc.png for light mode and rsc-light.png for dark mode
    const logoSrc = isDarkMode ? '/images/rsc-light.png' : '/images/rsc.png';

    return (
        <img src={logoSrc} style={{ maxWidth: width, maxHeight: height }} className="" alt="Logo" />
    );
}
