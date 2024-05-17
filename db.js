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
    },
    name: String,
    eid: String,
    wechat: String,
    role: Boolean,
});



const Userinfo = mongoose.model('Userinfo', userinfoSchema);

//Test to create a new user
/** 
Userinfo.create({
    openid: '123',
    name: 'rkan',
    eid: 'asd123',
    wechat: 'rkasdfaan',
    role: true
})
*/

module.exports = Userinfo;
