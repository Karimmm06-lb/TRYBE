require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 8080;
const prisma = new PrismaClient();


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());


const getTendersRouter = require("./Tenders.route");
const authRouter = require("./auth.route");

// Karim — Module Ingestion & Analyse
const karimUpload        = require("./karim/upload.route");
const karimStats         = require("./karim/stats.route");
const karimAo            = require("./karim/ao.route");
const karimNotifications = require("./karim/notifications.route");


app.use("/api/auth", authRouter);
app.use(getTendersRouter);

// Karim — Module Ingestion & Analyse
app.use("/api/karim/upload",        karimUpload);
app.use("/api/karim/stats",         karimStats);
app.use("/api/karim/ao",            karimAo);
app.use("/api/karim/notifications", karimNotifications);


async function seedAdminUser() {
  const adminEmail = "admin@trybe.com";
  
  try {
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    
    if (!existingAdmin) {
      
      const hashedPassword = await bcrypt.hash("trybeadmin55", 10);
      
      await prisma.user.create({
        data: {
          nom: "Admin",
          prenom: "Trybe",
          email: adminEmail,
          motDePasse: hashedPassword,
          role: "ADMIN",
          actif: true
        }
      });
      console.log(" Compte Admin par défaut créé avec succès !");
    } else {
      console.log(" Compte Admin déjà existant.");
    }
  } catch (error) {
    console.error("Erreur lors de la création de l'Admin:", error);
  }
}


app.listen(PORT, async () => {
  
  await seedAdminUser();
  console.log(` Web backend running at http://localhost:${PORT}`);
});