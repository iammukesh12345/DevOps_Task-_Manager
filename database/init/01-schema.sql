CREATE DATABASE IF NOT EXISTS taskdb;

USE taskdb;

CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO tasks (title, completed)
SELECT 'Learn Jenkins Pipeline', FALSE
WHERE NOT EXISTS (
    SELECT 1 FROM tasks WHERE title = 'Learn Jenkins Pipeline'
);

INSERT INTO tasks (title, completed)
SELECT 'Build Docker Image', FALSE
WHERE NOT EXISTS (
    SELECT 1 FROM tasks WHERE title = 'Build Docker Image'
);
