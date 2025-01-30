const nodemailer = require('nodemailer');
const dotenv = require('dotenv');


dotenv.config();


const transporter = nodemailer.createTransport({
  service: 'gmail',  
  port: 465,         
  auth: {
    user: process.env.EMAIL_USER,  
    pass: process.env.EMAIL_PASS,  
  },
  secure: true,  
});


const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,  
    to,                           
    subject,                      
    text,                         
  };

  try {
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info;  
  } catch (error) {
    
    console.error('Error sending email:', error);
    throw error;  
  }
};


module.exports = sendEmail;