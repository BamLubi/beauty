// pages/me/me.js
const app = getApp()
let QRCode = require("../../utils/qrCode.js").default;
const API = require("../../promise/wxAPI.js")
const UserInfoDB = require("../../db/userInfo_db.js")

Page({

    /**
     * 页面的初始数据
     */
    data: {
        hasUserInfo: false,
        userInfo: null,
        isQrcodeModel: false, // 是否显示会员码模态框
        toolList: [{
            id: 0,
            name: '我的预约',
            src: '/img/me/appoint.png',
            path: '/pages/appointList/appointList',
            type: 'page'
        }, {
            id: 1,
            name: '我的订单',
            src: '/img/me/order.png',
            path: '/pages/orderList/orderList',
            type: 'page'
        }, {
            id: 2,
            name: '个人资料',
            src: '/img/me/profile.png',
            path: '',
            type: 'page'
        }, {
            id: 3,
            name: '客服',
            src: '/img/me/service.png',
            path: '',
            type: 'page'
        }]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 判断获取个人信息
        if (app.globalData.hasUserInfo == true) {
            this.setData({
                userInfo: app.globalData.userInfo,
                openid: app.globalData.openid,
                hasUserInfo: true,
            })
        } else if (app.globalData.hasUserInfo == null) {
            // 异步操作
            app.userInfoReadyCallback = res => {
                this.setData({
                    userInfo: app.globalData.userInfo,
                    openid: app.globalData.openid,
                    hasUserInfo: true,
                })
            }
        }
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
     * 获取用户个人信息
     */
    getUserInfo: function () {
        let that = this;
        // 显示loading
        wx.showLoading({
            title: '获取中'
        })
        API.GetUserProfile().then(res => UserInfoDB.UploadUserInfo(res)).then(res => {
            app.globalData.userInfo = JSON.parse(JSON.stringify(res));
            app.globalData.hasUserInfo = true;
            // 回调广播函数
            if (app.userInfoReadyCallback) {
                app.userInfoReadyCallback();
            }
            // 显示成功样式
            wx.hideLoading();
            API.ShowToast('获取成功', 'success');
            // 刷新当前页面
            that.onLoad();
        })
    },

    /**
     * 隐藏会员码
     */
    hideQrcodeModel: function () {
        this.QR.clear();
        this.setData({
            isQrcodeModel: false
        })
    },

    /**
     * 显示会员码
     */
    showQrcodeModel: function () {
        if(!this.data.hasUserInfo){
            return API.ShowToast('请先登录', 'none', 2000);
        }
        // 准备信息
        let data = JSON.stringify({
            vipCode: this.data.userInfo.vip_code
        })
        // 生成二维码
        let qrcode = new QRCode('qrcode', {
            text: '',
            width: 250,
            height: 250,
            canvasId: 'qrcode',
            correctLevel: QRCode.correctLevel.H
        });
        //将一个局部变量共享
        this.QR = qrcode;
        this.QR.makeCode(data);
        // 显示
        this.setData({
            isQrcodeModel: true
        })
    },

    /**
     * 跳转页面
     */
    navigatePage: function (e) {
        if (e.currentTarget.dataset.path != '') {
            if (e.currentTarget.dataset.type == 'page') {
                wx.navigateTo({
                    url: e.currentTarget.dataset.path,
                })
            } else {
                wx.switchTab({
                    url: e.currentTarget.dataset.path,
                })
            }
        } else {
            API.ShowToast('正在施工中...', 'none', 2000)
        }
    }
})