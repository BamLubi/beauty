// miniprogram/db/userInfo_db.js
// 对应云数据库中 userInfo 集合

const Promise = require('../promise/es6-promise.min.js')
const CloudDB = require("../promise/wxCloudDB.js")
const CloudFun = require("../promise/wxCloudFun.js")
const Util = require("../utils/util.js")

// 用户信息模板
const userInfoTemplate = {
	nickName: '',
	avatarUrl: '',
	type: 'user',
    vip_code: Util.makeUUID(1),
    create_time: new Date(),
    update_time: new Date()
}

// 云数据库集合名称
const CollectionName = "user_info";

/**
 * 云数据库下载用户个人信息
 * @param {string} openid 用户openid
 * @return {Promise}
 */
function DownloadUserInfo(openid) {
	return CloudDB.GetWxCloudDB(CollectionName, {
		_openid: openid
	}).then(res => {
		console.log("[userInfoDB] [用户信息]: 云端有信息");
		// 比对云端数据，更新字段
		return AddNewKeyUserInfo(res.data[0]);
	}, res => {
		console.log("[userInfoDB] [用户信息]: 云端无信息");
		return null;
	})
}

function UploadUserInfo(userInfo) {
	// 判断云端是否有数据
	// 获取用户openid
	return CloudFun.CallWxCloudFun("login", {})
		.then(res => DownloadUserInfo(res.openid))
		.then(res => {
			// 确保云端没有数据
			if (res == null) {
				// 制作用户信息
				userInfo = MakeUserInfo(userInfo);
				// 用户信息上传云端
				console.log("[userInfoDB] [用户信息]: 上传用户信息: ", userInfo);
				return CloudDB.AddWxCloudDB(CollectionName, userInfo).then(res => userInfo);
			}
		})
}

/**
 * 制作cloudUerInfo和localUserInfo
 * @param {object} userInfo 用户信息
 * @return {object} 完善后的用户信息
 */
function MakeUserInfo(userInfo) {
	try {
		// 拷贝模板
		let tmpUserInfo = JSON.parse(JSON.stringify(userInfoTemplate));
		// 遍历模板，对不为空和未定义的键值对赋值
		for (let item in userInfoTemplate) {
			if (userInfo[item] != undefined && userInfo[item] != '') {
				tmpUserInfo[item] = userInfo[item];
			}
		}
		return tmpUserInfo;
	} catch (error) {
		console.error(error);
	}
}

/**
 * 根据模板,比对云端没有的字段,并更新
 * @param {objetc} cloudUserInfo 云端的信息
 * @return {Promise}
 */
function AddNewKeyUserInfo(cloudUserInfo) {
	let updateItem = {};
	// 遍历模板，对不为空和未定义的键值对赋值
	for (let item in userInfoTemplate) {
		if (cloudUserInfo[item] == undefined) {
			updateItem[item] = userInfoTemplate[item];
			cloudUserInfo[item] = '';
		}
	}
	// 如果updateItem长度不为0，则更新
	if (Object.keys(updateItem).length == 0) {
		console.log("[userInfoDB] [用户信息]: 无新增字段");
		return cloudUserInfo;
	} else {
		updateItem["updateTime"] = new Date();
		console.log(`[userInfoDB] [用户信息]: 上传字段 ${updateItem}`);
		return CloudDB.UpdateWxCloudDB(CollectionName, cloudUserInfo._id, updateItem, '上传字段').then(res => cloudUserInfo);
	}
}

module.exports = {
	DownloadUserInfo,
	UploadUserInfo
}