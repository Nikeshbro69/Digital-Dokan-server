

const generateOtp = ()=>{
    const otp = Math.floor(Math.floor(10000 * Math.random()));
    return otp;
}

export default generateOtp;