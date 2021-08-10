// pages/cart/cart.js
const app = getApp()
const API = require("../../promise/wxAPI.js")
const CloudDB = require("../../promise/wxCloudDB.js")
const OrderDB = require("../../db/order_db.js")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isSelectAll: true,
        totalPrice: 0,
        cartList: [],
        isDisabled: true,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 链接购物车内容
        this.setData({
            cartList: app.globalData.cartList,
            isDisabled: app.globalData.cartList.length == 0 ? true : false
        })
        // 计算总价
        this.calcTotalPrice();
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
        // 链接购物车内容
        this.setData({
            cartList: app.globalData.cartList,
            isDisabled: app.globalData.cartList.length == 0 ? true : false
        })
        // 计算总价
        this.calcTotalPrice();
        // 设置角标
        wx.setTabBarBadge({
            index: 2,
            text: '' + this.data.cartList.length,
        })
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
     * 计算商品总价
     */
    calcTotalPrice: function () {
        let totalPrice = 0;
        if (this.data.cartList.length != 0) {
            for (let index in this.data.cartList) {
                if (this.data.cartList[index].select) {
                    totalPrice += (this.data.cartList[index].discount_price * this.data.cartList[index].amount);
                }
            }
        }
        this.setData({
            totalPrice: totalPrice
        })
    },

    /**
     * 选择所有商品
     */
    selectAll: function () {
        let origin_value = this.data.isSelectAll;
        // 遍历所有的商品
        let _cartList = this.data.cartList;
        _cartList.filter(function (x) {
            x.select = !origin_value;
        })
        this.setData({
            cartList: _cartList,
            isSelectAll: !origin_value
        })
        // 计算总价
        this.calcTotalPrice();
    },

    /**
     * 选择单个商品
     */
    selectGood: function (e) {
        let index = e.currentTarget.dataset.index;
        this.setData({
            ["cartList[" + index + "].select"]: !this.data.cartList[index].select
        })
        // 判断全选按钮的选择状态
        let isSelectAll = true;
        for (let index in this.data.cartList) {
            isSelectAll = isSelectAll & this.data.cartList[index].select;
            if (!isSelectAll) break;
        }
        this.setData({
            isSelectAll: isSelectAll
        })
        // 计算总价
        this.calcTotalPrice();
    },

    /**
     * 改变商品数量
     * @param {*} e 
     */
    changeGoodsAmount: function (e) {
        let index = e.currentTarget.dataset.index;
        this.setData({
            ["cartList[" + index + "].amount"]: e.detail
        })
        // 计算总价
        this.calcTotalPrice();
    },

    /**
     * 删除商品
     * @param {*} e 
     */
    deleteGood: function (e) {
        let index = e.currentTarget.dataset.index;
        let _cartList = this.data.cartList;
        _cartList.splice(index, 1);
        // 更新视图
        this.setData({
            cartList: _cartList
        })
        // 如果当前列表为空,则禁用结算
        if (_cartList.length == 0) {
            this.setData({
                isDisabled: true
            })
        }
        // 计算总价
        this.calcTotalPrice();
        // 设置角标
        wx.setTabBarBadge({
            index: 2,
            text: '' + this.data.cartList.length,
        })
    },

    /**
     * 监听滑动单元格关闭
     * @param {*} e 
     */
    swipeCellClose: function (e) {
        const {position,instance} = e.detail;
        instance.close();
    },

    /**
     * 监听滑动单元格打开,并计时收回
     * @param {*} e 
     */
    swipeCellOpen: function(e){
        let that = this;
        let id = e.currentTarget.id;
        setTimeout(() => {
            let component = that.selectComponent("#"+id);
            if(typeof(component.close) == "function"){
                component.close();
            }
        }, 1000);
    },

    submit: function(){
        // 去除未选择的商品
        let cartList = [];
        for (let index in this.data.cartList){
            if(this.data.cartList[index].select){
                cartList.push(this.data.cartList[index]);
            }
        }
        // 跳转结算页面
        let uri = "/pages/settlement/settlement?" + "data=" + JSON.stringify(cartList);
        wx.navigateTo({
          url: uri,
        })
    }
})