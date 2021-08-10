// miniprogram/db/order_db.js
// 对应云数据库中 order_db 集合

const Promise = require('../promise/es6-promise.min.js')
const CloudDB = require("../promise/wxCloudDB.js")
const CloudFun = require("../promise/wxCloudFun.js")
const Util = require("../utils/util.js")
const db = wx.cloud.database()
const _ = db.command

/**
 * 制作商品订单
 * 订单若取消则直接删除
 * @param {*} goods
 * @param {String} status 待支付、待发货、已完成
 */
function MakeOrder(goods, address, price, status = "待支付") {
    this.uuid = Util.makeUUID(0);
    this.goods_list = JSON.parse(JSON.stringify(goods));
    this.goods_list.filter(function(x){
        delete x.images;
        delete x.select;
    });
    this.address = address;
    this.price = price;
    this.status = status;
    if (this.status == "待支付") {
        this.status_code = 0;// 可以发货、支付
    } else if (this.status == "待收货") {
        this.status_code = 1;// 可以核销
    } else if (this.status == "已完成") {
        this.status_code = 2;// 都不可以
    }
    this.courier_number = "";
    this.create_time = new Date();
    this.update_time = new Date();
}

/**
 * 获取订单信息
 * @param {*} openid 
 */
function GetOrder(openid, skip=0, limit=10) {
    return new Promise(function (resolve, reject) {
        db.collection("order_list")
            .where({
                _openid: openid
            })
            .skip(skip)
            .limit(limit)
            .orderBy("status_code", "asc")
            .orderBy("create_time", "desc")
            .get({
                success: res => {
                    console.log('[云数据库] [GET] [订单信息] success: ', res.data)
                    resolve(res.data);
                },
                fail: err => {
                    console.error('[云数据库] [GET] [订单信息] fail: ', err)
                    reject(err);
                }
            })
    });
}

module.exports = {
    MakeOrder,
    GetOrder
}