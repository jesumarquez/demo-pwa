if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js')
    .then((reg) => console.log('serviceWorker registered!', reg))
    .catch((err) => console.warn('serviceWorker not registered!', err) );
} else {
    console.error('serviceWorker is not supported!')
}