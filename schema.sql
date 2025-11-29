-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role_id INTEGER DEFAULT 2,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建角色表
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- 创建题库表
CREATE TABLE IF NOT EXISTS libraries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建题目表
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    library_id INTEGER,
    question_text TEXT NOT NULL,
    answer_text TEXT NOT NULL,
    question_type TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (library_id) REFERENCES libraries(id)
);

-- 创建试卷表
CREATE TABLE IF NOT EXISTS papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建试卷题目关联表
CREATE TABLE IF NOT EXISTS paper_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paper_id INTEGER,
    question_id INTEGER,
    question_order INTEGER,
    FOREIGN KEY (paper_id) REFERENCES papers(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- 创建默认角色
INSERT INTO roles (name, description) VALUES ('admin', '管理员');
INSERT INTO roles (name, description) VALUES ('user', '普通用户');

-- 创建默认管理员用户 (密码: admin123)
INSERT INTO users (username, password, email, role_id) VALUES ('admin', 'pbkdf2:sha256:150000$R8J3F7m7$528b38205721042802b102462c702019593b908399310739074793372394335a', 'admin@example.com', 1);
