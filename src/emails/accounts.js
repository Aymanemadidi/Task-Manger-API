const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDFRID_API_KEY);

const sendWelcomeEmail = (email, name) =>{
    sgMail.send({
        to: email,
        from: 'aymanelmadidi@gmail.com',
        subject: 'This my first creation',
        text: 'Welcome' + name
    })
}


const sendCancelEmail = (email, name) =>{
    sgMail.send({
        to: email,
        from: 'aymanelmadidi@gmail.com',
        subject: 'This my first creation',
        text: 'booooooooooooo' + name
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}