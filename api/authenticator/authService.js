const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const axios = require('axios');
const accountService = require('../accounts/accountService');
const DBHelper = require("../../helper/DBHelper/DBHelper")
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
exports.googleSignIn = async (tokenID, accessToken) => {
    //verify id token and get email, name
    try {
        const ticket = await client.verifyIdToken({
            idToken: tokenID,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        
        const mail = payload['email'];
        
        const ggID = payload['sub'];
        const name = payload['name'];
        const { OAuth2 } = google.auth
        const oauth2Client = new OAuth2()
        oauth2Client.setCredentials({ access_token: accessToken })
    
        const peopleAPI = google.people({
            version: 'v1',
            auth: oauth2Client
        })
        const  data = await peopleAPI.people.get({
            resourceName: 'people/me',
            personFields: 'birthdays,genders',
            
        })
        const { birthdays, genders } = data.data;
        // format birthday from Date to DD/MM/YYYY
        
        let date = birthdays[0].date;
        
        const bod = date.day + "/" + date.month + "/" + date.year;
        let gender = genders.value;
        const ObjData = {
            dob: bod, 
            gender: gender,
            email: mail, 
            fullname : name, 
            gg_id : ggID 
        }
        const acc = await accountService.getUserByEmail(ObjData.email)
        if (acc) {
            if (!acc.gg_id) {
                let obj = {
                    gg_id : ObjData.gg_id,
                    email : ObjData.email
                }
                await DBHelper.updateData(obj,"account","email")
            }
        } else {
            let genderOfNewMember;
            if (data.gender === 'male' ) genderOfNewMember = true;
            else genderOfNewMember = false;
            let newAccount = {
                email: ObjData.email,
                fullname: ObjData.fullname,
                gender: genderOfNewMember,
                dob: ObjData.dob,
                gg_id: ObjData.gg_id
            }
            await accountService.createAccount(newAccount)
        }

        const accNew = await accountService.getUserByEmail(mail)
        const result ={
            user: accNew,
            token: jwt.sign({
                id: accNew.id,
                email: accNew.email,
            }, 'secret', {
                expiresIn: '10h'
            })
        };
        
        return result;
    } catch {
        return;
    }
    
}

exports.facebookSignIn = async (tokenID, callback) => {
    try {

        
        axios.get(`https://graph.facebook.com/v12.0/me?access_token=${tokenID}&fields=id,name,email,gender,birthday`)
        .then(async response => {
            
            const data = response.data;
            if (data.error) callback(); 
            const acc = await accountService.getUserByEmail(data.email);
            
            if (!acc) {
                let genderOfNewMember;
                if (data.gender === 'male') genderOfNewMember = true;
                else genderOfNewMember = false;
                newAccount = {
                    email: data.email,
                    password: null,
                    fullname: data.name,
                    phone: null,
                    gender: genderOfNewMember ,
                    dob: data.birthday,
                    fb_id: data.id,
                    gg_id: null
                }
                await accountService.createAccount(newAccount)
                
            } else if (!acc.fb_id && acc != null) {
                let obj = {
                    fb_id : data.id,
                    email : acc.email
                }
                await DBHelper.updateData(obj,"account","email")
            }
            
            const acc1 = await accountService.getUserByEmail(data.email)
            const result ={
                user: acc1,
                token: jwt.sign({
                    id: acc1.id,
                    email: acc1.email,
                }, 'secret', {
                    expiresIn: '10h'
                })
            };
            callback(result);
        })
        .catch(error => {
            console.log(error.response.data)
            callback();
        });;
    } catch {
        callback();
    }
   
}