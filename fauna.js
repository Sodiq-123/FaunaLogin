var dotenv = require('dotenv'),
    faunadb = require('faunadb'),
    bcrypt = require('bcrypt'),
    q = faunadb.query,
    Client = new faunadb.Client({ secret: process.env.NODE_LOGIN_FAUNA_KEY });


exports.createUser = async (name, email, username, password) => {
  password = bcrypt.hashSync(password, bcrypt.genSaltSync(10)) // generates a hash for the password
  let data
  try {
    data= await Client.query(   
      q.Create(
        q.Collection('Users'),
        {
          data: {name, email, username, password}
        }
      )
    )
    if (data.name === 'BadRequest') return // if there's an error in the data creation it should return null
  } catch (error) {
    return 
  }
  const user = data.data
  user.id = data.ref.value.id // attaches the ref id as the user id in the client, it will be easy to fetch and you can guarantee that it's unique
  return user
}

exports.getUser = async (userId) => {
  try {
    const user = await Client.query(
      q.Get(
        q.Ref(q.Collection('Users'), userId)
      )
    )
    return user.data
  } catch {
    return // return null if there is any error.
  }
}

exports.loginUser = async (email, password) => {
 try {
  let userData = await Client.query(
    q.Get(
      q.Match(q.Index('user_by_email'), email)
    )
  )
  userData.data.id = userData.ref.value.id
  if (bcrypt.compareSync(password, userData.data.password)) return userData.data
  else return
 } catch (error) {
   return
 }
}