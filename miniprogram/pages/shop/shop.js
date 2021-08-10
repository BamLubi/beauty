// pages/shop/shop.js
const app = getApp()
const API = require("../../promise/wxAPI.js")
const CloudDB = require("../../promise/wxCloudDB.js")
const GoodsDB = require("../../db/goods_db.js")
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		dict: [],
		selectType: 0,
		goodsList: [], // 商品列表
		isLoading: false,
		hasMoreGoods: true,
		goodDetail: {}, // 商品详细信息
		goodsAmount: 1,
		isGoodModel: false, // 是否显示商品详细信息
		scrollViewTop: "0px",	// 滚动条
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		let that = this;
		// 云端获取dict
		CloudDB.GetWxCloudDB("sys_dict", {
			_name: "shop"
		}).then(res => {
			that.setData({
				dict: res.data[0]
			})
			// 获取商品列表
			that.setGoodsList(0);
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
		// 获取数据

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
	 * 设置商品列表
	 * @param {*} key 商品索引
	 * @param {*} skip 
	 * @param {*} limit 每次获取的长度,测试阶段为6,生产环境为10
	 */
	setGoodsList: function(key, skip=0, limit=6){
		let that = this;
		this.setData({
			isLoading: true
		})
		// 准备查询信息
		let type = [];
		if (key == 0) {
			type = this.data.dict.type_list;
		} else {
			type.push(this.data.dict.type_list[key]);
		}
		// 获取商品信息
		wx.showLoading({
			title: '加载中',
		})
		GoodsDB.GetGoodsList(type, skip, limit).then(res => {
			// 更新视图
			that.setData({
				goodsList: that.data.goodsList.concat(res)
			})
			if (res.length < limit) {
				that.setData({
					hasMoreGoods: false
				})
			}
			that.setData({
				isLoading: false
			})
			wx.hideLoading();
		})
	},

	/**
	 * 选择类型
	 * @param {*} e e.detail是当前的索引
	 */
	changeType: function (e) {
		if (e.detail == this.data.selectType){
			return;
		}
		this.data.selectType = e.detail;
		// 重置数组
		this.setData({
			goodsList: [],
			hasMoreGoods: true
		})
		// 获取商品信息
		this.setGoodsList(e.detail);
	},

	/**
	 * 上拉加载更多
	 */
	scrollToLower: function () {
		// 如果无数据了就不要再发请求了
		if (!this.data.hasMoreGoods) return;
		// 节流
		if (!this.data.isLoading) {
			this.setGoodsList(this.data.selectType, this.data.goodsList.length);
		}
	},

	/**
	 * 加入购物车
	 * @param {*} e 
	 */
	addToCartList: function (e) {
		let id = e.currentTarget.dataset.id;
		let amount = e.currentTarget.dataset.amount ? e.currentTarget.dataset.amount : 1;
		// 根据 _id 筛选出该商品全部数据
		let good = this.data.goodsList.filter(function(x){
			return x._id == id;
		})
		if (good.length == 0){
			return API.ShowToast("发现未知错误", 1000);
		}
		// 在购物车里查看是否已经添加
		let isAddToCartList = app.globalData.cartList.filter(function(x){
			return x._id == id;
		}).length == 0 ? false : true;
		// 如果已经添加,则直接追加数字
		if (isAddToCartList){
			app.globalData.cartList.filter(function(x){
				if (x._id == id){
					x.amount += amount;
				}
			})
		}else{
			// 准备数据
			let cartItem = {
				_id: id,
				title: good[0].title,
				info: good[0].info,
				discount_price: good[0].discount_price,
				images: good[0].images,
				amount: amount,
				select: true
			}
			app.globalData.cartList.push(cartItem);
			// 设置角标
			wx.setTabBarBadge({
				index: 2,
				text: '' + app.globalData.cartList.length,
			})
		}
		API.ShowToast("加入购物车成功", "success", 500);
	},

	/**
	 * 关闭商品详情窗口
	 */
	closeGoodModel: function () {
		this.setData({
			isGoodModel: false,
			goodsAmount: 1,
			scrollViewTop: "0px"
		})
	},

	/**
	 * 显示商品详情窗口
	 */
	showGoodModel: function (e) {
		let that = this
		let id = e.currentTarget.dataset.id;
		
		// 获取商品的详细信息
		if (that.data.goodDetail == null || that.data.goodDetail._id != id) {
			wx.showLoading({
				title: '加载中',
			})
			// 原数组置空
			that.setData({
				goodDetail: {}
			})
			GoodsDB.GetGoodInfo(id).then(res => {
				wx.hideLoading();
				that.setData({
					goodDetail: res,
					isGoodModel: true
				})
			})
		}else{
			// 选择同样的商品，直接显示
			this.setData({
				isGoodModel: true
			})
		}
	},

	/**
	 * 改变商品数量
	 * @param {*} e 
	 */
	changeGoodsAmount: function(e){
		this.setData({
			goodsAmount: e.detail
		})
	}
})