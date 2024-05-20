const mongoose = require('mongoose');

// 链接 mongoose 数据库
mongoose.connect('mongodb://localhost:27017/test')
    .then(() => {
        console.log('Connected to MongoDB...');
    })
    .catch(err => console.error('Could not connect to MongoDB...', err));

const userinfoSchema = new mongoose.Schema({
    openid: {
        type: String,
        required: true
    },
    name: String,
    eid: String,
    wechat: String,
    role: Boolean,
    photo: String,
    year: String, // 添加学年/职称字段
    major: String, // 添加专业/科研方向字段
    otherInfo: { // 添加其他信息字段
        text: String,
        image: String
    }
});

const Userinfo = mongoose.model('Userinfo', userinfoSchema);

module.exports = Userinfo;
