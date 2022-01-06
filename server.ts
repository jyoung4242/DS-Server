require("dotenv").config()
const express = require("express")
const app = express()
const myPool = require("./src/db")
const wss = require("ws")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

app.use(express.json())

//API routes
//USER LOGIN

app.post("/user/login", async (req: any, res: any) => {
  //check if user exists in db
  const userHandle = req.body.handle
  let user
  try {
    const newUser = await myPool.query(`SELECT * FROM users WHERE user_handle='${userHandle}'`)
    user = newUser.rows[0]
    if (user == null) {
      return res.status(400).send("Cannot find user")
    }
  } catch (error) {
    res.status(500).send("NO USER")
  }

  try {
    if (await bcrypt.compare(req.body.password, user.user_password)) {
      const username = req.body.user_name
      const userID = req.body.user_ID
      user = { name: username, id: userID, handle: userHandle }
      const accessToken = generateAccessToken(user)
      const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
      pushToken(refreshToken)
      res.json({ accessToken: accessToken, refreshToken: refreshToken })
    } else {
      res.send("Not Allowed")
    }
  } catch {
    res.status(500).send("PASSWORD ISSUE")
  }
})
//USER CREATE ACCOUNT

app.post("/newuser", async (req: any, res: any) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user = { name: req.body.name, password: hashedPassword, handle: req.body.handle, email: req.body.email }
    const newUser = await myPool.query(`INSERT INTO users (user_name, user_email, user_handle, user_password, date) VALUES ('${user.name}', '${user.email}','${user.handle}','${user.password}', CURRENT_DATE) RETURNING *`)
    res.json(newUser.rows[0])
  } catch (error) {
    res.status(400)
  }
})
//USER LOGOUT

app.delete("/logout/", async (req: any, res: any) => {
  try {
    const tokenStatus = await myPool.query(`DELETE FROM tokens WHERE tokens=('${req.body.token}')`)
    res.status(200).send(`${tokenStatus.rowCount} tokens deleted`)
  } catch (error) {
    res.status(400).send("ERROR LOGGING OUT")
  }
})

//ACTUAL API ENDPOINTS - with GameData Tables
//USER CREATE GAME
//app.post()
//USER JOIN GAME
//app.post()

//UTILITY FUNCTIONS
function generateAccessToken(user: object) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30s" })
}

async function pushToken(token: string) {
  const tokenStatus = await myPool.query(`INSERT INTO tokens (tokens) VALUES ( '${token}')`)
  console.log(tokenStatus)
  return tokenStatus.rows[0]
}

//websocket server code

const wsServer = new wss.Server({ noServer: true })

wsServer.on("connection", (socket: any) => {
  console.log("here 83")
  socket.on("message", function message(data: string) {
    console.log("received: %s", data)
  })
})

const server = app.listen(5000, () => {
  console.log("server is listening on port 5000")
})

server.on("upgrade", (request: any, socket: any, head: any) => {
  console.log("here 94")
  wsServer.handleUpgrade(request, socket, head, (ws: any) => {
    console.log("here 96")
    wsServer.emit("connection", ws, request)
  })
})
