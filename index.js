const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const request = require('request');
const querystring = require('querystring');
const { Userinfo } = require('./db');

const port = 3000;
app.use(bodyParser.urlencoded({ extended: false }));

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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
    