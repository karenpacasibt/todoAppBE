const tagDecorator = require('./tag.decorator')
const categoryDecorator = require('./category.decorator')
const taskDecorator = task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    ...(task.category && {
        category: task.category.id ? task.category : categoryDecorator(task.category)
    }),
    ...(Array.isArray(task.tags) && task.tags.length && { tags: task.tags.map(tagDecorator) })

})

module.exports = taskDecorator

