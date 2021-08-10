// miniprogram/db/goods_db.js
// 对应云数据库中 userInfo 集合

const Promise = require('../promise/es6-promise.min.js')
const CloudDB = require("../promise/wxCloudDB.js")
const CloudFun = require("../promise/wxCloudFun.js")
const Util = require("../utils/util.js")
const db = wx.cloud.database()
const _ = db.command


const goodsTemplate = {
    title: '',
    info: '',
    type: '',
    tags: [],
    origin_price: 10000,
    discount_price: 10000,
    inventory: 999,
    is_sale: true,
    images: [],
    detail: []
}

const CollectionName = "goods";

/**
 * 获取商品列表
 * @param {*} type 类型
 * @param {*} skip 跳过数量
 * @param {*} limit 限制
 */
function GetGoodsList(type, skip = 0, limit = 10) {
    return new Promise(function (resolve, reject) {
        db.collection(CollectionName)
            .where({
                type: _.in(type),
                is_sale: true
            })
            .field({
                _id: true,
                title: true,
                info: true,
                type: true,
                discount_price: true,
                is_sale: true,
                images: true
            })
            .skip(skip)
            .limit(limit)
            .get({
                success: res => {
                    for (let i = 0; i < res.data.length; i++) {
                        // TODO：添加默认图片
                        res.data[i].images = res.data[i].images[0]
                    }
                    console.log('[云数据库] [GET] [商品信息] success: ', res.data)
                    resolve(res.data)
                },
                fail: err => {
                    console.error('[云数据库] [GET] [商品信息] fail: ', err)
                    reject(err)
                }
            })
    });
}

/**
 * 获取商品的内容
 * @param {*} id 商品id
 */
function GetGoodInfo(id) {
    return new Promise(function (resolve, reject) {
        db.collection(CollectionName)
            .where({
                _id: id
            })
            .get({
                success: res => {
                    console.log('[云数据库] [GET] [商品信息] success: ', res.data[0])
                    resolve(res.data[0])
                },
                fail: err => {
                    console.error('[云数据库] [GET] [商品信息] fail: ', err)
                    reject(err)
                }
            })
    });
}

module.exports = {
    GetGoodsList,
    GetGoodInfo
}