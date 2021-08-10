// pages/appoint/appoint.js
const app = getApp();
const API = require("../../promise/wxAPI.js")
const CloudDB = require("../../promise/wxCloudDB.js")
const AppointsDB = require("../../db/appoints_db.js")
const Util = require("../../utils/util.js")

// 设置时间选择器的时间
let _date = new Date();
_date = "" + _date.getFullYear() + "-" + (_date.getMonth()+1) + "-" + _date.getDate();
_date = new Date(_date).getTime() + 115200000;

Page({
    /**
     * 页面的初始数据
     */
    data: {
        dict: [],
        appointList: {},
        appointDetail: {},
        isAppointModel: false,
        isSelectDate: false, // 是否选择时间
        dateConfig: {
            currentDate: _date,
            minDate: _date
        },
        formatter(type, value){
            switch(type){
                case "year":
                    return `${value}年`;
                case "month":
                    return `${value}月`;
                case "day":
                    return `${value}日`;
                case "hour":
                    return `${value}时`;
                case "minute":
                    return `${value}分`;
                default:
                    return value;
            }
        },
        filter(type, options) {
            // 每隔10分钟
            if (type === 'minute') {
              return options.filter((option) => option % 10 === 0);
            }
            // 9-20时
            if (type === 'hour') {
                return options.filter((option) => (option >= 8 && option <= 20));
            }
            return options;
          },
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;
        wx.showLoading({
          title: '加载中',
        })
        // 云端获取dict
        CloudDB.GetWxCloudDB("sys_dict", {
            _name: "appoint"
        }).then(res => {
            that.setData({
                dict: res.data[0]
            })
            // 获取预约服务信息
            AppointsDB.GetAllAppoints(this.data.dict.appoint_type).then(res=>{
                wx.hideLoading();
                that.setData({
                    appointList: res
                })
            });
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
     * 关闭预约信息
     */
    closeAppointModel: function(){
        this.setData({
            isAppointModel: false
        })
    },

    /**
     * 打开预约信息
     */
    showAppointModel: function(e){
        let that = this
        let id = e.currentTarget.dataset.id;
		
		// 获取预约服务的详细信息
		if (that.data.appointDetail == null || that.data.appointDetail._id != id) {
			wx.showLoading({
				title: '加载中',
			})
			// 原数组置空
			that.setData({
				appointDetail: {}
			})
			AppointsDB.GetAppointInfo(id).then(res => {
				wx.hideLoading();
				that.setData({
					appointDetail: res,
					isAppointModel: true
				})
			})
		}else{
			// 选择同样的预约服务，直接显示
			this.setData({
				isAppointModel: true
			})
		}
    },

    /**
     * 预约
     */
    appoint: function(e){
        let that = this;
        let selectDate = new Date(e.detail);
        let appoint = JSON.parse(JSON.stringify(this.data.appointDetail));
        // 关闭时间选择框
        this.closeDateModel();
        // 显示确认信息
        let content = `请您确认预约时间: ${Util.formatTime(selectDate)}  预约项目: ${appoint.title}`;
        API.ShowModal("", content).then(res=>{
            // 显示加载框
            wx.showLoading({
              title: '预约中'
            })
            // 关闭预约服务信息
            that.closeAppointModel();
            // 准备信息
            let data = new AppointsDB.MakeAppointOrder(selectDate, appoint);
            // TODO: 是否需要交钱
            return CloudDB.AddWxCloudDB("appoint_list", data);
        }).then(res=>{
            // 预约成功
            wx.hideLoading();
            API.ShowToast("预约成功",'success');
        })
    },

    /**
     * 关闭时间选择模态框
     */
    closeDateModel: function(){
        this.setData({
            isSelectDate: false
        })
    },

    /**
     * 显示时间选择模态框
     */
    showDateModel: function(){
        this.setData({
            isSelectDate: true
        })
    }
})