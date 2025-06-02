const express = require('express');
const cors = require('cors');
const config = require('./config')
const categoryRoutes = require('./routes/category.routes');
const tagRoutes = require('./routes/tag.routes');
const taskRoutes = require('./routes/task.routes');
const userRoutes = require('./routes/user.routes')
const app = express();
app.use(cors({
    origin: `${config.HOST_FE}:${config.PORT_FE}`,
    credentials: true
}));

app.use(express.json());

app.use('/auth', userRoutes);
app.use('/categories', categoryRoutes);
app.use('/tags', tagRoutes);
app.use('/tasks', taskRoutes);

app.get('/', (req, res) => {
    res.send('Server running');
});
app.listen(config.PORT_BE, config.HOST_BE, () => {
    console.log(`Server on http://${config.HOST_BE}:${config.PORT_BE}`);
});

