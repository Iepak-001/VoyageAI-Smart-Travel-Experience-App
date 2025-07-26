const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const destinationRoutes = require("./routes/destinationRoutes");

const cityRoutes = require("./routes/cityRoutes");
app.use("/api/cities", cityRoutes);


const reviewRoutes = require("./routes/reviewRoutes");
app.use("/api/reviews", reviewRoutes);


app.use("/api/destination", destinationRoutes);
app.use('/auth', authRoutes);
app.use('/api', aiRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    console.log('Connected to MongoDB');
})
.catch((err) => console.log(err));
