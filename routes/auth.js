const router = require('express').Router();
const User = require('./../models/User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


const generateAccessToken = (user) =>{
    return jwt.sign({id: user.id, isAdmin: user.isAdmin}, "mySecretKey", {expiresIn: "5s"});
}

const generateRefreshToken = (user) =>{
    return jwt.sign({id: user.id, isAdmin: user.isAdmin}, "RefreshToken")
}

// REGISTER
router.post('/register', async (req, res) => {
    // console.log(req.body)
    const user = new User(req.body)
    try{
       await user.save();
       res.status(200).send("User is registered!!")
    } catch(e){
        console.log(e);
    }
})

const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, "mySecretKey", (err, user) => {
      if (err) {
        return res.status(403).json("Token is not valid!");
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json("You are not authenticated!");
  }
};


let refreshTokens = [];

// LOGIN
router.post('/login', async (req, res) => {
    const {username, password} = req.body;
    try{
      const user = await User.findOne({username: username, password: password});
      if(user){
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        refreshTokens.push(refreshToken);

        res.json({user: user.username, isAdmin: user.isAdmin, accessToken: accessToken, refreshToken: refreshToken});
      }

    } catch(e){res.status(404).send("User not found!!")}
})

// REFRESH
router.post('/refresh', (req, res) => {
  const refreshToken = req.body.token;

  if (!refreshToken) return res.status(401).send("you r not authenticated!!");
  if (!refreshTokens.includes(refreshToken)) return res.status(401);


  // VERIFY REFRESH TOKEN AND SEND A NEW TOKEN

  jwt.verify(refreshToken, "RefreshToken", (err, user) => {
    err && console.log(err);
    refreshTokens = refreshTokens.filter(token => token !== refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    refreshTokens.push(newRefreshToken);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    })
  })

})

// LOGOUT
router.post('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter(token => token!==req.body.token)
  res.send("User is now logged out!!")
})

// DELETE
router.delete("/api/users/:userId", verify, async (req, res) => {
    if (req.user.id === req.params.userId || req.user.isAdmin) {
        await User.findByIdAndDelete(req.params.userId)
        res.status(200).json("User has been deleted.");
    } else {
        res.status(403).json("You are not allowed to delete this user!");
    }
  });

module.exports = router;