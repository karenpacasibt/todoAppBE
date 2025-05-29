const db = require('../DB/connection');
const tagDecorator = require('../decorators/tag.decorator')

exports.getAll = async (req, res) => {
    try {
        const userId = req.user.id;
        const [tags] = await db.query('SELECT * FROM tags WHERE user_id = ?', [userId]);
        res.json({ data: tags.map(tagDecorator) });
    } catch (error) {
        res.json(error);
    }
};

exports.getOne = async (req, res) => {
    try {
        const userId = req.user.id;
        if (isNaN(req.params.id)) {
            return res.status(422).json({ message: 'The parameter must be a number' });
        }
        const [tag] = await db.query('SELECT * FROM tags WHERE id = ? AND user_id = ?', [req.params.id, userId]);
        if (tag.length === 0) {
            return res.status(404).json({ message: "tag not found" });
        }
        res.json({ data: tagDecorator(tag[0]) });
    } catch (error) {
        res.json(error);
    }
};

exports.create = async (req, res) => {
    const { name } = req.body;
    try {
        const userId = req.user.id;
        if (!name) {
            return res.status(422).json({ message: 'Name is required' });
        }
        const [exist] = await db.query('SELECT * FROM tags WHERE name = ? AND user_id = ?', [name, userId]);
        if (exist.length > 0) {
            return res.status(422).json({ message: 'The tag already exists' });
        }
        const [result] = await db.query('INSERT INTO tags (name, user_id) VALUES (?, ?)', [name, userId]);
        const newtag = { id: result.insertId, name };
        res.status(201).json({ data: tagDecorator(newtag) });
    } catch (error) {
        res.json(error);
    }
};

exports.update = async (req, res) => {
    const { name } = req.body;
    const userId = req.user.id;
    const id = req.params.id;
    try {
        if (isNaN(id)) {
            return res.status(422).json({ message: 'The parameter must be a number' });
        }
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }
        const [tag] = await db.query('SELECT id FROM tags WHERE id = ? AND user_id = ?', [id, userId]);
        if (tag.length === 0) {
            return res.status(404).json({ message: 'tag not found' });
        }
        const [exist] = await db.query('SELECT * FROM tags WHERE name = ? AND user_id = ? AND id != ?', [name, userId, id]);
        if (exist.length > 0) {
            return res.status(422).json({ message: 'The tag already exists' });
        }
        const [result] = await db.query('UPDATE tags SET name = ? WHERE id = ?', [name, id]);
        tag.name = name;
        res.json({ data: tagDecorator(tag) });
    } catch (error) {
        res.json(error);
    }
};

exports.destroy = async (req, res) => {
    const id = req.params.id;
    try {
        const userId = req.user.id;
        if (isNaN(id)) {
            return res.status(422).json({ message: 'The parameter must be a number' });
        }
        const [tag] = await db.query('SELECT id FROM tags WHERE id = ? AND user_id = ?', [id, userId]);
        if (tag.length === 0) {
            return res.status(404).json({ message: 'tag not found' });
        }
        const [backupTag] = tag
        await db.query('DELETE FROM tags WHERE id = ? AND user_id = ?', [id, userId]);
        res.json({ data: tagDecorator(backupTag) });
    } catch (error) {
        res.json(error);
    }
};
