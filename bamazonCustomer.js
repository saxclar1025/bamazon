let inquirer = require("inquirer");
let mysql = require("mysql");

let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon_db"
});

var products = [];

connection.connect(err=>{
    if(err) throw err;

    console.log("Welcome to Bamazon!");
    console.log("Product Listing:");
    connection.query("SELECT * FROM products", (err,res)=>{
        if(err) throw err;

        products = res.splice(0);
        products.forEach(row=>{
            console.log(row.item_id + " " + row.product_name + " $" + row.price.toFixed(2));
        });
        getPurchaseInfo();
    });
});

function getPurchaseInfo() {
    inquirer.prompt([
        {
            type: "input",
            message: "Enter the id of the product you wish to buy: ",
            name: "productId",
            validate: input=>{
                if (products.find(product=>product.item_id===parseInt(input))===undefined) {
                    return "Not a valid product ID";
                }
                return true;
            }
        },
        {
            type: "input",
            message: "Enter the quantity you wish to buy: ",
            name: "quantity",
            validate: input=>{
                if(isNaN(parseInt(input))) return "Invalid input: not a number";
                if(parseInt(input)<1) return "Invalid input: quantity must be greater than 0";
                return true;
            }
        }
    ])
    .then(res=>{
        var product = products.find(product=>(product.item_id===parseInt(res.productId)));
        if(res.quantity > product.stock_quantity) {
            console.log("Unable to complete purchase: insufficient quantity");
            return;
        }
        connection.query("UPDATE products SET stock_quantity=? WHERE item_id=?", 
        [
            parseInt(product.stock_quantity) - parseInt(res.quantity),
            res.productId
        ],
        (err,result)=>{
            if(!!err) throw err;

            console.log("Purchase Summary");
            console.log("----------------");
            console.log("Product: " + product.product_name);
            console.log("Unit price: $" + product.price.toFixed(2));
            console.log("Quantity: " + res.quantity);
            console.log("Total: $" + (parseInt(res.quantity) * parseFloat(product.price)).toFixed(2));
        });
    });
};