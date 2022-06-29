//const sgMail = require('@sendgrid/mail')
//const apiKey = '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';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('../../helper/genSalt');
const verificationService = require('../verification/verificationService');
const accountService = require('../accounts/accountService');
const passwordResetService = require('../password_reset/passwordResetService');
const nodemailer = require('nodemailer');
const ggAuth = require('google-auth-library');
const DBHelper = require('../../helper/DBHelper/DBHelper')
const storeService = require('../stores/storeService')
const { text } = require('body-parser');

const AllURL = [
    "https://admin.googleapis.com/admin/directory/v1/users/:id",
    "https://www.googleapis.com/gmail/v1/users/me/settings/sendAs",
    "https://www.googleapis.com/gmail/v1/users/{userId}/settings/sendAs/{sendAsEmail}",
    "https://gmail.googleapis.com/gmail/v1/users/{userId}/profile"

]
const sendCredential = require('../../credential.json')

const myOAuth2Client = new ggAuth.OAuth2Client(
    process.env.GOOGLE_MAILER_CLIENT_ID,
    process.env.GOOGLE_MAILER_CLIENT_SECRET
)

myOAuth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_MAILER_REFRESH_TOKEN
})

exports.sendResetPasswordEmail = async (email) => {
    const user = await accountService.getUserByEmail(email);
    if (!user) return {
        success: false,
        message: "No account with the supplied email exists!"
    }
    if (!user.verified) return {
        success: false,
        message: "Email hasn't been verified yet. Check your inbox."
    }

    let success = true,
        message = ''

    // const myAccessTokenObject = await myOAuth2Client.getAccessToken()
    // const myAccessToken = myAccessTokenObject?.token
    const transporter = nodemailer.createTransport({
        // service: 'gmail',
        // auth: {
        //   type: 'OAuth2',
        //   user: process.env.ADMIN_EMAIL_ADDRESS,
        //   clientId: process.env.GOOGLE_MAILER_CLIENT_ID,
        //   clientSecret: process.env.GOOGLE_MAILER_CLIENT_SECRET,
        //   refresh_token: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
        //   accessToken: myAccessToken
        // }
        host: "smtp.gmail.com",
        port: 465,
        auth: {
            user: process.env.ADMIN_EMAIL_ADDRESS,
            pass: process.env.GOOGLE_SMTP_PASSWORD,
        },
    })

    const uniqueString = uuidv4() + user.id;
    const redirectURL = process.env.MANAGEMENT_CLIENT_URL + `/reset-password/${user.id}/${uniqueString}`;
    await passwordResetService.delete(user.id);

    const Options = {
        from: `"EASYMALL" ${process.env.ADMIN_EMAIL_ADDRESS}`, // sender address
        to: [email], // list of receivers
        subject: "[EASYMALL PASSWORD RESET]", // Subject line
        html:
            `<p>We heard that you lost the password.</p>
            <p>Don't worry, use the link below to reset it.</p>
            <p>Press <a href=${redirectURL}>here</a> to proceed.</p>
            ` // plain text body
    }

    const hashedUniqueString = bcrypt.hashString(uniqueString)
    const createVerificationResult = await passwordResetService.createPasswordReset(user.id, hashedUniqueString)

    await transporter.sendMail(Options)
        .then(() => {
            success = true
            message = 'Password reset email sent.'
        })
        .catch((err) => {
            console.log(err)
            success = false
            message = 'Password reset email failed.'
        })

    return { success, message };
}

exports.sendVerifyEmail = async (email, id) => {
    let result = true;
    const uniqueString = uuidv4() + id;

    // const myAccessTokenObject = await myOAuth2Client.getAccessToken()
    // const myAccessToken = myAccessTokenObject?.token
    const transporter = nodemailer.createTransport({
        // service: 'gmail',
        // auth: {
        //   type: 'OAuth2',
        //   user: process.env.ADMIN_EMAIL_ADDRESS,
        //   clientId: process.env.GOOGLE_MAILER_CLIENT_ID,
        //   clientSecret: process.env.GOOGLE_MAILER_CLIENT_SECRET,
        //   refresh_token: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
        //   accessToken: myAccessToken
        // }
        host: "smtp.gmail.com",
        port: 465,
        auth: {
            user: process.env.ADMIN_EMAIL_ADDRESS,
            pass: process.env.GOOGLE_SMTP_PASSWORD,
        },
    })
    const Options = {
        from: `"EASYMALL" ${process.env.ADMIN_EMAIL_ADDRESS}`, // sender address
        to: [email], // list of receivers
        subject: "[EASYMALL VERIFY]", // Subject line
        html:
            `<p>Verify your email address to complete the signup and login to your account.</p>
            <p>Press <a href=${process.env.SERVER_URL + "/verify/" + id + "/" + uniqueString}>here</a> to proceed.</p>
            ` // plain text body
    }

    const hashedUniqueString = bcrypt.hashString(uniqueString)
    const createVerificationResult = await verificationService.createVerification(id, hashedUniqueString)

    await transporter.sendMail(Options)
        .then(() => {
            result = true
        })
        .catch((err) => {
            console.log(err)
            result = false
        })

    return result;
}

exports.sendMailFromStore = async (query) => {
    // //query { 
    //     subject
    //     html
    //     store_id
    //     receiver
    // }
    const myAccessTokenObject = await myOAuth2Client.getAccessToken()
    const myAccessToken = myAccessTokenObject?.token
    const Auth = new ggAuth.GoogleAuth({
        scopes: [
            'https://mail.google.com',
            'https://www.googleapis.com/auth/gmail.settings.sharing',
            'https://www.googleapis.com/auth/admin.directory.user'
            ,
        ],
        clientOptions: { subject: 'admin@myeasymall.site' },
        credentials: sendCredential,
    });
    const auth = await Auth.getClient()
    let result
    let storeMail = await storeService.findById(query.store_id)
    if (storeMail) {
        if (storeMail.custom_mail) {
            const storeMail = await getStoreEmail({ id: query.store_id })
            
            if (storeMail) {
                if (storeMail.length == 1) {
                    const transporter = nodemailer.createTransport({
                        host: storeMail[0].smtp,
                        port: 465,
                        auth: {
                            user: storeMail[0].email,
                            pass: storeMail[0].password,
                        },
                    })

                    await transporter.sendMail({
                        from: `"${storeMail.name}" ${storeMail.mail_link}`,
                        to: `${query.receiver}`,
                        subject: `${query.subject}`,
                        html: `${query.html}`
                    }).then(() => {
                        console.log("Sent a mail successfully")
                        result = true
                    }).catch((err) => {
                        console.log(err)
                        result = false

                    })
                }
                else {
                    result = false
                }

            }
            else {
                result = false
            }


        }
        else {
            await auth.request({
                url: `https://admin.googleapis.com/admin/directory/v1/users/${process.env.GOOGLE_SEND_ACCOUNT_ID}`,
                method: 'PUT',
                data: {
                    "primaryEmail": storeMail.mail_link
                }
            }).then((status, data) => {
                console.log("Created In Admin")
            }).catch((err) => {
                console.log(err)
            })

            await auth.request({
                url: 'https://www.googleapis.com/gmail/v1/users/me/settings/sendAs',
                method: 'POST',
                data: {
                    "sendAsEmail": storeMail.mail_link,
                    "displayName": storeMail.mail_link,
                    "treatAsAlias": true,
                }
            }).then((status, data) => {
                console.log("Created")
            }).catch((err) => {
                console.log(err)
            })

            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                auth: {
                    user: process.env.ADMIN_EMAIL_ADDRESS,
                    pass: process.env.GOOGLE_SMTP_PASSWORD,
                },
            });

            await transporter.sendMail({
                from: `"${storeMail.name}" ${storeMail.mail_link}`,
                to: `${query.receiver}`,
                subject: `${query.subject}`,
                html: `${query.html}`
            }).then(() => {
                console.log("Sent a mail successfully")
                result = true
            }).catch((err) => {
                console.log(err)
                result = false

            })

            await auth.request({
                url: `https://www.googleapis.com/gmail/v1/users/me/settings/sendAs/${storeMail.mail_link}`,
                method: 'DELETE',

            }).then((status, data) => {
                console.log("Deleted")
            }).catch((err) => {
                console.log(err)
            })
        }

    }
    else {
        result = false
    }
    return result
}


exports.adminSendMail = async (query) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        auth: {
            user: process.env.ADMIN_EMAIL_ADDRESS,
            pass: process.env.GOOGLE_SMTP_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: `"EASYMALL" ${process.env.ADMIN_EMAIL_ADDRESS}`,
        to: `${query.receiver}`,
        subject: `${query.subject}`,
        html: `${query.html}`
    }).then(() => {
        console.log("Sent a mail successfully")
        result = true
    })
        .catch((err) => {
            console.log(err)
            result = false

        })

}

exports.configEmail = async (query) => {
    const result = await DBHelper.insertData(query, "store_email", false, "id")
    if (result) {
        await storeService.updateStoreInfo({ id: query.id, custom_mail: true, mail_link: query.email })
        return result
    }
    else {
        return null
    }
}
exports.resetEmail = async (query) => {

    const result = await deleteStoreEmail(query)
    if (result) {
        const store = await storeService.findById(query.id)
        await storeService.updateStoreInfo({ id: query.id, custom_mail: false, mail_link: store.original_mail })
        return result
    }
    else {
        return null
    }
}

var deleteStoreEmail = exports.deleteStoreEmail = async (query) => {
    return DBHelper.deleteData("store_email", query)
}

exports.updateConfigEmail = async (query) => {
    const result = await DBHelper.updateData(query, "store_email", "id")
    if (result) {
        if (query.email) {
            await storeService.updateStoreInfo({ id: query.id, custom_mail: true, mail_link: query.email })
        }

        return result
    }
    else {
        return null
    }
}

var getStoreEmail = exports.getStoreEmail = async (query) => {
    return DBHelper.getData("store_email", query)
}