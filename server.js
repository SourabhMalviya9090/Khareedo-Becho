require("dotenv").config({path:"config.env"});
const express = require("express");
const http = require("http");
// const socketio = require('socket.io');
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const auth = require("./middleware/auth");
const stripe  = require("stripe")(process.env.STRIPE_API_SECRET_KEY);
const FeaturedProducts = require("./models/featuresProducts");
const Products = require("./models/product.model");
const { all } = require("./routes/user.route");
const User =require("./models/user.model")
// Import the Nodemailer library
const nodemailer = require('nodemailer');

// Create a transporter object
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // use SSL
  auth: {
    user: '797460001@smtp-brevo.com',
    pass: '5kftMmOVIAjGRaEU',
  }
});


const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
  pingTimeout: 60000
});
let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.id === userId) && users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};
//
io.on("connection", (socket) => {
  console.log("a user connected.");
  socket.on("setup", (userData) => {
      socket.join(userData._id)
      
      socket.emit("connected")
  }
 )
 socket.on('join chat',(chatId)=>{
  socket.join(chatId)
  console.log("chat joined with Id",chatId)
}
);
socket.on('new message',(newMessage)=>{
  let chat= newMessage
  
  if(!chat.users) return console.log("no users for the chat")
    chat.users.forEach((user)=>{
      if(user._id!== newMessage.latestMessage.sender._id){
       
        socket.in(user._id).emit("message recieved", chat)
        // socket.in(user._id).emit("notification",newMessage)
      }
  })
 
})
socket.on("typing",(room)=>{
  // console.log("helo")
  
   socket.in(room).emit("typing",room)
})
socket.on("stop typing",(room)=>{
  
  socket.in(room).emit("stop typing",room)
})

socket.off("setup", (userData)=>{
    socket.leave(userData._id)
    console.log("user disconnected!")
})
socket.on('disconnect',()=>{
  console.log("user disconnect")
})

});

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

//Routes
app.use("/user", require("./routes/user.route"));
app.use("/rooms", auth, require("./routes/chat.route"));
app.use("/api", require("./routes/category.route"));
app.use("/api", require("./routes/upload.route"));
app.use("/api", require("./routes/product.route"));
app.use("/api", require("./routes/ad.route"));
app.use('/messages',auth,require("./routes/messages.route"))

//
const URI = process.env.MONGODB_URL||"mongodb://localhost:27017/KB";
const PORT = process.env.PORT || 5000;

//
mongoose
  .connect(URI, {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then(() => console.log("connected to db successfully"))
  .catch((e) => console.log(e));

//
app.get("/", (req, res) => {
  res.json({ msg: "welcome" });
});

app.get("/payment_done",async(req,res)=>{
  const {product_id}  =  req.query;
  const prod = await Products.findByIdAndUpdate(product_id,{isFeatured: true});
  console.log("coming.....");
  // const newProduct = new featuredProducts({product: prod._id});
  const newProduct = await FeaturedProducts.create({product: product_id});
  const user= await User.findById(prod.seller_id)
  const mailOptions = {
    from: 'malviyasourabh576@gmail.com',
    to: user.email,
    subject: 'Confirmation of featured product',
    text: `Hey Your Product ${prod.title} has been featured on IITJKB!`
  };
  
  // Send the email
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
  res.redirect("http://localhost:3000/");
}); 

app.get("/featuredProducts",async(req,res)=>{
  const allFeaturedProducts = await FeaturedProducts.find().populate("product");
  console.log(allFeaturedProducts);
  res.json({sucess: 1,
    featured_products: allFeaturedProducts
  });
})


app.post("/createcheckoutsession",async(req,res)=>{
  const {products} = req.body;
  const lineItems = [{price_data:{
    currency : "usd",
    product_data:{
      name: products.title,
      images: [products.image.url]
    },
    unit_amount: 150
  },
  quantity:1
}];

const session = await stripe.checkout.sessions.create({
  payment_method_types :["card"],
  line_items: lineItems,
  mode: "payment",
  success_url: `http://localhost:5000/payment_done?product_id=${products._id}`,
  cancel_url: "http://localhost:3000/"
});

res.json({id:session.id});

})
//

app.get("*", (req, res) => {
  return res.status(404).json({
    success: false,
    message: "API endpoint doesn't exist",
  });
})
server.listen(PORT, () => {
  console.log("server is listening at", PORT);
});

