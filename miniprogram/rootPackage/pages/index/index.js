// rootPackage/pages/index/index.js
const API = require("../../../promise/wxAPI.js")
const CloudDB = require("../../../promise/wxCloudDB.js")
const CloudFun = require("../../../promise/wxCloudFun.js")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        TabCur: 2,
        scrollLeft: 0,
        TabCurText: ["核销", "预约订单", "购物订单", "导出", "设置"],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    /**
     * 导航栏切换
     */
    tabSelect(e) {
        this.setData({
            TabCur: e.currentTarget.dataset.id,
            scrollLeft: (e.currentTarget.dataset.id - 1) * 60
        })
    },

    /**
     * 核销信息
     * @param {*} e 
     */
    verify: function(e){
        let type = e.currentTarget.dataset.type;
        // 设置参数
        let data = {
            "collectionName": null,
            "uuid": null,
            "status": null,
            "statusCode": null
        };
        let typeString = "";
        if (type == "appoint-pay") {
            // 预约支付核销
            data.collectionName = "appoint_list";
            data.status = "待核销";
            data.statusCode = 1;
            typeString = "预约订单";
        } else if (type == "appoint-com") {
            // 预约完成核销
            data.collectionName = "appoint_list";
            data.status = "已完成";
            data.statusCode = 2;
            typeString = "预约订单";
        } else if (type == "order-pay") {
            // 订单支付核销
            data.collectionName = "order_list";
            data.status = "待收货";
            data.statusCode = 1;
            typeString = "购物订单";
        } else if (type == "order-com") {
            // 订单到货核销
            data.collectionName = "order_list";
            data.status = "已完成";
            data.statusCode = 2;
            typeString = "购物订单";
        }
        // 扫码获取UUID
        API.ScanCode().then(res=>{
            data.uuid = res.UUID;
            // 判断是否有UUID
            if (data.uuid == undefined || data.uuid == ''){
                API.ShowToast("二维码错误",'error');
                throw new Error("UUID为空");
            }
            return API.ShowModal("确认核销", `${typeString}:${data.uuid}`);
        }).then(res=>{
            // 显示loading
            wx.showLoading({
                title: '核销中'
            })
            return CloudFun.CallWxCloudFun('verifyOrder', data);
        })
        .then(res=>{
            wx.hideLoading()
            if (res.stats.updated == 0){
                API.ShowToast("订单错误",'error');
                throw new Error("数据库无此订单，查看是否扫错码");
            }else{
                API.ShowToast("核销成功",'success');
            }
        }).catch(err=>{
            console.error(err);
        })
    }
})