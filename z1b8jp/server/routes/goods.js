var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/goods')

//连接MongoDB 数据库
mongoose.connect('mongodb://127.0.0.1:27017/dumall');

mongoose.connection.on("connected",function () {
  console.log("MongoDB connected success.")
});

mongoose.connection.on("error",function () {
  console.log("MongoDB connected fail.")
});

mongoose.connection.on("disconnected",function () {
  console.log("MongoDB connected disconnected.")
});

router.get("/list",function (req,res,next) {
  let sort = req.param("sort");
  let pageSize = parseInt(req.param("pageSize"));
  let page = parseInt( req.param("page"));
  let priceLevel = req.param("priceLevel");
  let skip = (page-1)*pageSize;
  let priceGt ='';
  let priceLte ='';
  let params = {};
  if (priceLevel !='all'){
    switch (priceLevel){
      case '0': priceGt = 0; priceLte = 100; break;
      case '1': priceGt = 100; priceLte = 500; break;
      case '2': priceGt = 500; priceLte = 1000; break;
      case '3': priceGt = 1000; priceLte = 5000; break;
    }
    params = {
      salePrice:{
        $gt:priceGt,
        $lte:priceLte
      }
    }
  }
  let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
  goodsModel.sort({'salePrice':sort});
  goodsModel.exec(function (err,doc) {
    if(err){
      res.json({
        status:'1',
        msg:err.message
      })
    }else {
      res.json({
        status:0,
        msg:'',
        result:{
          count:doc.length,
          list:doc
        }
      });
    }
  });
})

//加入购物车
router.post("/addCart",function (req, res, next) {
  var userId = '100000077',productId = req.body.productId;
  var User = require('../models/user');
  User.findOne({userId:userId},function (err1,userDoc) {
    if(err1){
      res.json({
        status:"1",
        msg:err1.message
      })
    }else {
      console.log("userDoc.cartList======:"+userDoc.cartList);
      let goodsItem = '';
      userDoc.cartList.forEach(function (item) {
        console.log(item.productId)
        if (item.productId == productId){
          item.productNum ++;
          goodsItem = item;
        }
      });
      if (goodsItem){
        userDoc.save(function (err3,doc3) {
          if (err3){
            res.json({
              status:"1",
              msg:err3.message
            })
          }else {
            res.json({
              status:'0',
              msg:'',
              result:"suc"
            })
          }
        })
      }else {
        Goods.findOne({productId:productId},function (err2,doc) {
          if (err2){
            res.json({
              status:"1",
              msg:err2.message
            })
          }else {
            if (doc){
              doc.productNum = 1;
              doc.checked = 1;
              userDoc.cartList.push(doc);
              userDoc.save(function (err3,doc3) {
                if (err3){
                  res.json({
                    status:"1",
                    msg:err3.message
                  })
                }else {
                  res.json({
                    status:'0',
                    msg:'',
                    result:"suc"
                  })
                }
              })
            }
          }
        })
      }
    }
  })

})
module.exports = router
