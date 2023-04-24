# click-it-to-ride

# Click It To Ride

Simple single-page app demonstrating fetch API calls

## Description

This is a general mock-up of a car sales site designed to demonstrate fetch API calls (GET, POST, PATCH, and DELETE). There is an internal database (db.json) and a connection to a third-party API that renders images on demand based on vehicle values sent to the server.

## Getting Started

Make sure you have an APIKEY from Imagin Studio

### Dependencies

- [json-server](https://www.npmjs.com/package/json-server)
- [tailwindcss](https://tailwindcss.com/)
- [postcss](https://www.npmjs.com/package/postcss)
- [autoprefixer](https://github.com/postcss/autoprefixer)

- API KEY IS NEEDED FROM [imagin.studio](https://www.imagin.studio/). This is needed for the car image rendering to work. This APIKEY is referenced in index.js by config.apikey.

### Modifying the source requires the above dependencies

Files to be modified include:

- HTML
  - ./dist/index.html
- CSS
  - ./src/style.css
- JavaScript
  - ./dist/assets/index.js

```
npm install
```

to start the Tailwind watcher

```
npm run watch
```

to run PostCSS after changes

```
npm run build
```

### Executing program

From the main package directory run:

```
json-server --watch ./dist/assets/db.json
```

Then start up Live Server or other method of viewing the page.

### Help

If there is an error with the json-server, check that the db.json is in the right place and that there is nothing else running on port 3000

## Authors

- Katie Smith
- Vahan Nadjarian
- Matthew Brouwer
- Jenson Thottathil
- Michael Loomis

## Version History

- 0.1
  - Initial Release

## License

This project is not licensed for any legitimate usage other than your own learning and amusement.

## Acknowledgments

Inspiration, code snippets, etc.

- [awesome-readme](https://github.com/matiassingers/awesome-readme)
- [code bless you](https://www.skillshare.com/en/profile/Code-Bless-You/450612786)
- [imagin.studio](https://www.imagin.studio/)
- [Hanson Lu on Unsplash](https://unsplash.com/photos/956EmlIRARQ?utm_source=unsplash&utm_medium=referral&utm_content=creditShareLink)
- =======
  Welcome to Click It to Ride!
  We all have to search for a car at some point in our lives, possibly multiple times.
  Why not make it a simple search?
  With Click It to Ride, all you have to do is enter in your preferences and Boom! You have a car fitting your needs.
