const Comment=require('../models/comment');
const Post=require('../models/post');
const commentsMailer=require('../mailers/comments_mailers');
const Queue=require('../config/kue');
const commentEmailWorker=require('../workers/comment_email_worker');


// module.exports.create=async function(req,res){
//     Post.findById(req.body.post,function(err,post){
//         if(post){
//             Comment.create({
//                 content:req.body.content,
//                 post:req.body.post,
//                 user:req.user._id
//             },function(err,comment){
//                 // handle error
//                 if(err){
//                     req.flash('error',err);
//                     return;
//                 }
//                 req.flash('success','comments created');
//                 post.comments.push(comment);    //method of db
//                 post.save();

//                 res.redirect('/');
//             });
//         }
//     });
// }
module.exports.create=async function(req,res){
    try{
        let post=await Post.findById(req.body.post);
        if(post){
            let comment=await Comment.create({
                content:req.body.content,
                post:req.body.post,
                user:req.user._id
            });
            post.comments.push(comment);
            post.save();
            comment=await comment.populate('user','name email');
            // const ki=commentsMailer.newComment(comment);
            // console.log("*************",ki);
            let job=Queue.create('emails',comment).save(function(err){
                if(err){
                    console.log('error in creating a queue',err);
                    return;
                }
                console.log('job enqueued',job.id);
            });
            if(req.xhr){
                return res.status(200).json({
                    data:{
                        comment:comment
                    },
                    message:"Post created!"
                });
            }
            req.flash('success','Comment published!');
            res.redirect('/');
        }
    }catch(err){
        req.flash('error',err);
        return;
    }
}
// module.exports.destroy=function(req,res){
    
//     Comment.findById(req.params.id, function(err,comment){
//         if(comment.user==req.user.id){
//             let postId=comment.post;
//             comment.remove();

            

//             Post.findByIdAndUpdate(postId,{$pull:{comments:req.params.id}},function(err,post){
//                 req.flash('success', 'comments only deleted');
//                 return res.redirect('back');
//             })
//         }else{
//             req.flash('error',err);
//             return res.redirect('back');
//         }
//     });
// }

module.exports.destroy = async function(req, res){

    try{
        let comment = await Comment.findById(req.params.id);

        if (comment.user == req.user.id){

            let postId = comment.post;

            comment.remove();

            let post = Post.findByIdAndUpdate(postId, { $pull: {comments: req.params.id}});

            // CHANGE :: destroy the associated likes for this comment
            await Like.deleteMany({likeable: comment._id, onModel: 'Comment'});


            // send the comment id which was deleted back to the views
            if (req.xhr){
                return res.status(200).json({
                    data: {
                        comment_id: req.params.id
                    },
                    message: "Post deleted"
                });
            }


            req.flash('success', 'Comment deleted!');

            return res.redirect('back');
        }else{
            req.flash('error', 'Unauthorized');
            return res.redirect('back');
        }
    }catch(err){
        req.flash('error', err);
        return;
    }
    
}