// miniprogram/db/appoints_db.js
// 对应云数据库中 appoints 和 appoint_list 集合

const Promise = require('../promise/es6-promise.min.js')
const CloudDB = require("../promise/wxCloudDB.js")
const CloudFun = require("../promise/wxCloudFun.js")
const Util = require("../utils/util.js")
const db = wx.cloud.database()
const _ = db.command


const appointsTemplate = {
    title: '',
    info: '',
    type: '',
    price: 9900,
    is_sale: true,
    detail: []
};

const appointOrderTemplate = {
    uuid: null,
    openid: null,
    appointDate: null,
    userInfo: null,
    appoint: null
};

const CollectionName = "appoints";

/**
 * 获取所有的预约服务信息
 * @param {*} type 
 */
function GetAllAppoints(type) {
    return new Promise(function (resolve, reject) {
        GetAppointsList([]).then(res => {
            let ans = {};
            type.filter(function (x) {
                ans[x] = [];
            })
            res.filter(function (x) {
                ans[x.type].push(x);
            })
            // 根据type整理数据成json格式
            console.log("[预约服务信息] [整理] success: ", ans);
            resolve(ans);
        }).catch(err => {
            console.log("[预约服务信息] [整理] fail: ", ans);
            reject(err);
        })
    })
}

/**
 * 获取商品列表
 * @param {*} skip 跳过数量
 * @param {*} limit 限制
 */
function GetAppointsList(list) {
    return new Promise(function (resolve, reject) {
        let limit = 20;
        db.collection(CollectionName)
            .where({
                is_sale: true
            })
            .field({
                _id: true,
                title: true,
                type: true,
                price: true,
                is_sale: true,
            })
            .skip(list.length)
            .limit(limit)
            .get({
                success: res => {
                    console.log('[云数据库] [GET] [商品信息] success: ', res.data)
                    // 追加进数组
                    for (let i = 0; i < res.data.length; i++) {
                        list.push(res.data[i])
                    }
                    // 判断是否结束
                    if (res.data.length < limit) {
                        resolve(list)
                    } else {
                        return GetAppointsList(list).then(res => {
                            resolve(list)
                        })
                    }
                },
                fail: err => {
                    console.error('[云数据库] [GET] [商品信息] fail: ', err)
                    reject(err)
                }
            })
    });
}

/**
 * 获取预约服务的内容
 * @param {*} id 服务id
 */
function GetAppointInfo(id) {
    return new Promise(function (resolve, reject) {
        db.collection(CollectionName)
            .where({
                _id: id
            })
            .get({
                success: res => {
                    console.log('[云数据库] [GET] [预约服务信息] success: ', res.data[0])
                    resolve(res.data[0])
                },
                fail: err => {
                    console.error('[云数据库] [GET] [预约服务信息] fail: ', err)
                    reject(err)
                }
            })
    });
}

/**
 * 制作预约服务订单
 * 订单若取消则直接删除
 * @param {Date} date 
 * @param {Array} appoint 
 * @param {String} status 待支付、待核销、已完成
 */
function MakeAppointOrder(date, appoint, status = "待支付") {
    this.uuid = Util.makeUUID(0);
    this.appoint_date = date;
    this.appoint = appoint;
    this.status = status;
    if (this.status == "待支付") {
        this.status_code = 0;// 可以核销、支付
    } else if (this.status == "待核销") {
        this.status_code = 1;// 可以核销
    } else if (this.status == "已完成") {
        this.status_code = 2;// 都不可以
    }
    this.create_time = new Date();
    this.update_time = new Date();
}

/**
 * 获取预约信息
 * @param {*} openid 
 */
function GetAppointOrder(openid, skip=0, limit=10) {
    return new Promise(function (resolve, reject) {
        db.collection("appoint_list")
            .where({
                _openid: openid
            })
            .field({
                _id: true,
                uuid: true,
                ["appoint.title"]: true,
                ["appoint.type"]: true,
                ["appoint.price"]: true,
                appoint_date: true,
                status: true,
                status_code: true,
                create_time: true,
                update_time: true
            })
            .skip(skip)
            .limit(limit)
            .orderBy("status_code", "asc")
            .orderBy("appoint_date", "desc")
            .get({
                success: res => {
                    console.log('[云数据库] [GET] [预约订单信息] success: ', res.data)
                    resolve(res.data);
                },
                fail: err => {
                    console.error('[云数据库] [GET] [预约订单信息] fail: ', err)
                    reject(err);
                }
            })
    });
}

module.exports = {
    GetAllAppoints,
    GetAppointInfo,
    MakeAppointOrder,
    GetAppointOrder
}