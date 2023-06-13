const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const runCode = require('./models/runCode')
const loadCode = require('./models/load')


const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());



app.post('/compile', async (req, res) => {
    runCode.runCode(req, res)
});

app.get('/load', async (req, res) => {
    loadCode.loadProgram(req.params.programNumber, res)
});

app.listen(5000, () => {
    console.log('listening on port 5000');
});


