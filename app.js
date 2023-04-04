
const express=require("express");
const bodyparser=require("body-parser");
const bodyParser = require("body-parser");
const app=express();
const mongoose=require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/listDB");

const itemsSchema ={
  name :String
};
let first=1;
const Item =mongoose.model("Item",itemsSchema);

const item1=new Item({name:"Add all your task here !!"});
const item2=new Item({name:"Add New Page by Editing URL (/College or /Shopping etc."});
const item3=new Item({name:"..........Let's Go......"});

let defaultarr=[];
defaultarr=[item1,item2,item3];
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

// var items=["Drink Water","Exercise"];
// let works=["ADD HERE"];

var time=new Date();
var options={
  weekday:"long",
  day:"numeric",
  month:"long"
};
 var day=time.toLocaleDateString("en-US",options);



const listSchema={
  name:String,
  items:[itemsSchema]
}
const List=mongoose.model("List",listSchema);
const defaultItem=[item1,item2,item3];

app.get("/",async function(req,res){

    const found=await Item.find({});
    // console.log(found);
    if(found.length==0&&first==1)
    {
     first=0;
     Item.insertMany(defaultarr)
           .then(function () {
             console.log("Successfully saved defult items to DB");
           })
           .catch(function (err) {
             console.log(err);
           });
           res.redirect("/");
    }
    else{

        res.render("lists",{
          date:"Today",
          newListItems:found
         }); 
       }
 
  
  
    
});

app.post("/",async function(req,res){
  var item_add=req.body.newItem;
  const listName=(req.body.lists);
  const item=new Item({
    name:item_add
  });
  if(listName === "Today")
  {
    item.save();
   res.redirect("/");
  }
  else{
    const resu=await List.findOne({name:listName}).exec();
    //  console.log(resu.items);
      resu.items.push(item);
      resu.save();
      res.redirect("/"+listName);
    
  }
  
  
  
});



app.get("/:customName",async function(req,res){

   const customListName=(req.params.customName);
  
  const result=( await List.findOne({name:customListName}).exec());
  if(result==null)
  {
     const list =new List({
      name:customListName,
      items:defaultItem
     });
     list.save();
     res.redirect("/"+customListName);
  }
  else{
    res.render("lists",{
      date:customListName,
      newListItems:result.items
    })
  }
});

app.post("/delete",async function(req,res){
     const checkedItem=req.body.checkbox;
     const listName=req.body.listName;
     if(listName=="Today")
     {
      first=0;
      await Item.findByIdAndRemove(checkedItem);
      // console.log(Item);
      res.redirect("/");
     }
     else{
      const curr=( await List.findOne({name:listName}).exec());
    //  await curr.items.findByIdAndRemove(checkedItem);
    // List.findOneAndUpdate({name :listName}, {$pull: {items:{} }});
    // await curr.items.deleteOne({ _id: checkedItem }); 
    
     curr.items.pull(checkedItem);
     curr.save();
    res.redirect("/"+listName);

     }
   
});

app.listen(3000,function(){
  console.log("STARTED");
});

