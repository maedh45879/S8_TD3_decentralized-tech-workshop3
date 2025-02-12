const express = require('express');
const app = express();
const PORT = 3000;

const serverInfo = {
    code: 200,
    server: `localhost:3001`
};

app.get('/getServer', (req, res) => {
    res.json(serverInfo);
});

app.listen(PORT, () => {
    console.log(`DNS Registry running at http://localhost:${PORT}/getServer`);
});
