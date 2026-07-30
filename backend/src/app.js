const express = require('express');
const requestLogger = require("./middlewares/requestLogger");
const authRoutes=require('./routes/authRoutes')
const app = express();
app.use(requestLogger); //we place it here beacuse middlewares work from top to btm 
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Server is healthy'
  });
});
app.use('/api/auth',authRoutes);



module.exports = app;