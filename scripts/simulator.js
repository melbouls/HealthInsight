const axios = require('axios'); // Si tu n'as pas axios, utilise : npm install axios

const API_URL = 'http://localhost:3000/readings';
const patients = [
    { id: 'p1', name: 'Ali' },
    { id: 'p2', name: 'Melissa' },
    { id: 'p3', name: 'Mel' },
    { id: 'p4', name: 'Aya' }
];

// Fonction pour générer une valeur aléatoire
function getRandomValue(min, max) {
    return Math.random() * (max - min) + min;
}

async function sendData() {
    for (const patient of patients) {
        // On choisit aléatoirement d'envoyer soit le cœur, soit la température
        const isHeartRate = Math.random() > 0.3; 
        
        let payload = {
            patientId: patient.id,
            type: isHeartRate ? 'heart_rate' : 'temperature',
            // On génère parfois des anomalies pour tester les alertes
            value: isHeartRate 
                ? Math.floor(getRandomValue(55, 120)) // Pulsations entre 55 et 120
                : parseFloat(getRandomValue(36, 40).toFixed(1)) // Temp entre 36 et 40
        };

        try {
            const response = await axios.post(API_URL, payload);
            console.log(`[${new Date().toLocaleTimeString()}] Donnée envoyée pour ${patient.name}: ${payload.value} ${isHeartRate ? 'BPM' : '°C'}`);
        } catch (error) {
            console.error(`Erreur lors de l'envoi pour ${patient.name}:`, error.message);
        }
    }
    console.log('-------------------------------------------');
}

// Lancement de la simulation toutes les 2 secondes (2000 ms)
console.log("Démarrage du simulateur de capteurs HealthInsight...");
setInterval(sendData, 2000);