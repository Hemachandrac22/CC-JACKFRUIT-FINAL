const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const facultyRoutes = require('./routes/facultyRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/faculty', facultyRoutes);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("MongoDB connected");
  app.listen(process.env.PORT, () => {
    console.log(`Faculty Service running on port ${process.env.PORT}`);
  });
}).catch(err => {
  console.error("DB Connection Error:", err);
});
