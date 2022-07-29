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

    let htmlString = createUserMailStringWithBtn(`<p>We heard that you lost the password.</p>
    <p>Don't worry, we are here to help you. Please use the link below to reset it.</p>
    <p>Thanks you </p>`,"Click here to reset password",redirectURL)
    const Options = {
        from: `"EASYMALL" ${process.env.ADMIN_EMAIL_ADDRESS}`, // sender address
        to: [email], // list of receivers
        subject: "[EASYMALL PASSWORD RESET]", // Subject line
        html: htmlString
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
    let htmlString = createUserMailStringWithBtn(`<p>We are extremely grateful for you to joining you Easy Mall team.</p><br>
    
    <p>For further proceeding to our serivce, please verify your email address to complete the signup and login to your account. You can click the link below to proceed.</p> <br>
    
    <p>On behalf of Easy Mall team, we thank you for choosing us.</p>`, "Click me to verify account", `${process.env.SERVER_URL + "/verify/" + id + "/" + uniqueString}`)
    const Options = {
        from: `"EASYMALL" ${process.env.ADMIN_EMAIL_ADDRESS}`, // sender address
        to: [email], // list of receivers
        subject: "[EASYMALL VERIFY]", // Subject line
        html: htmlString
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
            let listAlias = []
            await auth.request({
                url: `https://admin.googleapis.com/admin/directory/v1/users/${process.env.GOOGLE_SEND_ACCOUNT_ID}/aliases`,
                method: 'GET',

            }).then((status, data) => {
                console.log("List alias")
                listAlias = status.data.aliases ?? []
            }).catch((err) => {
                console.log(err)
            })

            for (let i = 0; i < listAlias.length; i++) {
                await auth.request({
                    url: `https://admin.googleapis.com/admin/directory/v1/users/${process.env.GOOGLE_SEND_ACCOUNT_ID}/aliases/${listAlias[i].alias}`,
                    method: 'DELETE',

                }).then((status, data) => {
                    console.log("Deleted Alias")
                }).catch((err) => {
                    console.log(err)
                })
            }


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



// DON'T CODE DOWN HERE
exports.createConfirmCustomerMailString = (orderQuery, productQuery, storeData) => {

    const orderId = orderQuery.id
    const storeName = storeData.name
    const storeURL = storeData.store_link
    const subTotal = Math.ceil(Number(orderQuery.original_price)).toLocaleString('fi-FI', { style: 'currency', currency: orderQuery.currency })

    const discount = Math.ceil(Number(orderQuery.discount_price)).toLocaleString('fi-FI', { style: 'currency', currency: orderQuery.currency })
    const total = Math.ceil(Number(orderQuery.original_price - orderQuery.discount_price)).toLocaleString('fi-FI', { style: 'currency', currency: orderQuery.currency })
    const currency = orderQuery.currency
    let productHTML = ""
    for (let i = 0; i < productQuery.length; i++) {
        let variantName = productQuery[i].is_variant ? productQuery[i].variant_name : ""

        if (i == 0) {
            productHTML += `<li style="margin-bottom: 0px;"><strong>${productQuery[i].product_name} </strong> <em>${variantName}</em> x ${productQuery[i].quantity}&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</li>`
        }
        else {
            productHTML += `<li><strong>${productQuery[i].product_name}</strong> x ${productQuery[i].quantity}</li>`
        }
    }

    let stringReturn = `
    <!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
	<title></title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
	<style>
		* {
			box-sizing: border-box;
		}

		body {
			margin: 0;
			padding: 0;
		}

		a[x-apple-data-detectors] {
			color: inherit !important;
			text-decoration: inherit !important;
		}

		#MessageViewBody a {
			color: inherit;
			text-decoration: none;
		}

		p {
			line-height: inherit
		}

		.desktop_hide,
		.desktop_hide table {
			mso-hide: all;
			display: none;
			max-height: 0px;
			overflow: hidden;
		}

		@media (max-width:520px) {
			.row-content {
				width: 100% !important;
			}

			.mobile_hide {
				display: none;
			}

			.stack .column {
				width: 100%;
				display: block;
			}

			.mobile_hide {
				min-height: 0;
				max-height: 0;
				max-width: 0;
				overflow: hidden;
				font-size: 0px;
			}

			.desktop_hide,
			.desktop_hide table {
				display: table !important;
				max-height: none !important;
			}
		}
	</style>
</head>

<body style="background-color: #FFFFFF; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
	<table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #FFFFFF;">
		<tbody>
			<tr>
				<td>
					<table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 500px;" width="500">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="heading_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="text-align:center;width:100%;">
																<h1 style="margin: 0; color: #978e62; direction: ltr; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 23px; font-weight: 700; letter-spacing: normal; line-height: 120%; text-align: left; margin-top: 0; margin-bottom: 0;">Order Confirmation</h1>
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
					<table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 500px;" width="500">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="paragraph_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#101112;font-size:16px;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;font-weight:400;line-height:120%;text-align:left;direction:ltr;letter-spacing:0px;mso-line-height-alt:19.2px;">
																	<p style="margin: 0; margin-bottom: 16px;">&nbsp;</p>
																	<p style="margin: 0;">${storeName}</p>
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#101112;font-size:16px;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;font-weight:400;line-height:120%;text-align:left;direction:ltr;letter-spacing:0px;mso-line-height-alt:19.2px;">
																	<p style="margin: 0; margin-bottom: 16px;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 16px;">Order Number:&nbsp;<strong><a href = "${storeURL}/orders?id=${orderId}">${orderId}</a></strong></p>
																	<p style="margin: 0; margin-bottom: 16px;">Your Order has been successfully created from our store. To view your order details and also get the lastest update on your order, please visit our website at shoe-shop.myeasymall.site.</p>
																	<p style="margin: 0; margin-bottom: 16px;">On behalf of our team here at <strong><a href = "${storeURL}">${storeName}</a></strong>, we sincerely thank you for your purchase.</p>
																	<p style="margin: 0; margin-bottom: 16px;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 16px;">Your purchase items:&nbsp;</p>
																	<p style="margin: 0;">&nbsp;</p>
																</div>
															</td>
														</tr>
													</table>
													<table class="divider_block block-3" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																		<tr>
																			<td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 2px dashed #8A3C90;"><span>&#8202;</span></td>
																		</tr>
																	</table>
																</div>
															</td>
														</tr>
													</table>
													<table class="list_block block-4" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<ul style="margin: 0; padding: 0; margin-left: 20px; list-style-type: revert; color: #101112; font-size: 16px; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 400; line-height: 180%; text-align: left; direction: ltr; letter-spacing: 0px;">
																	${productHTML}
																</ul>
															</td>
														</tr>
													</table>
													<table class="divider_block block-5" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div class="alignment" align="center">
																	<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																		<tr>
																			<td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 2px dashed #8A3C90;"><span>&#8202;</span></td>
																		</tr>
																	</table>
																</div>
															</td>
														</tr>
													</table>
													<table class="list_block block-6" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<ul style="margin: 0; padding: 0; margin-left: 20px; list-style-type: revert; color: #101112; font-size: 16px; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-weight: 400; line-height: 180%; text-align: left; direction: ltr; letter-spacing: 0px;">
																	<li><strong>Sub Total:</strong>  ${subTotal} &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</li>
                                                                    <li><strong>Discount:</strong>   ${discount} </li>
                                                                    <li><strong>Total:</strong>      ${total} </li>
																</ul>
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>
		</tbody>
	</table><!-- End -->
</body>

</html>
    `
    return stringReturn
}

var createUserMailStringWithBtn = exports.createUserMailStringWithBtn = (htmlContent, btnText = "Click here to continue", redirectURL) => {

    let content = `
    <!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
	<title></title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
	<style>
		* {
			box-sizing: border-box;
		}

		body {
			margin: 0;
			padding: 0;
		}

		a[x-apple-data-detectors] {
			color: inherit !important;
			text-decoration: inherit !important;
		}

		#MessageViewBody a {
			color: inherit;
			text-decoration: none;
		}

		p {
			line-height: inherit
		}

		.desktop_hide,
		.desktop_hide table {
			mso-hide: all;
			display: none;
			max-height: 0px;
			overflow: hidden;
		}

		@media (max-width:620px) {
			.row-content {
				width: 100% !important;
			}

			.mobile_hide {
				display: none;
			}

			.stack .column {
				width: 100%;
				display: block;
			}

			.mobile_hide {
				min-height: 0;
				max-height: 0;
				max-width: 0;
				overflow: hidden;
				font-size: 0px;
			}

			.desktop_hide,
			.desktop_hide table {
				display: table !important;
				max-height: none !important;
			}
		}
	</style>
</head>

<body style="background-color: transparent; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
	<table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: transparent;">
		<tbody>
			<tr>
				<td>
					<table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="heading_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="width:100%;text-align:center;">
																<h1 style="margin: 0; color: #2b9361; font-size: 38px; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; line-height: 120%; text-align: left; direction: ltr; font-weight: 700; letter-spacing: normal; margin-top: 0; margin-bottom: 0;"><span class="tinyMce-placeholder">Greeting</span></h1>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#101112;font-size:17px;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;font-weight:400;line-height:120%;text-align:left;direction:ltr;letter-spacing:0px;mso-line-height-alt:20.4px;">
																	<p style="margin: 0; margin-bottom: 16px;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 16px;">${htmlContent}</p>
																	<p style="margin: 0; margin-bottom: 16px;">&nbsp;</p>
																	
																</div>
															</td>
														</tr>
													</table>
													<table class="button_block block-4" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="text-align:center;padding-top:60px;">
																<div class="alignment" align="center">
																	<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:boffice:word" href="${redirectURL}" style="height:46px;width:201px;v-text-anchor:middle;" arcsize="9%" strokeweight="1.5pt" strokecolor="#2b9361" fillcolor="#2b9361"><w:anchorlock/><v:textbox inset="0px,0px,0px,0px"><center style="color:#ffffff; font-family:Arial, sans-serif; font-size:16px"><![endif]--><a href="${redirectURL}" target="_blank" style="text-decoration:none;display:inline-block;color:#ffffff;background-color:#2b9361;border-radius:4px;width:auto;border-top:1px solid #2b9361;font-weight:400;border-right:1px solid #2b9361;border-bottom:1px solid #2b9361;border-left:1px solid #2b9361;padding-top:5px;padding-bottom:5px;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;text-align:center;mso-border-alt:none;word-break:keep-all;"><span style="padding-left:20px;padding-right:20px;font-size:16px;display:inline-block;letter-spacing:normal;"><span style="word-break: break-word; line-height: 32px;" dir="ltr">${btnText}</span></span></a>
																	<!--[if mso]></center></v:textbox></v:roundrect><![endif]-->
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-5" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#101112;font-size:16px;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;font-weight:400;line-height:120%;text-align:left;direction:ltr;letter-spacing:0px;mso-line-height-alt:19.2px;">
																	<p style="margin: 0; margin-bottom: 16px;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 16px;">&nbsp;</p>
																	<p style="margin: 0;">&nbsp;</p>
																</div>
															</td>
														</tr>
													</table>
													<table class="image_block block-6" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
																<div class="alignment" align="center" style="line-height:10px"><img src="https://ezmall-bucket.s3.ap-southeast-1.amazonaws.com/EZMallBig2.png" style="display: block; height: auto; border: 0; width: 300px; max-width: 100%;" width="300"></div>
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>
		</tbody>
	</table><!-- End -->
</body>

</html>
    `
    return content
}

var createUserMailString = exports.createUserMailString = (htmlContent) => {

    let content = `
    <!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
	<title></title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
	<style>
		* {
			box-sizing: border-box;
		}

		body {
			margin: 0;
			padding: 0;
		}

		a[x-apple-data-detectors] {
			color: inherit !important;
			text-decoration: inherit !important;
		}

		#MessageViewBody a {
			color: inherit;
			text-decoration: none;
		}

		p {
			line-height: inherit
		}

		.desktop_hide,
		.desktop_hide table {
			mso-hide: all;
			display: none;
			max-height: 0px;
			overflow: hidden;
		}

		@media (max-width:620px) {
			.row-content {
				width: 100% !important;
			}

			.mobile_hide {
				display: none;
			}

			.stack .column {
				width: 100%;
				display: block;
			}

			.mobile_hide {
				min-height: 0;
				max-height: 0;
				max-width: 0;
				overflow: hidden;
				font-size: 0px;
			}

			.desktop_hide,
			.desktop_hide table {
				display: table !important;
				max-height: none !important;
			}
		}
	</style>
</head>

<body style="background-color: transparent; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
	<table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: transparent;">
		<tbody>
			<tr>
				<td>
					<table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
													<table class="heading_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="width:100%;text-align:center;">
																<h1 style="margin: 0; color: #2b9361; font-size: 38px; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; line-height: 120%; text-align: left; direction: ltr; font-weight: 700; letter-spacing: normal; margin-top: 0; margin-bottom: 0;"><span class="tinyMce-placeholder">Greeting</span></h1>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#101112;font-size:17px;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;font-weight:400;line-height:120%;text-align:left;direction:ltr;letter-spacing:0px;mso-line-height-alt:20.4px;">
																	<p style="margin: 0; margin-bottom: 16px;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 16px;">${htmlContent}</p>
																	<p style="margin: 0; margin-bottom: 16px;">&nbsp;</p>
																	
																</div>
															</td>
														</tr>
													</table>
													<table class="paragraph_block block-5" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad">
																<div style="color:#101112;font-size:16px;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;font-weight:400;line-height:120%;text-align:left;direction:ltr;letter-spacing:0px;mso-line-height-alt:19.2px;">
																	<p style="margin: 0; margin-bottom: 16px;">&nbsp;</p>
																	<p style="margin: 0; margin-bottom: 16px;">&nbsp;</p>
																	<p style="margin: 0;">&nbsp;</p>
																</div>
															</td>
														</tr>
													</table>
													<table class="image_block block-6" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
																<div class="alignment" align="center" style="line-height:10px"><img src="https://ezmall-bucket.s3.ap-southeast-1.amazonaws.com/EZMallBig2.png" style="display: block; height: auto; border: 0; width: 300px; max-width: 100%;" width="300"></div>
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>
		</tbody>
	</table><!-- End -->
</body>

</html>
    `
    return content
}
