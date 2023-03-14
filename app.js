const express = require("express");
const { read } = require("fs");
const mongoose = require("mongoose");

const app = express();
const port = 3000;
const https = require("https");
const { stringify } = require("querystring");

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
const date = require(__dirname + "/date.js");

mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://itay999:itay123@cluster0.2ncgnvo.mongodb.net/toDoListDB");

// let items = [];
// let workItems = [];

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "Please provide a item name"],
  },
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Do homework",
});

const item2 = new Item({
  name: "Do homework",
});

const item3 = new Item({
  name: "Do homework",
});

const defaultItems = [item1, item2, item3];

const listSchema = ({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {
  Item.find()
    .then((foundItems) => {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems);
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newItemsList: foundItems });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});


app.get("/:customListName", (req, res) => {

    const customListName = req.params.customListName.charAt(0).toUpperCase() + req.params.customListName.slice(1);
  
    List.findOne({name: customListName})
    .then((foundList) => {
      if (!foundList) {
        console.log("not exists");
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/" + customListName);
        }else{
        console.log("exists")
        res.render("list", {listTitle: foundList.name , newItemsList: foundList.items });
      }
  }).catch(function (err) {
    console.log(err);
  })  
})

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

if (listName === "Today") {
  item.save();
  res.redirect("/");
}else{
  List.findOne({name: listName})
  .then((foundList) => {
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  })
}
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
  .then(() => {
    res.redirect("/");
  })
  .catch(err => {
    console.log(err);
  });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
    .then((foundList) =>{
        res.redirect("/" + foundList.name);
    }).catch(err => {
      console.log(err);
    })
  }

  
})



app.post("/work", (req, res) => {
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(process.env.PORT || port, () => {
  console.log(`newsletter Signup app listening on port ${port}`);
});
