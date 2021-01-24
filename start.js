const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION!💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

// import environmental variables from our variables.env file
dotenv.config({ path: 'variables.env' });

// Connect to our Database and handle a bad connections
const dbLocal = process.env.DATABASE_LOCAL;

// MongoDB Atlas
const db = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

// mongoose.connect(dbLocal, {
mongoose.connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
    .then(() => console.log('Connected to MongoDB...'));


mongoose.connection.on('error', (err) => {
    console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

// READY?! Let's go!

// import all of our models

// Start our app!
const app = require('./app');

app.set('port', process.env.PORT || 8888);
const server = app.listen(app.get('port'), () => {
    console.log(`Express running → PORT ${server.address().port}`);
});

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION!💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});