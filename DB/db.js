const mongoose = require('mongoose')

module.exports = async function () {
    try {
        await mongoose.connect(process.env.MURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, () => {
            console.log("Database Connected")
        })
    } catch (error) {
        console.log('Database Error');
        console.log(error)
    }
}

