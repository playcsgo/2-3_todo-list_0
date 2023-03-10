const express = require('express')
const app = express()
const port = 3000

const mongoose = require('mongoose')  // 載入mongoose

// 因為環境變數是在開發階段使用的  所以加入這段
// 僅在非正式環境時使用
if (process.env.NODE_ENV !== "production") {
  require('dotenv').config()
}

// added by warnning commnet
mongoose.set('strictQuery', false)


mongoose.connect(process.env.MONGODB_URI, )  //使用ODM (Object Document Mapper)映射工具 連線到mongoDB
// 原本應該是把mongoDB的那個字串直接輸入, 但是因為字串中含有帳號密碼
// 所以使用 "環境變數" 的方式來處理   


const db = mongoose.connection  //把連線內容暫存下來

// 連線失敗跟連線成功的情況告知

//db.on()：在這裡用 on 註冊一個事件監聽器，用來監聽 error 事件有沒有發生，語法的意思是「只要有觸發 error 就印出 error 訊息」。
db.on('error', () => {
  console.log('mongoDB error');
})

//db.once() - 針對「連線成功」的 open 情況，我們也註冊了一個事件監聽器，相對於「錯誤」，連線成功只會發生一次，所以這裡特地使用 once，由於 once 設定的監聽器是一次性的，一旦連線成功，在執行 callback 以後就會解除監聽器。
db.once('open', () => {    //.once 只會做一次. 因為連線只會連一次, 成功後就拿掉
  console.log('mongoDB connected');
})

// 呼叫hbs
const exphbs = require('express-handlebars')
app.engine('hbs', exphbs.engine({ defaultLayout: 'main', extname: '.hbs'}))
app.set('view engine', 'hbs')

// 呼叫 Todo model 準備要來渲染
const Todo = require('./models/todo')  //載入Todo model
app.get('/', (req, res) => {
  Todo.find() // 取出Todo model裡面所有的資料
    .lean()   // 把mongoose的model物件轉換為乾淨的JavsScript資料陣列
    .then(todos => res.render('index', {todos}))  // 將取得的todos傳入 index渲染
    .catch(error => console.error(error))  //  顯示錯誤
})

// 新增一條todo
app.get('/todos/new', (req, res) => {
  return res.render('new') // 顯示views中的new.hbs
})
// CREATE
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true })) //裝了body-parser 才能讓<input>的值存入req.body裡面

app.post('/todos', (req, res) => {
  const name = req.body.name  // 因為INPUT的name="name" 所以輸入的值會在req.body.name裡面
  return Todo.create({ name:name })  //  存入資料庫??
    .then(() => res.redirect('/'))
    .catch(error => console.error(error))
})

// 瀏覽todo item
app.get('/todos/:id', (req, res) => {
  const id = req.params.id
  return Todo.findById(id)
    .lean()
    .then(todo => res.render('detail', { todo }))
    .catch(error => console.error(error))
})

// 修改
// 進到修改頁面
app.get('/todos/:id/edit', (req, res) => {
  const id = req.params.id
  return Todo.findById(id)
    .lean()
    .then(todo => res.render('edit', { todo }))
    .catch(error => console.error(error))
})

// 修改後存入
app.post('/todos/:id/edit', (req, res) => {
  const id = req.params.id
  const newTodo = req.body.name
  return Todo.findById(id)
    .then(todo => {
      todo.name = newTodo
      return todo.save()
      //return Todo.create({ name:newTodo })
    })
    .then(() => res.redirect('/'))
    .catch(error => console.error(error))
})

// 刪除
app.post('/todos/:id/delete', (req, res) => {
  const id = req.params.id
  return Todo.findById(id)
    .then(todo => todo.remove())
    .then(() => res.redirect('/'))
    .catch(err => console.error(err))
})

// 監聽
app.listen(port, () => {
  console.log(`app.js in running on http://localhost:${port}`);
})