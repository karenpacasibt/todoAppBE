function taskLoadDetails(tasks, categories, tags) {
    return tasks.map(task => {
        const category = categories.find(category => category.id == task.category_id) 
        const tagsList = tags.filter(tag => tag.task_id == task.id)
        return {
            ...task,
            category: category,
            tags: tagsList
        }
    })
}

module.exports = taskLoadDetails