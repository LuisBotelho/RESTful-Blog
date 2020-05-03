var express          = require("express"),
	app              = express(),
	bodyParser       = require("body-parser"),
	mongoose         = require("mongoose"),
	methodOverride   = require("method-override"),
	expressSanitizer = require("express-sanitizer");

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

var db_url = process.env.DATABASEURL || "mongodb://localhost/restful_blog_app";
mongoose.connect(db_url);


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(methodOverride("_method"));
app.use(expressSanitizer());

//Mongoose/Model config
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default:Date.now}
	
});


var Blog = mongoose.model("Blog",blogSchema);

// Blog.create({
// 	title:"Test Blog",
// 	image: "https://image.shutterstock.com/image-photo/camping-tent-under-pine-forest-600w-358158596.jpg",
// 	body:"Hello this is a blog post"
// });

//RESTful Routes
app.get("/",function(req,res){
	res.redirect("/blogs");
})

app.get("/blogs",function(req,res){
	Blog.find({},function(err,blogs){
		if(err){
			console.log("ERROR");
		}
		else{
			res.render("index",{blogs:blogs})
		}
	});
		
});

//New Routes
app.get("/blogs/new",function(res,res){
	res.render("new");
})

//Create Route

app.post("/blogs",function(req,res){
	//create blog
	// console.log(req.body);
	req.body.blog.body = req.sanitize(req.body.blog.body);
	// console.log(req.body);
	Blog.create(req.body.blog,function(err,newBlog){
		if(err){
			res.render("new")
		}
		else{
			//then, redirect to the index
			res.redirect("/blogs")
		}
	});
	
	
});

//Show route

app.get("/blogs/:id",function(req,res){
	Blog.findById(req.params.id,function(err,foundBlog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.render("show",{blog:foundBlog});
		}
	})
	
});

//Edit route
app.get("/blogs/:id/edit",function(req,res){
	
	Blog.findById(req.params.id,function(err,foundBlog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.render("edit",{blog:foundBlog});
		}
	})
});

//UPDATE route
app.put("/blogs/:id",function(req,res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
		if(err){
			app.redirect("/blogs")
		}
		else{
			res.redirect("/blogs/" + req.params.id);
		}
	});
});


//DELETE route
app.delete("/blogs/:id",function(req,res){
	//destroy
	Blog.findByIdAndRemove(req.params.id,function(err){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.redirect("/blogs");
		}
	});
	
})


var heroku_var = process.env.HEROKU || '0';
if(heroku_var === '0'){
	app.listen(3000,function(){
		console.log("Running on port 3000.")
	});
}
else{
	app.listen(process.env.PORT,process.env.IP);
}