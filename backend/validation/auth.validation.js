const Joi = require('joi');

const registerSchema = Joi.object({
    password: Joi.string()
    .pattern(new RegExp('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/gm')),
})

module.exports = {registerSchema}