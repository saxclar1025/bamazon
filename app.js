let inquirer = require("inquirer");
let mysql = require("mysql");

let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon_db"
});

connection.connect(err=>{
    if(err) throw err;
    
});