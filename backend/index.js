const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const routes = require('./routes.js');
const cors = require('cors');
dotenv.config();


require('./db.js');

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, World!');
})

app.use('/api/', routes);


const ProductTransaction = require('./models.js');


app.listen(PORT, () => {
    console.log('App listening on port ' + PORT + '\nClick here: http://localhost:' + PORT);
});
