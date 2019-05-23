const http=require('http')
const express= require('express')
const app=express()

const PORT = process.env.PORT || 3000;

app.get('/',function(req,res) {	
	res.end('Hello World')
})

//app.post('/',function(req,res){
//    res.send('post request to homepage')
//})
//app.get('/players/',function(req,res) {
//	res.send('players !')
//})
//Route Path : /users/:userId/books/:bookId
//Request Url : http://localhost:3000/users/34/books/7544
//req.params: {"userId": "34", "bookId": "7544"}
//app.get('/users/:userId/books/:bookId',function(req,res,next) {
//    console.log(('response send in next func')
//                next()
//},function(req,res){
//    res.send(req.params);
//})

app.listen(PORT,function() {
	console.log(`Example app listening on port ${PORT}!`);
})
