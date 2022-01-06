//get all users
app.get("/users", async (req: any, res: any) => {
  try {
    const allUsers = await myPool.query("SELECT * FROM users")
    res.json(allUsers.rows)
  } catch (error) {
    console.log(error.message)
  }
})

//get one user
app.get("/users/:id", async (req: any, res: any) => {
  const { id } = req.params

  try {
    const myuser = await myPool.query(`SELECT * FROM users WHERE user_id = ${id}`)
    res.json(myuser.rows)
  } catch (error) {
    console.log(error.message)
  }
})

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

//update a user email
app.put("/user/email/:id", async (req: any, res: any) => {
  const user = req.params.id
  const email = req.body.email
  console.log(user, email)
  try {
    const updatedUser = await myPool.query(`UPDATE users SET user_email = '${email}' WHERE user_id = ${user}`)
    res.json("User Data - email, was updated")
  } catch (error) {
    console.log(error.message)
  }
})

//update a user  name
app.put("/user/name/:id", async (req: any, res: any) => {
  const user = req.params.id
  const name = req.body.name
  try {
    const updatedUser = await myPool.query(`UPDATE users SET user_name = '${name}' WHERE user_id = ${user}`)
    res.json("User Data - name, was updated")
  } catch (error) {
    console.log(error.message)
  }
})
//delete a user
//update a user  name
app.delete("/users/:id", async (req: any, res: any) => {
  const { id } = req.params

  try {
    const updatedUser = await myPool.query(`DELETE FROM users WHERE user_id = ${id}`)
    res.json("User was Deleted")
  } catch (error) {
    console.log(error.message)
  }
})
