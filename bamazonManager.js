let inquirer = require("inquirer");
let mysql = require("mysql");

let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon_db"
});

inquirer.prompt([
    {
        type: "list",
        message: "Choose an action: ",
        name: "command",
        choices: [
            "View Products for Sale",
            "View Low Inventory",
            "Add to Inventory",
            "Add New Product"
        ]
    }
])
.then(res=>{
    if(res.command === "View Products for Sale") {
        connection.query("SELECT * FROM products", (err,data)=>{
            if(err) throw err;

            data.forEach(row=>{
                console.log(row.item_id + " " + row.product_name + " $" + row.price.toFixed(2) + " qty: " + row.stock_quantity);
            });
        });
        return;
    }
    if(res.command === "View Low Inventory") {
        connection.query("SELECT * FROM products WHERE stock_quantity < 5", (err,data)=>{
            if(err) throw err;

            data.forEach(row=>{
                console.log(row.item_id + " " + row.product_name + " - " + row.stock_quantity + " items left");
            });
        });

        return;
    }
    if(res.command === "Add to Inventory") {
        connection.query("SELECT * FROM products", (err,data)=>{
            if(err) throw err;

            var selections = [];
            data.forEach(row=>{
                selections.push(row.item_id + " " + row.product_name);
            });
            inquirer.prompt([
                {
                    type: "list",
                    name: "id",
                    message: "Choose a product to add inventory to: ",
                    choices: selections
                },
                {
                    type: "input",
                    name: "quantity",
                    message: "How many are you adding? ",
                    validate: input=>{
                        if(isNaN(parseInt(input))) return "Invalid input: not a number";
                        if(parseInt(input)<1) return "Invalid input: quantity must be greater than 0";
                        return true;
                    }
                }
            ])
            .then(res=>{
                var targetId = parseInt(res.id.split(" ")[0]);
                // console.log("Target id: " + targetId);
                var targetRow = data.find(row=>(row.item_id===targetId));
                // console.log("Target row: ");
                // console.log(targetRow);
                var newQuantity = parseInt(res.quantity)+parseInt(targetRow.stock_quantity);
                connection.query("UPDATE products SET stock_quantity=? WHERE item_id=?",
                [ newQuantity, targetId ],
                (err, result)=>{
                    if(err) throw err;
                    console.log("New Quantity: " + newQuantity);
                });
            });
        });

        return;
    }
    if(res.command === "Add New Product") {
        inquirer.prompt([
            {
                type: "input",
                name: "newProductName",
                message: "Enter name of new product: ",
                validate: input=>{
                    if(!input) return "Invalid input: cannot be empty";
                    return true;
                }
            },
            {
                type: "input",
                name: "newProductDepartment",
                message: "Enter department of new product: ",
                validate: input=>{
                    if(!input) return "Invalid input: cannot be empty";
                    return true;
                }
            },
            {
                type: "input",
                name: "newProductPrice",
                message: "Enter price of new product ($): ",
                validate: input=>{
                    if(isNaN(parseFloat(input))) return "Invalid input: not a number";
                    if(parseFloat(input)<=0) return "Invalid input: price must be greater than 0";
                    return true;
                }
            },
            {
                type: "input",
                name: "startingQuantity",
                message: "Enter a starting stock quantity (default: 0): ",
                default: "0",
                validate: input=>{
                    if(isNaN(parseInt(input))) return "Invalid input: not a number";
                    if(parseInt(input)<0) return "Invalid input: quantity cannot be negative";
                    return true;
                }
            }
        ])
        .then(res=>{
            connection.query("INSERT INTO products (product_name, department_name, price, stock_quantity) " + 
            "VALUES (?, ?, ?, ?)",
            [res.newProductName, res.newProductDepartment, res.newProductPrice, res.startingQuantity],
            (err,result)=>{
                if(err) throw err;

                console.log("New product added:");
                console.log("Name: " + res.newProductName);
                console.log("Department: " + res.newProductDepartment);
                console.log("Price: $" + parseFloat(res.newProductPrice).toFixed(2));
                console.log("Stock: " + res.startingQuantity);
            });
        });

        return;
    }
});