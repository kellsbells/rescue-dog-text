const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const fetch = require("node-fetch");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/sms', (req, res) => {
    const twiml = new MessagingResponse();

    console.log('req.body.Body: ', req.body.Body.toLowerCase());

    const sendDog = function (zipCode) {
        return new Promise(function (resolve) {
            let url = 'http://api.petfinder.com/pet.getRandom';
            url += `?key=c8f9ca2d4894964d1154f0fa768a67da&animal=dog&location=${zipCode}&output=basic&format=json`
            fetch(url)
                .then(res => res.json())
                .then(json => resolve(json.petfinder.pet));
        });
    }

    isZipCode = (zipCode) => {
        return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zipCode);
    }

    if (!isZipCode(req.body.Body)){
        let twiml = new MessagingResponse();
        let msg = twiml.message(`That's not a zipcode!`);
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
    } else {
        sendDog(req.body.Body).then((dog) => {
            console.log('dog: ', dog);

            let twiml = new MessagingResponse();
            

            // Add a text message.
            let msg = twiml.message(
                `${dog.name.$t} Age: ${dog.age.$t} Size: ${dog.size.$t}. Adopt ${dog.name.$t} at ${dog.contact.email.$t}!`
            );
            
            console.log('twiml: ', twiml);
            console.log(dog);
            console.log(dog.contact);

            // Add a picture message.
            msg.media(dog.media.photos.photo[2].$t);

            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.end(twiml.toString());
        })
    }
});



http.createServer(app).listen(1337, () => {
    console.log('Express server listening on port 1337');
});
