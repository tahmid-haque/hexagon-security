const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const { requireAuth } = require('./middleware/authMiddleware');
const sanitize = require('mongo-sanitize');
const helmet = require('helmet');
const isProd = process.env.NODE_ENV === 'production';

function cleanBody(req, res, next) {
    req.body = sanitize(req.body);
    next();
}
const app = express();
app.use(helmet());

const allowedOrigins = [
    'https://hexagon-web.xyz',
    'chrome-extension://cpionbifpgemolinhilabicjppibdhck',
];

if (!isProd) allowedOrigins.push('http://localhost:4000');

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                return callback(
                    new Error(
                        'The CORS policy for this site does not allow access from the specified Origin.'
                    ),
                    false
                );
            }
            return callback(null, true);
        },
    })
);
app.use(express.json());

mongoose.set('sanitizeFilter', true); // prevents noSQL injection
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.once('open', () => {
    console.log('connected to database');
});

app.use(
    '/api/graphql',
    requireAuth,
    cleanBody,
    graphqlHTTP({
        schema: schema,
        graphiql: true,
        customFormatErrorFn: (err) => {
            // custom error formatter for graphql responses
            const formattedError = {
                ...err,
                extensions: {
                    ...err.extensions,
                    status: err.extensions.status ?? 500,
                },
            };
            const message = {
                ...err,
                ...err.extensions,
                status: err.extensions.status ?? 500,
            };
            delete message.extensions;
            return {
                ...formattedError,
                message: JSON.stringify(message),
            };
        },
    })
);

app.use('/api/auth', authRoutes);

const PORT = 4000;

app.listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log('HTTP server on http://localhost:%s', PORT);
});
