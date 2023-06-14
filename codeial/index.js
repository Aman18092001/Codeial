const dotenv=require('dotenv');
dotenv.config({path:"./config.env"});
const express=require('express');
const env=require('./config/environment');
const logger=require('morgan');

const app=express();
require('./config/view-helpers')(app);
const port=4500;
const cookieParser=require('cookie-parser');
const expressLayout=require('express-ejs-layouts');
const db=require('./config/mongoose');
const session=require('express-session');
const passport=require('passport');
const passportLocal=require('./config/passport-local-strategy');
const passportJWT=require('./config/passport-jwt-strategy');
const passportGoogle=require('./config/passport-google-oauth2-strategy');
const MongoStore=require('connect-mongo');
const sassMIddleware=require('node-sass-middleware');
const flash=require('connect-flash');
const customMware=require('./config/middleware');
const { readFile } = require('fs');

// setup the chat server to be used with socket.io
const chatServer=require('http').Server(app);
const chatSockets=require('./config/chat_sockets').chatSockets(chatServer);
chatServer.listen(5000);
console.log('chat server is listening on port 5000');
const path=require('path');

app.use(sassMIddleware({
    src:path.join(__dirname,env.asset_path,'scss'),
    dest:path.join(__dirname,env.asset_path,'css'),
    debug:true,
    outputStyle:'extended',
    prefix:'/css'
}));

app.use(express.urlencoded());
app.use(cookieParser());
app.use(express.static(env.asset_path));
//make the uploads path available to the browser
app.use('/uploads',express.static(__dirname+'/uploads'));

app.use(logger(env.morgan.mode,env.morgan.options));
app.use(expressLayout);
//extract styles and scripts from subpages
app.set('layout extractStyles',true);
app.set('layout extractScripts',true);

// set up view engine
app.set('view engine','ejs');
app.set('views','./views');

//mongo store is used to store the session cookie in the db 
app.use(session({
    name:'codeial',
    // TODO change the secret before deployment in production mode
    secret:'env.session_cookie_key',
    saveUninitialized:false,
    resave:false,
    cookie:{
        maxAge: (1000 * 60 *100)
    },
    store: MongoStore.create(
      {
        mongoUrl:"mongodb://127.0.0.1:27017/codeial_db",
        autoRemove:'disabled'
      },
      function(err){
        console.log(err || 'connect_mongodb setup ok');
      }  
    )
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);
app.use(flash());
app.use(customMware.setFlash);

// use express router
app.use('/',require('./routes'));

app.listen(port,function(err){
    if(err){
        console.log(`error in server: ${err}`);
    }
    console.log(`server is running on: ${port}`);
});