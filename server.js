const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
//const logger = require('morgan');
const helmet = require('helmet');
const compression = require('compression');

const port = process.env.PORT || 3000;

require('dotenv').config();
console.log(process.env);

const cors = require('cors');

// Instance of express
const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());


// Database Connection
const dbConfig = require('./config/secret');

//CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Methods',
    'GET',
    'POST',
    'DELETE',
    'OPTIONS',
    'PUT'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});


// Middleware
app.use(express.json({
  limit: '50mb'
}));
app.use(express.urlencoded({
  extended: true,
  limit: '50mb'
}));
app.use(cookieParser());
//app.use(logger('dev'));



mongoose.Promise = global.Promise;
mongoose.connect(
  dbConfig.url, {
    useNewUrlParser: true
  }
);



const auth = require('./routes/authRoutes');

app.use('/api/myapp', auth);

app.listen(port, () => {
  console.log('Our app is running on http://localhost:' + port);
});
