const DBHelper = require('../../helper/DBHelper/DBHelper')
const bcrypt = require('../../helper/genSalt')

exports.createVerification = async (user_id, unique_string) => {
    const data = {
        user_id: user_id,
        unique_string: unique_string
    }
    return DBHelper.insertData(data, 'verification', false, null);
}

exports.verify = async (user_id, unique_string) => {
    try {
        let message = ''
        let success = true
        const data = await DBHelper.getData('verification', { user_id: user_id })
        console.log(data)
        if (data && data.length > 0) {
            const hashedUniqueString = data[0].unique_string;
            const isEqual = bcrypt.compare(unique_string, hashedUniqueString);
            if (isEqual) {
                const updatedUserVerified = {
                    id: user_id,
                    verified: true
                }
                await DBHelper.updateData(updatedUserVerified, 'account', 'id')
                await DBHelper.deleteData('verification', { user_id: user_id })
                message = 'Verify successfully. You can now login'
            }
            else {
                message = 'Invalid verification'
                success = false
            }
            
        }
        else {
            message = 'Account record does not exist or has been verified already. Please sign up or log in.'
            success = false
        }

        return { success: success, message: message }
    } catch (error) {
        console.log(error)
        return { success: false, message: error }
    }
}