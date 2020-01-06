const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const jimp = require('jimp');
const { sendWelcomeEmail, sendCancelEmail} = require('../emails/accounts');

const router = new express.Router();

router.post('/users', async (req, res) =>{
    const user = new User(req.body);
    try {
      const token = await user.getAuthToken();
      await user.save();
      sendWelcomeEmail(user.email, user.name);
      res.status(201).send({user, token});
    } catch (e) {
        res.status(400).send(e);
    }
})

router.post('/users/login', async (req,res) =>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.getAuthToken();
        res.send({user, token});
    } catch (e) {
        res.status(400).send(e + '');
    }
})

router.post('/users/logout', auth, async (req, res) =>{
    try {
        const user = req.user;
        user.tokens = user.tokens.filter((token) =>{
            return token.token !== req.token;
        })
        await user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
})

router.post('/users/logoutall', auth, async (req, res) =>{
    try {
        const user = req.user;
        user.tokens = [];
        await user.save();
        res.send(user);
    } catch (e) {
        res.status(500).send(e +'');
    }
})

router.get('/users/me',auth, async (req, res) =>{
   res.send(req.user);
})

router.patch('/users/me', auth, async (req, res) =>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'age', 'password', 'email'];
    const verifyUpdates = updates.every((update) => allowedUpdates.includes(update));
    if (!verifyUpdates){
        return res.status(400).send({error: 'invalid updates'});
    }
    try {
        const user = req.user;
        updates.forEach((update) => user[update] = req.body[update]);
        await user.save();  
        res.send(user);
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) =>{
    try {
        await req.user.remove();
        sendCancelEmail(req.user.email, req.user.name);
        res.send(req.user);    
    } catch (e) {
        res.status(500).send();
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('please upload a valid image format!'))
        }
        cb(undefined, true);
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const image = await jimp.read(req.file.buffer);
    image
        .resize(250, 250)
        .write('profile-pic.jpg')
    const buffer = await image.getBase64Async('image/png');     
    req.user.avatar = buffer;
    await req.user.save();
    res.send(req.user.avatar);
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message});
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            throw new Error();
        }
        res.set('Content-Type', 'image/jpg');
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send();
    }
})

module.exports = router;