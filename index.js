const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const querystring = require('querystring');
const multer = require('multer');
const fs = require('fs');
const Userinfo = require('./db'); // 从 ./db 导入 Userinfo 模型

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
  res.send('Hello World Express!');
});

app.get('/getopenid', (req, res) => {
  console.log(req.query.code);
  var data = {
    appid: 'wx727c90bddef1bfc3', // 你的微信小程序appid
    secret: 'eb166d0eecc4dd0472a1789118ce6a5a', // 你的微信小程序secret密钥
    js_code: req.query.code,
    grant_type: 'authorization_code'
  };
  
  console.log(data);
  
  var content = querystring.stringify(data);
  var url = 'https://api.weixin.qq.com/sns/jscode2session?' + content;
  
  request.get({ url: url }, (error, response, body) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error occurred while fetching openid');
      return;
    }
  
    let result = JSON.parse(body);
    result.code = req.query.code;
    console.log(result);
  
    // 发送JSON格式数据
    res.json(result);
  });
});

app.post('/checkuser', async (req, res) => {
  const { openid } = req.body;
  try {
    const user = await Userinfo.findOne({ openid: openid }).exec();
    if (user) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    console.error('Error checking user in MongoDB', err);
    res.status(500).send('Error occurred while checking user');
  }
});

app.post('/upload', upload.single('photo'), async (req, res) => {
  const { name, eid, year, major, wechat, role, openid } = req.body;
  const photo = req.file;

  // 处理上传的文件和其他信息
  const targetPath = `uploads/${photo.originalname}`;
  fs.renameSync(photo.path, targetPath);

  const newUser = new Userinfo({
    openid,
    name,
    eid,
    wechat,
    role: role === 'teacher', // 假设 'teacher' 表示老师
    photo: targetPath // 保存照片路径到数据库
  });

  try {
    await newUser.save();
    console.log('New user saved to MongoDB');
    res.send({ status: 'success', message: '信息提交成功' });
  } catch (err) {
    console.error('Error saving new user to MongoDB', err);
    res.status(500).send('Error occurred while saving new user to MongoDB');
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
