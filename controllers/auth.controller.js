const Schema = require('../models/user.schema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// user authentication
exports.signIn = (req, res) => {
    // validate request
    let {email,password} = req.body;
    console.log(req.body);
    if (!email) { return res.status(400).send({ message: 'Email harus di isi !' }); }
    if (!password) { return res.status(400).send({ message: 'Password harus di isi !' }); }
    if (password.length < 8) { return res.status(400).send({ message: 'Password harus sama dengan atau lebih dari 8 karakter !' }); }
    // check email already exist or not
    try {
        Schema.findOne({ email: email }).then((user)=>{
            if (!user) {
                console.log('Email tidak ditemukan pada database.');
                return res.status(500).send({ message: 'Email tidak terdaftar, silahkan daftar terlebih dahulu.'}); 
            }
            else if (user) {
                console.log('Email ditemukan pada database.');
                // comparing passwords
                var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
                if (!passwordIsValid) {
                    console.log('Email terdaftar, tapi password salah.');
                    return res.status(409).send({
                        message: 'Email terdaftar, tapi password salah.',
                        token: null,
                    });
                }
                else if (passwordIsValid) {
                    // sign in token create from user id
                    var accessToken = jwt.sign(
                        {id: user._id},
                        process.env.JWT_SECRET,
                        {expiresIn: 86400},
                    );
                    console.log('Berhasil masuk.');
                    console.log('Token: ', accessToken);
                    return res.status(200).send({
                        user: {
                            id: user._id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                        },
                        token: accessToken,
                    });
                }
            }
        })
    }
    catch(err) { return res.status(500).send({ message: err || 'Coba cek koneksi internetmu.'}); }
}

// user authorization with verify the access token
exports.verifyAccessToken = (req, res) => {
    const header = req.headers.authorization;
    const authHeader = req.headers['authorization']; // header and authHeader are same
    const token = authHeader.split(' ')[1];
    console.log(authHeader);
    console.log(header);
    console.log(token);
    // validation
    if (!authHeader) { return res.status(403).send({message: 'request header undefined'}); }
    // convert token to json (decoded)
    const decodedResult = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decodedResult.id);
    Schema.findOne({ _id: decodedResult.id }).then(user => {
        if (user.role === 'admin') {
            console.log(user.name);
            return res.status(200).send({
                message: 'congratulations! there is no hidden content',
                name: user.name,
            });
        }
        console.log(user.name);
        return res.status(200).send({
            message: 'congratulations! but there is a hidden content',
            name: user.name,
        });
    }).catch(err => { 
        return res.status(401).send({message: 'invalid jwt token'}); 
    });
};