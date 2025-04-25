const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
    const authorization = req.headers.authorization;
    const jtoken = authorization.split( " " )[1];
    if ( !jtoken ) {
        res.status( 401 ).json( { message: 'Did not found authorization token' } );
    }
    const isValid = jwt.verify(jtoken, process.env.JWT_SECRET);
    if ( !isValid ) {
        res.status( 401 ).json( { message: 'Invalid authorization token' } );
    }
    req.userId = isValid.id;
    next();
}

module.exports = {
    authenticateUser
}