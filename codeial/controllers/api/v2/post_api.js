const comment=require('../../../models/comment');
const post=require('../../../models/post');

module.exports.index=async function(req,res){
    let posts=await post.find({})
    .sort('-createdAt')
    .populate('user')
    .populate({
        path:'comments',
        populate:{
            path:'user'
        }
    });

    return res.json(200,{
        message:"Lists of posts",
        posts:posts
    });

}