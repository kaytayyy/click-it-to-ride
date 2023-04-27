# Click It To Ride

Single-page app demonstrating fetch API calls while we try to sell you a car.

## Description

This is a general mock-up of a car sales site designed to demonstrate fetch API calls (GET, POST, PATCH, and DELETE). There is an internal database (db.json) and a connection to a third-party API that renders images on demand based on vehicle values sent to the server.

## Getting Started

### Dependencies

* [json-server](https://www.npmjs.com/package/json-server)
* [tailwindcss](https://tailwindcss.com/)
* [postcss](https://www.npmjs.com/package/postcss)
* [autoprefixer](https://github.com/postcss/autoprefixer)

### Modifying the source requires the above dependencies
```
npm install
```

### Executing program
When making changes, edit the style.css file in the ./src folder only. Tailwind will rebuild the one in the ./dist folder

From the package folder run:
```
json-server --watch ./dist/assets/db.json
```

## Authors

- Katie Smith
- Vahan Nadjarian  
- Matthew Brouwer  
- Jenson Thottathil
- Michael Loomis 

## Version History

* 0.3
	* enhanced search by year,make,model
	* edit listings with admin privileges
	* form validation via HTML5 and JS
	* mobile responsiveness improved
	* added links to our CITR social media sites
* 0.2
	* MVP presentation
	* all CRUD functionality
	* generic search feature
	* basic filtering
* 0.1
    * Initial Release

## License

This project is not licensed for any legitimate usage other than your own learning and amusement.

## Acknowledgments

Inspiration, code snippets, etc.
* [awesome-readme](https://github.com/matiassingers/awesome-readme)
* [code bless you](https://www.skillshare.com/en/profile/Code-Bless-You/450612786)
* [imagin.studio](https://www.imagin.studio/)
* [Hanson Lu on Unsplash](https://unsplash.com/photos/956EmlIRARQ?utm_source=unsplash&utm_medium=referral&utm_content=creditShareLink)
* 