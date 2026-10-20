const cors = require('cors');
const express = require('express');
const path = require('node:path');

const app = express();
const port = process.env.PORT || 3000;
const projectDirectory = __dirname;
const publicDirectory = path.join(projectDirectory, 'public');

app.use(cors());
app.use('/assets', express.static(path.join(projectDirectory, 'assets')));
app.use(express.static(publicDirectory));

app.get('/mokepon.js', (request, response) => {
    response.sendFile(path.join(projectDirectory, 'mokepon.js'));
});

app.listen(port, () => {
    console.log(`Mokepon disponible en http://localhost:${port}`);
});