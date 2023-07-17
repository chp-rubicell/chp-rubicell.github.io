function toggleColorTheme() {
    if (document.documentElement.getAttribute('colorTheme') == 'dark') {
        document.documentElement.setAttribute('colorTheme', 'light');
    }
    else {
        document.documentElement.setAttribute('colorTheme', 'dark');
    }
}

