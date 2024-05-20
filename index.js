const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const querystring = require('querystring');
const multer = require('multer');
const fs = require('fs');
const Userinfo = require('./db'); // 从 ./db 导入 Userinfo 模型
const config = require('./config'); // 引入配置文件

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const upload = multer({ dest: 'uploads/' });

// 提供静态文件
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('Hello World Express!');
});

app.get('/getopenid', (req, res) => {
  console.log(req.query.code);
  var data = {
    appid: config.appid, // 从配置文件中获取appid
    secret: config.secret, // 从配置文件中获取secret密钥
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

  if (!photo) {
    res.status(400).send('No photo uploaded');
    return;
  }

  // 处理上传的文件和其他信息
  const targetPath = `uploads/${photo.originalname}`;
  fs.rename(photo.path, targetPath, async (err) => {
    if (err) {
      console.error('Error renaming file', err);
      res.status(500).send('Error occurred while processing the photo');
      return;
    }

    const newUser = new Userinfo({
      openid,
      name,
      eid,
      wechat,
      role: role === 'teacher', // 假设 'teacher' 表示老师
      photo: targetPath, // 保存照片路径到数据库
      year,
      major
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
});

app.post('/getuserinfo', async (req, res) => {
  const { openid } = req.body;
  try {
    const user = await Userinfo.findOne({ openid: openid }).exec();
    if (user) {
      res.json({ success: true, user: user });
    } else {
      res.json({ success: false, message: '用户不存在' });
    }
  } catch (err) {
    console.error('Error retrieving user information from MongoDB', err);
    res.status(500).send('Error occurred while retrieving user information');
  }
});

// 新增获取所有学生信息的路由
app.get('/students', async (req, res) => {
  try {
    const students = await Userinfo.find({ role: false }).exec(); // 假设 role 为 false 表示学生
    res.json({ success: true, students: students });
  } catch (err) {
    console.error('Error retrieving students information from MongoDB', err);
    res.status(500).send('Error occurred while retrieving students information');
  }
});

// 新增获取单个学生详细信息的路由
app.get('/student/:id', async (req, res) => {
  try {
    const student = await Userinfo.findById(req.params.id).exec();
    res.json({ success: true, student: student });
  } catch (err) {
    console.error('Error retrieving student information from MongoDB', err);
    res.status(500).send('Error occurred while retrieving student information');
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
