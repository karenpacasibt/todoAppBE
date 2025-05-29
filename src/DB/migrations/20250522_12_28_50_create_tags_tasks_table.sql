CREATE TABLE IF NOT EXISTS tags_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tag_id INT NOT NULL,
    task_id INT NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tag_task (task_id, tag_id)
)