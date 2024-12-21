-- 创建 articles 表
CREATE TABLE articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    functions VARCHAR(255) NOT NULL,
    buildingID VARCHAR(255) NOT NULL
);

-- 创建 images 表
CREATE TABLE images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    article_id INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    `order` INT,
    FOREIGN KEY (article_id) REFERENCES articles(id)
);

-- 创建 paragraphs 表
CREATE TABLE paragraphs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    article_id INT NOT NULL,
    content TEXT NOT NULL,
    `order` INT,
    FOREIGN KEY (article_id) REFERENCES articles(id)
);
