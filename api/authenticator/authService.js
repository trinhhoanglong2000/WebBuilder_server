const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const axios = require('axios');
const accountService = require('../accounts/accountService');
const jwt = require('jsonwebtoken');

exports.googleSignIn = async (tokenID) => {
    const ticket = await client.verifyIdToken({
        idToken: tokenID,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    const mail = payload['email'];
    
    const ggID = payload['sub'];
    const name = payload['name'];
    const acc = await accountService.findAccWithMail(mail);
    if (acc) {
        if (acc.googleID == '') {
            await accountService.updateInfoForOneField('googleID', ggID, acc.id)
        }
        if (acc.name == '') {
            await accountService.updateInfoForOneField('name', name, acc.id)
        }
        const result ={
            user: acc,
            token: jwt.sign({
                id: acc.id,
                username: acc.username,
            }, 'secret', {
                expiresIn: '1h'
            })
        };
        
        return result
    } else {
        let newAccount = {
            username: '',
            password: '',
            googleID: ggID,
            facebookID: '',
            email: mail
        }
        await accountService.create(newAccount);
        const acc = await accountService.findAccWithMail(mail);
        const result = {
            user: acc,
            token: jwt.sign({
                id: acc.id,
                username: acc.username,
            }, 'secret', {
                expiresIn: '1h'
            })
        };
        
        return result;
    }
}

exports.facebookSignIn = async (tokenID, callback) => {
    await axios.get(`https://graph.facebook.com/v12.0/me?access_token=${tokenID}&fields=id,name,email`)
        .then(async response => {
            const data = response.data;
            if (data.error) return {}; 
            const acc = await accountService.findAccWithMail(data.email);
            if (!acc) {
                newAccount = {
                    username: '',
                    password: '',
                    googleID: '',
                    facebookID: data.id,
                    email: data.email
                }
                await accountService.create(newAccount);
            } else if (acc.facebookID == '' && acc != null) {
                await accountService.updateInfoForOneField('facebookID', data.id, acc.id)
            }
            if (acc.name == '' && acc != null) {
                await accountService.updateInfoForOneField('name', data.name, acc.id)
            }
            const result ={
                user: acc,
                token: jwt.sign({
                    id: acc.id,
                    username: acc.username,
                }, 'secret', {
                    expiresIn: '1h'
                })
            };
            callback(result);
        })
        .catch(error => {
            return error;
        });;
}