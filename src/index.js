const express = require('express');
const categoryRoutes = require('../routes/category.routes');
const app = express();
app.use(express.json());

app.use('/categories', categoryRoutes);

app.get('/', (req, res) => {
    res.send('Server running');
});
app.listen(3000, () => {
    console.log('Server on http://localhost:3000');
});