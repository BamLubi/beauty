// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
    let data = {
        "status": null,
        "statusCode": null
    };
    return db.collection(event.collectionName)
        .where({
            "uuid": event.uuid
        })
        .update({
            data: {
                "status": event.status,
                "status_code": event.statusCode,
                "update_time": new Date()
            },
            success: res => { },
            fail: err => { }
        })
}