// pages/appointList/appointList.js
const app = getApp();
const API = require("../../promise/wxAPI.js")
const CloudDB = require("../../promise/wxCloudDB.js")
const AppointsDB = require("../../db/appoints_db.js")
const Util = require("../../utils/util.js")
let QRCode = require("../../utils/qrCode.js").default;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        appointOrderList: [],// 订单列表
        isLoading: false,// 是否正在加载
		hasMoreOrders: true,// 是否有更多的订单
        isQrcodeModel: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 获取预约信息
        this.setAppointOrderList();
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
     * 设置预约订单列表
     */
    setAppointOrderList: function(){
        let that = this;
		this.setData({
			isLoading: true
		})
		// 获取商品信息
		wx.showLoading({
			title: '加载中',
        })
        let limit = 5;
        AppointsDB.GetAppointOrder(app.globalData.openid, this.data.appointOrderList.length, limit).then(res=>{
            // 对时间+8h处理，并转换为string
            res.filter(function(x){
                x.appoint_date = Util.formatTime(x.appoint_date);
                x.create_time = Util.formatTime(x.create_time);
                x.update_time = Util.formatTime(x.update_time);
            })
            that.setData({
                appointOrderList: that.data.appointOrderList.concat(res)
            })
            if (res.length < limit) {
                that.setData({
                    hasMoreOrders: false
                })
            }
            that.setData({
				isLoading: false
			})
            // 隐藏loading
            wx.hideLoading();
        })
    },

    /**
	 * 上拉加载更多
	 */
	scrollToLower: function () {
		// 如果无数据了就不要再发请求了
		if (!this.data.hasMoreOrders) return;
		// 节流
		if (!this.data.isLoading) {
			this.setAppointOrderList();
		}
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
    showQrcodeModel: function (e) {
        let status = e.currentTarget.dataset.status;
        if (status == "已完成"){
            return API.ShowModal('',"订单已完成，无需核销!", false)
        }
        // 准备信息
        let data = JSON.stringify({
            UUID: e.currentTarget.dataset.uuid
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
     * 支付
     * @param {*} e 
     */
    pay: function (e) {
        let status = e.currentTarget.dataset.status;
        if (status != "待支付"){
            return API.ShowModal('',"已支付，请勿重复支付!", false);
        }
        // 准备信息
        let data = JSON.stringify({
            UUID: e.currentTarget.dataset.uuid
        })
        // TODO: 支付,支付成功后状态变为待核销.
    },

    /**
     * 取消订单
     */
    cancel: function(e){
        let that = this;
        let appoint = e.currentTarget.dataset.appoint;
        let uuid = appoint.uuid;
        let status = appoint.status;
        // 如果已经完成则不可取消
        if (status == "已完成"){
            return API.ShowModal('',"预约已完成,不可取消!", false);
        } else if(status == '待核销'){
            return API.ShowModal('',"预约待核销,不可取消!", false);
        }
        // 删除信息
        let content = `预约时间: ${appoint.appoint_date}  预约项目: ${appoint.appoint.title}`;
        API.ShowModal("确认取消信息", content).then(res=>{
            wx.showLoading({
              title: '删除中',
            })
            // 删除订单信息
            CloudDB.DeleteWxCloudDB('appoint_list', {uuid: uuid}, '删除预约订单').then(res=>{
                wx.hideLoading();
                API.ShowToast('删除成功', 'success');
                // 刷新当前页面
                that.setData({
                    appointOrderList: []
                })
                that.setAppointOrderList();
            })
        })
    },

    /**
     * 将UUID拷贝到剪贴板
     * @param {*} e 
     */
    copyToClipboard: function(e){
        var stringForCopy = `订单号:${e.currentTarget.dataset.uuid}`;
        wx.setClipboardData({
            //准备复制的数据
            data: stringForCopy,
            success: function(res) {
                console.log("[剪切板] " + stringForCopy);
                wx.showToast({
                    title: '复制成功',
                });
            }
        });
    }
})