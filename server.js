const express=require('express');
const cors= require('cors');
const bcrypt=require('bcrypt-nodejs');
const knex = require('knex')({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port : 5432,
      user : 'postgres',
      password : 'admin',
      database : 'moneymanager'
    }
  });

const app=express();
app.use(express.json())
app.use(cors());

app.get('/',(req,res) => {
    res.send("This is also working");
    
})

app.post('/signin',(req,res) => {
    let {email,password}=req.body
    knex('login').where({
        email:email
    }).select('hash').then(data => {
        let tmp=data[0].hash;
        bcrypt.compare(password, tmp, function(err, result) {
            if(result)
            {
                knex('users').returning('*').where('email',email)
                .then(data => {
                    res.status(200).json(data[0]);
                })
            }
            else{
                res.status(400).json("Incorrect Password or Email");
            }
        });
    }).catch(err => {
        res.status(400).json("Incorrect Password Or Email");
    })
})

app.post('/register' ,(req,res)=> {
    let {password,email}= req.body;
    knex('users')
    .returning('*')
    .insert(
        {
            email:req.body.email,
            name:req.body.name,
            dob:req.body.dob,
            phno:req.body.phno,
            bank:req.body.bank,
            salary:req.body.salary,
            acc:req.body.acc
        }
    ).then(data => {
        console.log(data);
        console.log(email);
        bcrypt.hash(password, null, null, function(err, hash) {
            knex('login').returning('*').insert({
                email:email,
                hash:hash
            }).then(pswd => {
                console.log(pswd);
            })
        });
        res.status(200).json(data[0]);
    }).catch(err => {
        res.status(400).json("Error Creating User");
    })
})

app.post('/payment' ,(req,res) => {
    knex('expenses').returning('*').insert({
        id:req.body.id,
        amount:Number(req.body.amount),
        category:req.body.category,
        date:req.body.date
    }).then(data => {
        res.status(200).json('Completed');
    }).catch(err => {
        res.status(400).json(err);
    })
    
})

app.post('/trn',(req,res) => {
    var cur=new Date();
    // var exp={
    //     rent:0,
    //     food:0,
    //     bill:0,
    //     clothes:0,
    //     transport:0,
    //     others:0
    // }
    knex('expenses').where('id',req.body.id).then(data =>{
        var exp=[0,0,0,0,0,0];
        data.forEach(trns => {
                var d1= new Date(trns.date);
                if(Number(req.body.month)=== d1.getMonth() && Number(req.body.year)===d1.getFullYear())
                {
                    switch(trns.category)
                    {
                        case "rent":exp[0]+=trns.amount;
                            break;
                        case "food":exp[1]+=trns.amount;
                            break;
                        case 'bill':exp[2]+=trns.amount;
                            break;
                        case 'clothes':exp[3]+=trns.amount;
                            break;
                        case 'transport':exp[4]+=trns.amount;
                            break;
                        case 'others':exp[5]+=trns.amount;
                            break;
                    }
                }
        })
        res.json(exp);
    })
    
})

app.post('/exp-year',(req,res)=>{
    knex('expenses').where('id',req.body.id).then(data => {
        var yearly=[0,0,0,0,0,0,0,0,0,0,0,0]
        data.forEach(trn => {
            var d1= new Date(trn.date);
            if(d1.getFullYear()===Number(req.body.year))
            {
                yearly[d1.getMonth()]+=trn.amount;
            }
    })
    res.json(yearly);
    })
})

app.post('/transactions',(req,res) => {
    let trns=[];
    knex('transactions').returning('*').where('userid',req.body.id).then(data => {
        res.status(200).json(data);
    })
})

app.listen(3000, () => {
    console.log("The app is working");
})