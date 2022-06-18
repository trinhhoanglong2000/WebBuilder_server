//const sgMail = require('@sendgrid/mail')
//const apiKey = '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';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('../../helper/genSalt');
const verificationService = require('../verification/verificationService');
const accountService = require('../accounts/accountService');
const passwordResetService = require('../password_reset/passwordResetService');
const nodemailer = require('nodemailer');
const ggAuth = require('google-auth-library');

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
            user: process.env.AUTH_MAIL_USER,
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
            user: process.env.AUTH_MAIL_USER,
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


// exports.sendEmail = async (recipient, invitelink, role) => {
//     var result = true;
//     var Options = {
//         from: '"CLASSROOM" bestlophoc@gmail.com', // sender address
//         to: recipient, // list of receivers
//         subject: "[CLASS INVITATION]", // Subject line
//         text: 'You are invited to this class as a ' + role + ': ' + invitelink, // plain text body
//         //html: "<b>Hello world?</b>", // html body
//     }

//     await transporter.sendMail(Options, (err, info) => {
//         if (err) {
//             result = false;
//         }
//     });

//     return result;
    
// }



// exports.sendEmail = async (recipient, invitelink, role) => {
//     sgMail.setApiKey(apiKey)
//     var result = false;

//     const msg = {
//         to: recipient,
//         from: {
//             name: 'CLASSROOM',
//             email: '18127153@student.hcmus.edu.vn'
//         },
//         subject: '[CLASS INVITATION]',
//         text: 'You are invited to this class as a ' + role + ': ' + invitelink,
//         // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
//       }
      
//     await sgMail
//     .send(msg)
//     .then(() => {
//         result = true;
//     })
//     .catch((error) => {
//         console.error(error)
//     })

//     return result;
// }