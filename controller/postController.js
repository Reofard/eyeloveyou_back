const router = require('express').Router();
const conn = require('../config/mysql') 
const db = conn.init() 
conn.open(db)

const passportConfig = { usernameField: 'userId', passwordField: 'password' };

router.post('/', (req, res) => {
    
    console.log(req.body);
    res.send('This is post page');
});

router.post('/login', (req, res) => {
    // user_id, user_pw 변수로 선언
    const user_id = req.body.user_id
    const password = req.body.password
    // 입력된 id 와 동일한 id 가 mysql 에 있는 지 확인
    const sql1 = `SELECT COUNT(*) AS result FROM user WHERE user_id = '${user_id}'`
    db.query(sql1, (err, data) => {
        if(!err) {
            // 결과값이 1보다 작다면(동일한 id 가 없다면)
            if(data[0].result < 1) {
                res.send({ 'msg': '입력하신 id 가 일치하지 않습니다.'})
            } else { // 동일한 id 가 있으면 비밀번호 일치 확인
                const sql2 = `SELECT 
                CASE (SELECT COUNT(*) FROM user WHERE user_id = '${user_id}' AND password = '${password}')
                WHEN '0' THEN NULL
                ELSE (SELECT user_id FROM user WHERE user_id = '${user_id}' AND password = '${password}')
                END AS userId
                , CASE (SELECT COUNT(*) FROM user WHERE user_id = '${user_id}' AND password = '${password}')
                WHEN '0' THEN NULL
                ELSE (SELECT password FROM user WHERE user_id = '${user_id}' AND password = '${password}')
                END AS userPw`;
                db.query(sql2, (err, data) => {
                    console.log(data[0]);
                    if(!err) {
                        if(data[0].userId==undefined){
                            res.send({ 'msg': '입력하신 id 가 일치하지 않습니다.'})
                        }
                        else {
                            res.send(data[0])
                        }
                    } else {
                        res.send(err)
                    }
                })
            }
        } else {
            res.send(err)
        }
    })
});

router.get('/sent',(req, res)=> {
    console.log(req.query.user_id)
    const user_id = req.query.user_id
    if(user_id==undefined){
        res.send({ 'msg':  '리퀘스트좀 제대로 날려라'})
    }
    const sql1 = `SELECT * FROM mailbox WHERE sender = '${user_id}';`
    db.query(sql1, (err, data) => {
        if(!err) {
        
            res.send(data)
        } 
        else {
            res.send(err)
        }
    })
});
router.get('/inbox',(req, res)=> {

    console.log(req.query.user_id)
    const user_id = req.query.user_id
    if(user_id==undefined){
        res.send({ 'msg':  '리퀘스트좀 제대로 날려라'})
    }
    const sql1 = `SELECT * FROM mailbox WHERE reciever = '${user_id}';`
    db.query(sql1, (err, data) => {
        if(!err) {
        
            res.send(data)
        } 
        else {
            res.send(err)
        }
    })
});

module.exports = router;