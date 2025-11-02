const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        });
    }
};

const registeruser = asyncHandler(async (req, res) => {
    // // Quick debug to ensure this route is hit and to inspect incoming data
    // console.log('REGISTERUSER function hit at', new Date().toISOString());
    // console.log('Full req.body:', req.body);

    const { fullname, username, email, password, avatar } = req.body || {};
    console.log('Email from request:', email);

    // Send a distinctive response so you can tell the updated code is running
    // res.status(200).json({
    //     success: true,
    //     message: 'RESPONSE FROM UPDATED CONTROLLER - v1',
    //     receivedEmail: email || null,
    //     receivedBody: req.body || null,
    //     ts: new Date().toISOString()
    // });
});

export { registeruser };