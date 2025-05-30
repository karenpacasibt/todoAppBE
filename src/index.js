const express = require('express');
const config = require('./config')
const categoryRoutes = require('./routes/category.routes');
const tagRoutes = require('./routes/tag.routes');
const taskRoutes = require('./routes/task.routes');
const userRoutes = require('./routes/user.routes')
const app = express();
app.use(express.json());


app.use('/auth', userRoutes);
app.use('/categories', categoryRoutes);
app.use('/tags', tagRoutes);
app.use('/tasks', taskRoutes);

app.get('/', (req, res) => {
    res.send('Server running');
});
app.listen(config.PORT, config.HOST, () => {
    console.log(`Server on http://${config.HOST}:${config.PORT}`);
});

