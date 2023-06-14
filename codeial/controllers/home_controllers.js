const { populate } = require('../models/like');
const Post = require('../models/post');
const User=require('../models/users');

module.exports.home = async function(req, res){
    // console.log(req.cookies);
    // res.cookie('user_id', 25);

    // Post.find({}, function(err, posts){
    //     return res.render('home', {
    //         title: "Codeial | Home",
    //         posts:  posts
    //     });
    // });

    // populate the user of each post
    try{
        // console.log('inside home controller');
        let posts=await Post.find({})
        .sort('-createdAt')
        .populate('user')
        .populate({
            path:'comments',
            populate:{
                path:'user'
            },
            populate:{
                path:'likes'
            }
        }).populate('likes');

        let users=await User.find({});
                
        return res.render('home', {
                    title: "Codeial | Home",
                    posts:  posts,
                    all_users: users
                });
    }catch(err){
        console.log('error',err);
        return;
    }
}

// module.exports.actionName = function(req, res){}


