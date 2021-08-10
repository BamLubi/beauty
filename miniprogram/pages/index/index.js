// pages/index/index.js
const API = require("../../promise/wxAPI.js")
const CloudDB = require("../../promise/wxCloudDB.js")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        dict: [],
        naviagteList: [{
            id: 0,
            name: '线上预约',
            src: '/img/me/appoint.png',
            path: '/pages/appoint/appoint',
            type: 'page'
        },{
            id: 1,
            name: '在线商城',
            src: '/img/app/shopfill.png',
            path: '/pages/shop/shop',
            type: 'tabbar'
        }]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;
        // 云端获取dict
        CloudDB.GetWxCloudDB("sys_dict", {
            _name: "index"
        }).then(res => {
            that.setData({
                dict: res.data[0]
            })
        })
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
     * 跳转页面
     */
    navigatePage: function(e){
        if (e.currentTarget.dataset.path != '') {
            if(e.currentTarget.dataset.type == 'page'){
                wx.navigateTo({
                    url: e.currentTarget.dataset.path,
                })
            }else {
                wx.switchTab({
                  url: e.currentTarget.dataset.path,
                })
            }
        } else {
            API.ShowToast('正在施工中...', 'none', 2000)
        }
    }
})