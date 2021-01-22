const mongoose = require('mongoose');
const dotenv = require('dotenv');

// import environmental variables from our variables.env file
dotenv.config({ path: 'variables.env' });

// Connect to our Database and handle a bad connections
const db = process.env.DATABASE_LOCAL;

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
