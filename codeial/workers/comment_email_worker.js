const Queue=require('../config/kue');

const commentsMailer=require('../mailers/comments_mailers');

Queue.process('emails',function(job,done){
    console.log('email workers is doing his job',job.data);

    commentsMailer.newComment(job.data);
    done();
});