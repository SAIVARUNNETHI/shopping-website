const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path = require('path');
const app = express();
const port = 3000;

const serviceAccount = require('./ServiceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const userRef = db.collection('users').doc(username);
    try {
        const doc = await userRef.get();
        if (!doc.exists) {
            console.log('No such user!');
            res.redirect('/login?error=user_not_found');
        } else {
            const userData = doc.data();
            if (userData.password === password) {
                console.log(`User ${username} logged in successfully`);
                res.redirect('https://www.flipkart.com'); 
            } else {
                console.log('Incorrect password');
                res.redirect('/login?error=incorrect_password');
            }
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.redirect('/login?error=server_error');
    }
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.post('/register', async (req, res) => {
    const { email, username, password } = req.body;
    const userRef = db.collection('users').doc(username);
    try {
        const doc = await userRef.get();
        if (doc.exists) {
            console.log('Username already exists');
            res.status(400).send('Username already exists');
        } else {
            await userRef.set({
                email,
                password,
            });
            console.log('User registered');
            res.redirect('https://www.flipkart.com'); 
        }
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Server error');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
