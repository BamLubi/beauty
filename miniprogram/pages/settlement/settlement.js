// pages/settlement/settlement.js
const app = getApp()
const API = require("../../promise/wxAPI.js")
const CloudDB = require("../../promise/wxCloudDB.js")
const OrderDB = require("../../db/order_db.js")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        hasAddress: false,
        address: {
            name: "",
            tel: "",
            code: "",
            info: ""
        },
        cartList: [],
        totalPrice: 0,
        totalPriceToString: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        try {
            this.setData({
                cartList: JSON.parse(options.data)
            })
            // 计算总价
            this.calcTotalPrice();
        } catch (error) {
            API.ShowToast('错误', 'error').then(res => {
                console.log("error");
                // 返回上一层页面
                // wx.navigateBack({
                //     delta: 1,
                // })
            })
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
     * 选择收货地址
     */
    selectAddress: function () {
        let that = this;
        wx.chooseAddress({
            success(res) {
                that.setData({
                    ["address.name"]: res.userName,
                    ["address.tel"]: res.telNumber,
                    ["address.code"]: res.postalCode,
                    ["address.info"]: `${res.provinceName}${res.cityName}${res.countyName}${res.detailInfo}`,
                    hasAddress: true
                })
            }
        })
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
            totalPrice: totalPrice,
            totalPriceToString: (totalPrice/100).toFixed(2)
        })
    },

    /**
     * 提交订单
     */
    submit: function () {
        // 判断是否有地址
        if (!this.data.hasAddress) {
            return API.ShowModal('','请先选择收货地址!',false);
        }
        // 制作数据
        let data = new OrderDB.MakeOrder(this.data.cartList, this.data.address, this.data.totalPrice);
        // 提交
        wx.showLoading({
            title: '提交中'
          })
        CloudDB.AddWxCloudDB("order_list", data).then(res=>{
            // 从购物车里删除这几个物品
            for(let i in this.data.cartList){
                for(let j in app.globalData.cartList){
                    if (app.globalData.cartList[j]._id == this.data.cartList[i]._id) {
                        app.globalData.cartList.splice(j,1);
                        break;
                    }
                }
            }
            // TODO: 付钱?
            return wx.hideLoading();
        }).then(res=>{
            return API.ShowToast('提交成功', 'success', 2000);
        }).then(res=>{
            wx.navigateBack({
                delta: 1,
            })
        })
    }
})