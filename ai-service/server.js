const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());


app.post("/score", (req, res) => {
  const offer = req.body;

  
  const score = Math.floor(Math.random() * 101); 

  res.json({
    status: "success",
    received_offer: offer,
    ai_score: score,
    verdict:
      score >= 75
        ? "Strong Offer "
        : score >= 50
        ? "Average Offer "
        : "Weak Offer ",
    message: ` your score is ${score}/100.`,
  });
});

app.listen(PORT, () => {
  console.log(`Fake AI Scorer running at http://localhost:${PORT}`);
});