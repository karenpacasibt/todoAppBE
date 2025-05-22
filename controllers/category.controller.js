const db = require('../DB/connection');
const categoryDecorator = require('../decorators/category.decorator')

exports.getAll = async (req, res) => {
    try {
        const userId = 1
        // const userId = req.user.id;
        const [categories] = await db.query('SELECT * FROM categories WHERE user_id = ?', [userId]);
        res.json({ data: categories.map(categoryDecorator) });
    } catch (error) {
        res.json(error);
    }
};

exports.getOne = async (req, res) => {
    try {
        const userId = 1
        // const userId = req.user.id;
        if (isNaN(req.params.id)) {
            return res.status(422).json({ message: 'The parameter must be a number' });
        }
        const [category] = await db.query('SELECT * FROM categories WHERE id = ? AND user_id = ?', [req.params.id, userId]);
        if (category.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.json({ data: categoryDecorator(category[0]) });
    } catch (error) {
        res.json(error);
    }
};

exports.create = async (req, res) => {
    const { name } = req.body;
    try {
        const userId = 1
        // const userId = req.user.id;
        if (!name) {
            return res.status(422).json({ message: 'Name is required' });
        }
        const [exist] = await db.query('SELECT * FROM categories WHERE name = ? AND user_id = ?', [name, userId]);
        if (exist.length > 0) {
            return res.status(422).json({ message: 'The category already exists' });
        }
        const [result] = await db.query('INSERT INTO categories (name, user_id) VALUES (?, ?)', [name, userId]);
        const newCategory = { id: result.insertId, name };
        res.status(201).json({ data: categoryDecorator(newCategory) });
    } catch (error) {
        res.json(error);
    }
};

exports.update = async (req, res) => {
    const { name } = req.body;
    const id = req.params.id;
    try {
        const userId = 1
        if (isNaN(id)) {
            return res.status(422).json({ message: 'The parameter must be a number' });
        }
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }
        const [category] = await db.query('SELECT id FROM categories WHERE id = ? AND user_id = ?', [id, userId]);
        if (category.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        const [exist] = await db.query('SELECT * FROM categories WHERE name = ? AND user_id = ? AND id != ?', [name, userId, id]);
        if (exist.length > 0) {
            return res.status(422).json({ message: 'The category already exists' });
        }
        const [result] = await db.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
        category.name = name;
        res.json({ data: categoryDecorator(category) });
    } catch (error) {
        res.json(error);
    }
};

exports.destroy = async (req, res) => {
    const id = req.params.id;
    try {
        const userId = 1
        // const userId = req.user.id;
        if (isNaN(id)) {
            return res.status(422).json({ message: 'The parameter must be a number' });
        }
        const [category] = await db.query('SELECT id FROM categories WHERE id = ? AND user_id = ?', [id, userId]);
        if (category.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        await db.query('DELETE FROM categories WHERE id = ? AND user_id = ?', [id, userId]);
        res.json({ message: 'Category correctly eliminated' });
    } catch (error) {
        res.json(error);
    }
};
