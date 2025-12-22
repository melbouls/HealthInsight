const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // AJOUT : Nécessaire pour le Dashboard

const app = express();
app.use(express.json());
app.use(cors()); // AJOUT : Autorise le frontend à appeler l'API

// Connexion avec gestion d'erreur
mongoose.connect("mongodb://mongo:27017/healthinsight")
  .then(() => console.log("Connecté à MongoDB"))
  .catch(err => console.error("Erreur de connexion Mongo:", err));

// ----- SCHEMAS -----
const Patient = mongoose.model("Patient", {
  _id: String, 
  name: String,
  contact: String,
  medicalNotes: String,
  riskScore: { type: Number, default: 0 }
});

const Reading = mongoose.model("Reading", {
  patientId: String,
  type: String,
  value: Number,
  timestamp: { type: Date, default: Date.now },
  abnormal: Boolean
});

// NOUVEAU : Modèle pour les statistiques générées par Spark
const DailyStat = mongoose.model("DailyStat", {
  type: String,
  moyenne: Number
}, "daily_stats"); // On précise le nom de la collection créée par Spark

// ----- INSERT READING (Q1 + Q4 + Q6) -----
app.post("/readings", async (req, res) => {
  try {
    const { patientId, value, type } = req.body;
    const abnormal = value > 120;

    await Reading.create({
      patientId,
      type,
      value,
      abnormal,
      timestamp: new Date()
    });

    if (abnormal) {
      const result = await Patient.updateOne(
        { _id: patientId },
        { $inc: { riskScore: 0.1 } }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).send("Patient non trouvé, mais mesure enregistrée");
      }
    }

    res.status(201).send("reading inserted");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----- NOUVELLE ROUTE : STATS SPARK (Q6) -----
// C'est cette route que ton fichier index.html va appeler
app.get("/stats", async (req, res) => {
  try {
    const stats = await DailyStat.find();
    res.json(stats);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// ----- LAST 20 READINGS (Q2) -----
app.get("/patients/:id/readings", async (req, res) => {
  try {
    const readings = await Reading.find({ patientId: req.params.id })
      .sort({ timestamp: -1 })
      .limit(20);
    res.json(readings);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// ----- UPDATE PATIENT (Q3) -----
app.put("/patients/:id", async (req, res) => {
  try {
    await Patient.updateOne({ _id: req.params.id }, req.body);
    res.send("patient updated");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(3000, () => console.log("API running on port 3000"));