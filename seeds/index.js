const mongoose = require("mongoose")
const Campground = require("../models/campground.js")
const cities = require("./cities")
const { descriptors, places } = require("./seedsHelpers")
const argentinaCities = require('./argentinaCities.json');
require('dotenv').config();
main().catch(err => console.log(err));

async function main() {
    await mongoose.connect("mongodb+srv://sofuya:kY9PGXKKvA768Hq@cluster0.6ryffze.mongodb.net/?retryWrites=true&w=majority")
        .then(console.log("connected to server"))
}

const seedsDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 100; i++) {
        let j = + 4
        let randNumArg = Math.floor(Math.random() * argentinaCities.total)
        let randDescr = Math.floor(Math.random() * descriptors.length)
        let randPlace = Math.floor(Math.random() * places.length)
        let price = Math.floor(Math.random() * 20) + 10
        let coordinates = [argentinaCities.departamentos[randNumArg].centroide.lon, argentinaCities.departamentos[randNumArg].centroide.lat]

        let camp = new Campground({
            location: `${argentinaCities.departamentos[randNumArg].provincia.nombre}, ${argentinaCities.departamentos[randNumArg].nombre}`,
            title: `${descriptors[randDescr].toUpperCase()} ${places[randPlace].toUpperCase()}`,
            images: [
                {
                    url: `https://source.unsplash.com/random/300x300?camping,${i}`,
                    filename: 'random image'
                },
                {
                    url: `https://source.unsplash.com/random/300x300?camping,${j}`,
                    filename: 'random image'
                }
            ],
            price,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto magni vero minus, expedita quia dolore ipsam earum ipsum unde incidunt quod nostrum asperiores delectus libero hic, tempora, consequatur recusandae esse!',
            author: '6324fa732a2e9cdd6fff96eb',
            geometry: {
                type: 'Point',
                coordinates: coordinates
            }
        })

        await camp.save()

    }
}
seedsDB().then(() => mongoose.connection.close())


