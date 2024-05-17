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
    photo: String // 添加照片路径字段
});

const Userinfo = mongoose.model('Userinfo', userinfoSchema);

module.exports = Userinfo;
