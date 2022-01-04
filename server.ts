const express = require("express")
const app = express()
const myPool = require("./src/db")

app.use(express.json())

//routes//

//get all users

//get one user

//create a user
app.post("/user", async (req: any, res: any) => {
  try {
    const { name, email } = req.body
    const newUser = await myPool.query(`INSERT INTO users (user_name, user_email, date) VALUES ('{${name}}', '{${email}}', CURRENT_DATE) RETURNING *`)

    res.json(newUser.rows[0])
  } catch (error) {
    console.log(error.message)
  }
})

//update a user

//delete a user

app.listen(5000, () => {
  console.log("server is listening on port 5000")
})
