import nodemailer from 'nodemailer';

interface IData {
    to : string;
    subject : string;
    text : string;
}

const sendMail = async (data : IData)=>{
    //object return garxa hai createTransport le
    const transporter = nodemailer.createTransport({
        service: 'gmail', //hotmail, yahoo, outlook,etc.
        auth: {
            user : process.env.EMAIL, // your email address
            //pass is not the exact email password, it is the app password generated from your email account settings
            pass : process.env.EMAIL_PASSWORD // your email password
        }
    })

    const mailOptions = {
        from: process.env.EMAIL, // sender address
        to: data.to, // list of receivers
        subject: data.subject, // Subject line
        text: data.text // plain text body
    };
    try {
        await transporter.sendMail(mailOptions)
    } catch (error) {
        console.log('Error sending email:', error);
    }
}

export default sendMail;    