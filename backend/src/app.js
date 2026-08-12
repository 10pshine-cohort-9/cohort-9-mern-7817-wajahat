const express = require('express');
const requestLogger = require("./middlewares/requestLogger");
const app = express();
const cors=require('cors');
const authRoutes=require('./routes/authRoutes')
const errorhandler=require('./middlewares/errorHandler')
const notesRoutes=require('./routes/notesRoutes')
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(requestLogger); //we place it here beacuse middlewares work from top to btm 
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Server is healthy'
  });
});
app.use('/api/auth',authRoutes);
app.use('/api/notes',notesRoutes);

app.use(errorhandler);

module.exports = app;