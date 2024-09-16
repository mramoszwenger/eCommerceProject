import passport from 'passport';

export const passportCall = (strategy) => {
    return async (request, response, next) => {
        passport.authenticate(strategy, function(error, user, info){
            if(error) return next(error)
            if(!user){
                return response.status(401).send({error: info.messages ? info.messages : info.toString()})
            }
            request.user = user 
            next()
        })(request, response, next)
    }
}