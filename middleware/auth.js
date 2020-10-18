const db = require('../db');
const User = db.User;
const TokenDB = db.Token;
const auth = require('../auth');

function getToken(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') { // Authorization: Bearer g1jipjgi1ifjioj
        // Handle token presented as a Bearer token in the Authorization header
        return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        // Handle token presented as URI param
        return req.query.token;
    }
    // If we return null, we couldn't find a token.
    // In this case, the JWT middleware will return a 401 (unauthorized) to the client for this request
    return null;
}

module.exports = async function(req,res,next) {
    try {
        try {
            let token = await auth.verify(req.token, {ignoreExpiration: !!req.cookies['loci_auth']});

            req.user = token.data;
            req.clientID = token.data[0].clientID;
        } catch (err) {
            let token = await auth.verify(req.token, {ignoreExpiration: true});
            let userID = token.sub;

            if(err.name === 'TokenExpiredError' && req.refreshToken
                && await TokenDB.findOne({userID: userID, 'tokens.tokenID': req.refreshToken})) {
                req.user = await User.findByClient(userID);
                req.token = auth.sign(userID, req.user);
                res.cookie('loci_auth', {userID: userID, token: req.token, refreshToken: req.refreshToken},
                    {expires: new Date(Date.now() + 8 * 3600000), httpOnly: true});
            }

        }

        if(!req.user) {
            throw new Error("Not authorized");
        }
        next();
    }
    catch (err) {
        console.log(err);
        res.status(401).json(new Error("Not authorized"));
    }
};