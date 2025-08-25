const db = require('../../../models');
const User = db.Users;

async function createUserProfile (req, res){
    try{
        const newUser = await User.create({
            firebase_uid: req.user.uid,
            email: req.user.email,
            username: req.body.username,
            password: req.body.password,
        });
        res.status(201).json(newUser);
    } catch (error){
        res.status(500).json({message: 'Error creating profile', error});
    }
}

async function getProfile(req, res) {
    try {
        const userProfile = await User.findOne({
            where: { firebase_uid: req.user.uid }
        });
        if (!userProfile) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(userProfile);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error });
    }
}