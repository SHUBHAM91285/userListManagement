const express = require('express');
const router = express.Router();
const Admin = require('./../models/admin'); 
const { jwtAuthMiddleware, generateToken } = require('./../jwt');
const csvtojson = require('csvtojson');
const User = require('./../models/user');
const fileName = "userList.csv";

router.post('/signup', async (req, res) => {
    try {
        const data = req.body;
        const adminExists = await Admin.exists({ role: 'admin' });

        if (adminExists && data.role === 'admin') {
            return res.status(400).json({ message: 'Admin user already exists' });
        }
        const newAdmin = new Admin(data);
        const response = await newAdmin.save();
        console.log('data saved');
        const payload = { id: response.id };
        const token = generateToken(payload);

        res.status(200).json({ response: response, token: token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server error" });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Admin.findOne({ email: email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const payload = { id: user.id };
        const token = generateToken(payload);
        res.status(200).json({ message: 'Login successful', token: token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/add', jwtAuthMiddleware, async (req, res) => {
    try {
        const source = await csvtojson().fromFile(fileName);
        let usersToInsert = [];

        // Prepare the users to insert
        for (let i = 0; i < source.length; i++) {
            const row = source[i];
            if (row.name && row.email) {
                usersToInsert.push({
                    name: row.name,
                    email: row.email,
                    city: row.city || ''
                });
            } else {
                console.log("Skipping row - missing required fields:", row);
            }
        }

        if (usersToInsert.length > 0) {
            const emails = usersToInsert.map(user => user.email);
            const existingUsers = await User.find({ email: { $in: emails } });
            const existingEmails = new Set(existingUsers.map(user => user.email));

            usersToInsert = usersToInsert.filter(user => !existingEmails.has(user.email));

            if (usersToInsert.length > 0) {
                try {
                    const result = await User.insertMany(usersToInsert, { ordered: false });
                    console.log("Imported CSV into database successfully.");
                    res.status(200).json({ message: "Imported CSV into database successfully.", result });
                } catch (bulkWriteErr) {
                    res.status(200).json({
                        message: "Imported CSV without duplicates.",
                        result: bulkWriteErr.result
                    });
                }
            } else {
                res.status(400).json({ message: "No valid users to insert after removing duplicates." });
            }
        } else {
            res.status(400).json({ message: "No valid users to insert." });
        }
    } catch (err) {
        console.error("Error importing CSV:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/admin',async(req,res)=>{
    try{
        const admin = await Admin.find()
        const adminRecord = admin.map((data)=>{
            return{
                name: data.name,
                email: data.email
            }
        })
        return res.status(200).json(adminRecord)
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server error"});
    }
})


module.exports = router;
