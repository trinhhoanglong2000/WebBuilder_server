//const sgMail = require('@sendgrid/mail')
//const apiKey = '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';

const transporter = require('../../config/email');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('../../helper/genSalt');
const verificationService = require('../verification/verificationService')


exports.sendVerifyEmail = async (email, id) => {
    let result = true;
    const uniqueString = uuidv4() + id;
    const Options = {
        from: '"EASYMALL" bestlophoc@gmail.com', // sender address
        to: [email], // list of receivers
        subject: "[EASYMALL VERIFY]", // Subject line
        html: 
            `<p>Verify your email address to complete the signup and login to your account.</p>
            <p>Press <a href=${process.env.SERVER_URL + "/verify/" + id + "/" + uniqueString}>here</a> to proceed.</p>
            ` // plain text body
    }

    const hashedUniqueString = bcrypt.hashString(uniqueString)
    const createVerificationResult = await verificationService.createVerification(id, hashedUniqueString)

    transporter.sendMail(Options)
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