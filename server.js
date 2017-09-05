/**
 * Created by Administrator on 2017/2/25.
 */
var express=require("express");
//加载cookie
var cookieParser=require("cookie-parser");
//下载插件，并加载插件
var session=require("express-session");
var mysql=require("mysql");
var bodyParser=require("body-parser");
var multer=require("multer");   //文件上传
var fs=require("fs");          //文件上传系统模块

//创建web程序入口

var app=express();

//配置
app.use(bodyParser.urlencoded({extended:false}));    //配置bodyParser
app.use(cookieParser());
var upload=multer({dest:"./photo"});   //指定上传文件的路径


//第二步，配置session
app.use(session({
    secret:"keyboard cat",  //私密id，一个session
    resave:true,
    saveUninitialized:true,
    cookie:{secure:false}    //https协议 https比http更加安全
}));
var pool=mysql.createPool({
    host:"127.0.0.1",
    port:3306,
    database:"node js",
    user:"root",
    password:"aaaa"
});
//服务器使用cookie很麻烦
//监听所有关于back、show.html的请求，不管是get、post
app.all("/back/*",function(req,res,next){
    console.log(req.session.uname);  //网页会一直刷新
   // next();
    if(req.session.uname==undefined){
        res.send("<script>alert('请先登录');location.href='../login.html'</script>");
    }else{
        //还得让他继续运行下去
        next();
    }
});

//用户注册
app.post("/addUserInfo",upload.single("photo"),function(req,res){
    var uname=req.body.uname;
    var pwd=req.body.pwd;
    var msg={};    //定义对象
    pool.getConnection(function(err,conn){
        if(err){
            msg.code=0;
            msg.message=err;
            msg.send(msg);
            res.end();
        }else{
            //先把文件上传
            var filename;   //filename用来传参
            if(req.file){
                filename="/photo/"+req.file.originalname;
                var path=__dirname+"/photo/"+req.file.originalname;
                fs.renameSync(req.file.path,path);
            }
            conn.query("insert into usemessge values(null,?,?,?)",[uname,pwd,filename],function(err,result){
                conn.release();
                if(err){
                    msg.code=0;
                    msg.message=err;
                    res.send(msg);
                    res.end();
                }else{
                    msg.code=1;
                    msg.message="注册成功";
                    res.send(msg);
                    res.end();
                }
            });
        }
    });
});


//用户登录
app.post("/userLogin",function(req,res){
    var uname=req.body.uname;
    var pwd=req.body.pwd;
    pool.getConnection(function(err,conn){
        conn.query("select * from usemessge where uname= ? and pwd=?",[uname,pwd],function(err,result){
            if(result.length<=0){
                res.send("0");
            }else{
                req.session.uname=uname;
                res.send("1");
                //把用户信息存储到session中去

            }
            res.end();
            conn.release();
        });
    })
});

//查询用户的所有的信息
app.post("/showUser",function(req,res){
    pool.getConnection(function(err,conn){
        conn.query("select * from usemessge order by usid",null,function(err,result){
            conn.release();
            if(err||result.length<=0){
                res.send("0");
            }else{
                res.send(result);
            }
            res.end();
        });
    });
});

// 只有这个js文件 因为没有其他文件，所以需要静态资源请求
app.get("/*",function(req,res){
    res.sendFile(__dirname+req.url);
});
app.listen(80,function (err) {
    if(err){
       console.log(err);
    }else{
      console.log("服务器启动成功");
    }
});
