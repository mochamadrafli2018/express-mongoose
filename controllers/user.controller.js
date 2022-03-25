const Schema = require('../models/user.schema');
const bcrypt = require('bcrypt');

exports.newuser = (req, res) => {
    // validate requests
    let {name,email,password,gender,role} = req.body;
    console.log(req.body);
    if (!req.body) { return res.status(400).send({ message: 'Data harus di isi !' }); }
    if (!name) { return res.status(400).send({ message: 'Nama harus di isi !' }); }
    if (!email) { return res.status(400).send({ message: 'Email harus di isi !' }); }
    if (!password) { return res.status(400).send({ message: 'Password harus di isi !' }); }
    if (password.length < 8) { return res.status(400).send({ message: 'Password harus sama dengan atau lebih dari 8 karakter !' }); }
    if (!gender) { return res.status(400).send({ message: 'Jenis kelamin harus di isi !' }); }
    if (!role) { return res.status(400).send({ message: 'Role harus di isi !' }); }
    // check if email already exist
    try {
        Schema.findOne({ email }).then((user)=>{
            if (!user) {
                console.log('Email belum terdaftar.');
                // convert password to hashed
                const encryptedPassword = bcrypt.hashSync(password, 10);
                console.log(encryptedPassword);
                // initialize newUser data
                const newUser = new Schema({
                    name: name,
                    email: email,
                    gender: gender,
                    password: encryptedPassword,
                    role: role,
                    updatedScreeningResult: "",
                });
                console.log(newUser);           
                newUser.save().then(data => {
                    console.log('Pendaftaran berhasil.');
                    return res.status(201).send({
                        message: 'Pendaftaran berhasil.',
                        data: data,
                    });
                }).catch(err => {
                    console.log(err)
                    return res.status(500).send({ message: err || 'Pendaftaran gagal.' });
                });
            }
            else if (user) { return res.status(409).send({ message: 'Email sudah terdaftar, silahkan masuk.' }); }
        })
    }
    catch(err) { return res.status(500).send({ message: err || 'Coba cek koneksi internetmu.'}); }
}

// retrieve all user data from the DB
exports.find = (req, res) => {
    Schema.find()
    .then((data) => {
        res.status(200).send(data);
    })
    .catch((err) => {
        res.status(500).send({
            message:
            err.message || 'some error ocurred while retrieving data.',
        });
    });
};

// get and find a single user data with id
exports.findById = (req, res) => {
    Schema.findById({_id:req.params.id})
    .then((data) => {
        if(!data) {
            return res.status(404).send({ message: 'data not found with id ' + req.params.id + '. Make sure the id was correct' });
        }
        res.send(data);
    })
    .catch((err) => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({ message: 'data not found with id ' + req.params.id });
        }
        return res.status(500).send({ message: 'error retrieving data with id ' + req.params.id });
    });
}

// update a user data identified by the  id in the request
exports.findOneAndUpdate = (req, res) => {
    console.log(req.body);
    Schema.findById({_id:req.params.id})
    .then((currentData) => {
        if(!currentData) {
            return res.status(404).send({ message: 'data not found with id ' + req.params.id + '. Make sure the id was correct' });
        }
        if (!req.body.name) { newName = currentData.name}
        if (!req.body.email) { newEmail = currentData.email}
        if (!req.body.password) { newPassword = currentData.password}
        if (!req.body.gender) { newGender = currentData.gender}
        if (!req.body.role) { newRole = currentData.role}
        if (!req.body.updatedScreeningResult) { 
            newUpdatedScreeningResult = currentData.updatedScreeningResult
        }
        if (req.body.name) { newName = req.body.name}
        if (req.body.email) { newEmail = req.body.email}
        if (req.body.password) { newPassword = req.body.password}
        if (req.body.gender) { newGender = req.body.gender}
        if (req.body.role) { newRole = req.body.role}
        if (req.body.updatedScreeningResult) { 
            newUpdatedScreeningResult = req.body.updatedScreeningResult
        }
        const newUpdatedData = new Schema({
            name: newName,
            email: newEmail,
            password: newPassword,
            gender: newGender,
            role: newRole,
            updatedScreeningResult: newUpdatedScreeningResult,
            _id: req.params.id
        });
        console.log(newUpdatedData)
        // update with new data
        Schema.findByIdAndUpdate({_id: req.params.id}, newUpdatedData, { new: true })
        .then((updatedData) => {
            if(!updatedData) {
                return res.status(404).send({ message: 'data not found with _id ' + req.params._id, });
            }
            console.log('success update data');
            return res.status(200).send(updatedData);
        }).catch((err) => {
            if(err.kind === 'Object_id') {
                return res.status(404).send({ message: 'data not found with _id ' + req.params._id, });
            }
            return res.status(500).send({ message: 'error updating data with _id ' + req.params._id, });
        });
    })
    .catch((err) => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({ message: 'data not found with id ' + req.params.id });
        }
        return res.status(500).send({ message: 'error retrieving data with id ' + req.params.id });
    });
};

// delete a user data with the specified id
exports.findByIdAndRemove = (req, res) => {
    Schema.findByIdAndRemove({_id: req.params.id})
    .then((data) => {
        if(!data) { return res.status(404).send({ message: 'data not found with id ' + req.params.id, }); }
        console.log('data deleted successfully!');
        return res.status(200).send({ message: 'data deleted successfully!' });
    })
    .catch((err) => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({ message: 'data not found with id ' + req.params.id, });
        }
        return res.status(500).send({ message: 'could not delete data with id ' + req.params.id, });
    });
};

// delete all user data in collection
exports.remove = (req, res) => {
    Schema.remove({})
    .then(() => { return res.status(200).send({ message: 'All data deleted successfully!' }); }) 
    .catch((err) => { return res.status(500).send({ message: 'Could not delete all data' }); })
}