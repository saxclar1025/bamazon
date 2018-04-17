DROP DATABASE IF EXISTS bamazon_db;

CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products(
    item_id int NOT NULL AUTO_INCREMENT,
    product_name varchar(50) NOT NULL,
    department_name varchar(50),
    price decimal(8,2),
    stock_quantity int,
    PRIMARY KEY (item_id)
);