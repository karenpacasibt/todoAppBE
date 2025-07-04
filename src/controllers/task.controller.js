const db = require('../DB/connection');
const taskDecorator = require('../decorators/task.decorator')
const taskLoadDetails = require('../utils/task.util')

exports.getAll = async (req, res) => {
    const userId = req.user.id
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { title, sort, order, category_id, status, tag_id } = req.query;

    try {
        let baseQuery = `SELECT id, title, description, status, category_id
        FROM tasks
        WHERE user_id = ? `;
        let params = [userId];

        if (status !== undefined) {
            baseQuery += ' AND status = ?';
            params.push(status);
        }

        if (title) {
            baseQuery += ' AND title LIKE ?';
            params.push(`%${title}%`);
        }

        if (category_id) {
            baseQuery += ' AND category_id = ?';
            params.push(category_id);
        }
        if (tag_id) {
            baseQuery += ` AND EXISTS(SELECT 1
            FROM tags_tasks WHERE tags_tasks.task_id = tasks.id AND tags_tasks.tag_id = ?)`;
            params.push(tag_id);
        }

        if (sort) {
            baseQuery += ` ORDER BY ${sort} ${order === 'desc' ? 'DESC' : 'ASC'}`;
        }
        baseQuery += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        const [tasks] = await db.query(baseQuery, params);
        const categoryIds = [...new Set(tasks.map(task => task.category_id))];
        let categories;

        if (categoryIds.length > 0) {
            const placeholders = categoryIds.map(() => '?').join(',');
            const query = `SELECT id, name FROM categories WHERE user_id = ? AND id IN (${placeholders})`;
            [categories] = await db.query(query, [userId, ...categoryIds]);
        } else {
            categories = []
        }

        let tagsIds = [...new Set(tasks.map(task => task.id))];

        let tags = [];
        if (tagsIds.length > 0) {
            [tags] = await db.query(`
                SELECT tags.id, tags.name, tags_tasks.task_id
                FROM tags
                JOIN tags_tasks ON tags_tasks.tag_id = tags.id
                WHERE tags_tasks.task_id IN (${tagsIds.map(() => '?').join(',')})
                `, [...tagsIds]);
        }
        
        const taskAll = taskLoadDetails(tasks, categories, tags);

        const [[{ total }]] = await db.query(`
            SELECT COUNT(*) AS total
            FROM tasks
            WHERE id = ?
                `, [userId]);

        res.json({
            data: taskAll,
            current_page: page,
            per_page: limit,
            total,
            last_page: Math.ceil(total / limit)

        });
    } catch (error) {
        res.status(500).json({ message: error });
    }
};

exports.getOne = async (req, res) => {
    const userId = req.user.id
    const { id } = req.params;

    try {
        if (isNaN(id)) {
            return res.status(422).json({ message: 'The parameter must be a number' });
        }
        let baseQuery = `SELECT id, title, description, status, category_id
        FROM tasks WHERE id = ? AND user_id = ? `;
        let params = [id, userId];

        const [tasks] = await db.query(baseQuery, params);

        if (tasks.length === 0) {
            return res.status(404).json({ message: "Task not found" });
        }
        const [categories] = await db.query(`SELECT  id,name FROM categories WHERE user_id= ? AND EXISTS(SELECT 1 FROM tasks WHERE tasks.category_id = categories.id AND tasks.id = ? ) `, [userId, id]);

        const [tags] = await db.query(`
                SELECT tags.id, tags.name, tags_tasks.task_id
                FROM tags
                JOIN tags_tasks ON tags_tasks.tag_id = tags.id
                WHERE tags_tasks.task_id = ?
                `, [id]);
        const [taskOne] = taskLoadDetails(tasks, categories, tags);

        res.json({ data: taskDecorator(taskOne) });
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.create = async (req, res) => {
    const userId = req.user.id
    const { title, description, status = 0, category_id, tagIds = [] } = req.body;

    const conn = await db.getConnection();
    try {
        if (!title || !description || !category_id) {
            return res.status(402).json({ message: 'Title, description and category is required' });
        }

        const [categoryCondition] = await db.query(`SELECT id FROM categories WHERE user_id = ? AND id = ? `, [userId, category_id]);
        if (categoryCondition.length === 0) {
            return res.status(422).json({ message: 'The category not found' });
        }

        if (tagIds.length > 0) {
            const [validTags] = await db.query(`SELECT id FROM tags WHERE id IN(?)`, [tagIds]);
            if (validTags.length !== tagIds.length) {
                return res.status(404).json({ message: 'Some tags are invalid or not found' });
            }
        }

        await conn.beginTransaction();
        const [result] = await conn.query(`
            INSERT INTO tasks(title, description, status, category_id, user_id)
            VALUES(?, ?, ?, ?, ?)`,
            [title, description, status, category_id, userId]
        );

        const taskId = result.insertId;

        const uniqueTagIds = [...new Set(tagIds)];
        for (const tagId of uniqueTagIds) {
            await conn.query(`INSERT INTO tags_tasks(task_id, tag_id) VALUES(?, ?)`, [taskId, tagId]);
        }
        let tags;
        const [[category]] = await conn.query(`SELECT id,name FROM categories WHERE id = ? `, [category_id]);
        if (tagIds.length > 0) {
            [tags] = await conn.query(`SELECT id, name FROM tags WHERE id IN(?)`, [tagIds]);
        } else {
            tags = []
        }

        await conn.commit();
        const newTask = { id: taskId, title, description, status, category, tags };

        res.status(201).json({ data: taskDecorator(newTask) });

    } catch (error) {
        await conn.rollback();
        console.error(error);

        res.status(500).json({ data: error });
    } finally {
        conn.release();
    }
};

exports.update = async (req, res) => {
    const userId = req.user.id
    const id = req.params.id;
    const { title, description, status, category_id, tagIds = [] } = req.body;

    const conn = await db.getConnection();
    try {
        if (isNaN(id)) {
            return res.status(422).json({ message: 'The parameter must be a number' });
        }

        const [task] = await db.query('SELECT id FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);

        if (task.length === 0) {
            return res.status(404).json({ message: 'Task not found ' });
        }

        const taskData = task[0];

        if (category_id != null) {
            const [categoryExists] = await db.query(
                'SELECT id FROM categories WHERE id = ? AND user_id = ?',
                [category_id, userId]
            );
            if (categoryExists.length === 0) {
                return res.status(404).json({ message: 'The category not found or not owned by the user' });
            }
        }

        if (tagIds.length > 0) {
            const [validTags] = await db.query(
                `SELECT id FROM tags WHERE id IN(${tagIds.map(() => '?').join(',')})`,
                tagIds
            );
            if (validTags.length !== tagIds.length) {
                return res.status(422).json({ message: 'Some tags are invalid or not found' });
            }
        }

        await conn.beginTransaction();

        const fields = [];
        const params = [];

        if (title) {
            fields.push('title = ?');
            params.push(title);
        }
        if (description) {
            fields.push('description = ?');
            params.push(description);
        }
        if (status !== undefined) {
            fields.push('status = ?');
            params.push(status);
        }
        if (category_id !== undefined) {
            fields.push('category_id = ?');
            params.push(category_id);
        }

        if (fields.length > 0) {
            const updateQuery = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
            params.push(id, userId);
            await conn.query(updateQuery, params);
        }

        let tags = [];
        if (tagIds.length > 0) {
            const [existingLinks] = await conn.query(
                'SELECT tag_id FROM tags_tasks WHERE task_id = ?',
                [id]
            );
            const existingIds = existingLinks.map(link => link.tag_id);
            const newIds = tagIds.filter(tagId => !existingIds.includes(tagId));

            for (const tagId of newIds) {
                await conn.query(
                    'INSERT INTO tags_tasks (task_id, tag_id) VALUES (?, ?)',
                    [id, tagId]
                );
            }

            const [allTags] = await conn.query(`
                SELECT tags.id, tags.name
                FROM tags
                JOIN tags_tasks ON tags.id = tags_tasks.tag_id
                WHERE tags_tasks.task_id = ?`, [id]
            );
            tags = allTags;
        } else {
            const [existingTags] = await conn.query(`
                SELECT tags.id, tags.name
                FROM tags
                JOIN tags_tasks ON tags.id = tags_tasks.tag_id
                WHERE tags_tasks.task_id = ?`, [id]
            );
            tags = existingTags;
        }

        const [[category]] = await conn.query(
            'SELECT id, name FROM categories WHERE id = ?',
            [category_id ?? taskData.category_id]
        );

        await conn.commit();

        const newTask = {
            id,
            title: title ?? taskData.title,
            description: description ?? taskData.description,
            status: status ?? taskData.status,
            category,
            tags
        };

        res.status(200).json({ data: taskDecorator(newTask) });
    } catch (error) {
        await conn.rollback();
        res.status(500).json({ error });
    } finally {
        conn.release();
    }
};

exports.destroy = async (req, res) => {
    const userId = req.user.id
    const id = req.params.id;
    try {
        if (isNaN(req.params.id)) {
            return res.status(422).json({ message: 'The parameter must be a number' });
        }
        const [task] = await db.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
        if (task.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const [backupTask] = task
        const [result] = await db.query(`DELETE FROM tasks WHERE id = ? AND user_id = ?`, [id, userId]);
        await db.query(`DELETE FROM tags_tasks WHERE task_id = ? `, [id]);

        res.json({ data: taskDecorator(backupTask) });
    } catch (error) {
        res.status(500).json({ error });
    }
};