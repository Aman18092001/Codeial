const fs=require('fs');
const rfs=require('rotating-file-stream');
const path=require('path');

const logDirectory=path.join(__dirname,'../production_logs');
fs.existsSync(logDirectory)|| fs.mkdirSync(logDirectory);

const accessLogStream=rfs.createStream("access.log", {
  interval: "1d",
  path: logDirectory,
});

// const stream = rfs.createStream("file.log", {
//   size: "10M", // rotate every 10 MegaBytes written
//   interval: "1d", // rotate daily
//   compress: "gzip" // compress rotated files
// });

const development={
      name:'development',
      asset_path:'./assets',
      session_cookie_key:'blahsomething',
      db:'codeial_db',
      smtp:{
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        secure:false,
        auth: {
          user: "6d25803cefd673",
          pass: "f794fbae4f04a5"
        }
      },
      google_client_id:"12819656685-ij4dn9agndadk6updvb7rrugsheq2dc8.apps.googleusercontent.com",
      google_client_secret:"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",
      google_call_back_url:"http://codeial.com/users/auth/google/callback",
      jwt_secret:'codeial',
      morgan:{
        mode:'dev',
        options:{stream:accessLogStream}
      }
}

const production={
      name:'production',
      asset_path:process.env.ASSET_PATH,
      session_cookie_key:process.env.SESSION_COOKIE_KEY,
      db:process.env.DB,
      smtp:{
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        secure:false,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      },
      google_client_id:process.env.GOOGLE_CLIENT_ID,
      google_client_secret:process.env.GOOGLE_CLIENT_SECRET,
      google_call_back_url:process.env.GOOGLE_CALL_BACK_URL,
      jwt_secret:process.env.JWT_SECRET,
      morgan:{
        mode:'combined',
        options:{stream:accessLogStream}
      }

}
console.log(process.env.name);

module.exports=eval(process.env.NODE_ENV)==undefined?development:eval(process.env.NODE_ENV);
// module.exports = process.env.NODE_ENV == development ? development : production;

// if (process.env.NODE_ENV == "production") {
//   module.exports = production;
// } else {
//   module.exports = development;
// }