
function getCookieTokens(req) {
    return req.cookies['loci_auth'];
}

module.exports = function(req,res,next) {
        let cookie = getCookieTokens(req);
        if(!req.token && cookie) {
            req.token = cookie.token;
        }
        if(!req.refreshToken && cookie && cookie.refreshToken) {
            req.refreshToken = cookie.refreshToken;
        }
        next();
}