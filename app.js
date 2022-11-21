const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
require('dotenv').config()

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://" + process.env.MONGO_USERNAME + ":" + process.env.MONGO_PASSWORD + "@cluster0.simcx9w.mongodb.net/todoListDB");

const itemsSchema = new mongoose.Schema({
    name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your to-do list"
});
const item2 = new Item({
    name: "Hit the + button to add a new item"
});
const item3 = new Item({
    name: "<-- Check this box to delete this item"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);


app.get("/", function(req,res){
    day = date.getDate();

    Item.find(function(err, items){
        if(err) console.log(err);
        else{

            if(items.length == 0){
                Item.insertMany(defaultItems, function(err){
                    if(err){
                        console.log(err);
                    }else{ 
                        console.log("Successfully inserted default items in DB");
                    }
                });
                res.redirect("/");
            } else{
                res.render('list', {listTitle: day , listItems: items});
            };
        };
    });
});

app.get("/category/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: {$eq: customListName}}, function(err, foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
            
                list.save();
                
                res.redirect("/category/" + customListName);
            }else{
                res.render('list', {listTitle: foundList.name, listItems: foundList.items});
            }
        }
    });

});


app.post("/", function(req,res){
    const newItemName = req.body.newToDoItem;
    const listName = req.body.list;

    const item = new Item({
        name: newItemName
    });

    if(listName === date.getDate()){
        item.save();

        res.redirect("/");
    }else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();

            res.redirect("/category/" + listName);
        })
    }


});

app.post("/delete", function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === date.getDate()){
        Item.findByIdAndRemove(checkedItemId, function(err){
            // console.log(err);
        });
        res.redirect("/");
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if(!err){
                res.redirect("/category/" + listName);
            }
        });
    }


});


app.listen((process.env.port || 3000), function(req,res){
    console.log("Server is up and running.");
});