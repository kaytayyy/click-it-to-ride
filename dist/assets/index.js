/**********DELIVERABLES START*****************/

/**********DELIVERABLES END*******************/

/**********VARIABLE DECLARATION START*********/

//https://{cdn-instance}.imagin.studio/{api-name}?customer={customer-key}&{query parameters}
const imaginUrl = `https://cdn.imagin.studio/getImage?customer=${config.apikey}&`;
const carsUrl = 'http://localhost:3000/cars/';
let search = document.querySelector('.search-box');
let menu = document.querySelector('.navbar');
let header = document.querySelector('header');
let currentCar;
let carsContainer = document.querySelector('#cars-container');
/**********VARIABLE DECLARATION END***********/

/**********FETCH REQUESTS START***************/
//set up for 3rd party image API
const imagin = {
  image: function getJSON(url) {
    return fetch(url)
      .then((response) => {
        if (response.ok) {
          return response; //this API returns an image, it cannot be parsed into JSON
        } else {
          throw response.statusText;
        }
      })
      .catch((error) => console.log(error.message));
  },
};

//good ol Rover will fetch whatever you need
const rover = {
  fetch: function getJSON(url) {
    return fetch(url)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw response.statusText;
        }
      })
      .catch((error) => console.log(error.message));
  },
};
/**********FETCH REQUESTS END*****************/

/**********EVENT LISTENERS START**************/
document.querySelector('#search-icon').addEventListener('click', () => {
  search.classList.toggle('active');
  menu.classList.remove('active');
});

document.querySelector('#menu-icon').addEventListener('click', () => {
  menu.classList.toggle('active');
  search.classList.remove('active');
});

// Hide Menu And Search Box On Scroll
window.addEventListener('scroll', () => {
  menu.classList.remove('active');
  search.classList.remove('active');
});

// Header - ensure shadow stays away
window.addEventListener('scroll', () => {
  header.classList.remove('shadow', window.scrollY > 0);
});

//check for changes in the <SELECT> filter elements
let yearSelector = document.querySelector('#year');
yearSelector.addEventListener('change', (event) => {
  filterList(event);
});
let makeSelector = document.querySelector('#make');
makeSelector.addEventListener('change', (event) => {
  filterList(event);
});
let modelSelector = document.querySelector('#model');
modelSelector.addEventListener('change', (event) => {
  filterList(event);
});

//look for the search form
search.addEventListener('submit', (event) => handleForm(event));
/**********EVENT LISTENERS END****************/

/**********FORM PROCESSING START**************/
//handle input from search form
function handleForm(event) {
  event.preventDefault();

  rover.fetch(`${carsUrl}?q=${event.target['search'].value}`).then((cars) => {
    garbageCollector(carsContainer);
    for (let i = 0; i < 9; i++) {
      currentCar = cars[i];
      renderCarCards(cars[i]);
    }
  });
}

function filterList(event) {
  //only simple filtering right now, not looking at multiple values yet

  let filter =
    event.target.id === 'year'
      ? 'car_model_year'
      : event.target.id === 'make'
      ? 'car_make'
      : 'car_model';
  let params = `?${filter}=${event.target.value}`;
  //grab the filtered cars array and render the first 9
  rover.fetch(`${carsUrl}${params}`).then((cars) => {
    garbageCollector(carsContainer);
    for (let i = 0; i < 9; i++) {
      currentCar = cars[i];
      renderCarCards(cars[i]);
    }
  });
}

function handleClick(event) {
  console.log(event);
}
/**********FORM PROCESSING END****************/

/**********DOM RENDER FUNCTIONS START*********/
//pull generated images from third party API
function getImage(year, make, model) {
  let params = `modelYear=${year}&make=${make}&modelFamily=${model}`;
  console.log(imaginUrl + params);
  return imagin.image(`${imaginUrl}${params}`);
}

function renderCarCards(car) {
  //create elements
  // <!-- Cars Container -->
  // <div class="cars-container container">
  //   <!-- card 1 -->
  //   <div class="card">
  let carCard = document.createElement('div');
  carCard.classList.add('card');
  carCard.setAttribute('data-id', car.id);

  //     <img src="" class="car-image" alt="" />
  let carImage = document.createElement('img');
  carImage.alt = `${car.car_model_year} ${car.car_make} ${car.car_model}`;
  carImage.classList.add('car-image');
  let params = `modelYear=${car.model_year}&make=${car.car_make}&modelFamily=${car.car_model}&paintDescription=${car.color}`;
  carImage.src = `${imaginUrl}${params}`;

  //     <h2 class="cars-text price">Car 1</h2>
  let carPrice = document.createElement('h2');
  carPrice.classList.add('cars-text', 'price');
  carPrice.textContent = `$${car.price}`;

  //     <div class="details">
  //year
  let carYearMakeModelDiv = document.createElement('div');
  let carYearMakeModelText = document.createElement('h2');
  carYearMakeModelText.classList.add('car-title');
  carYearMakeModelText.textContent = `${car.car_model_year} ${car.car_make} ${car.car_model} `;
  carYearMakeModelDiv.append(carYearMakeModelText);

  //       <!-- condition -->
  let carConditionDiv = document.createElement('div');
  let carConditionText = document.createElement('h3');
  let carConditionResult = document.createElement('h4');
  carConditionDiv.classList.add('sub-details');
  carConditionText.textContent = 'Condition:';
  carConditionResult.textContent = car.condition;
  carConditionDiv.append(carConditionText, carConditionResult);

  //       <!-- mileage-->
  let carMileageDiv = document.createElement('div');
  let carMileageText = document.createElement('h3');
  let carMileageResult = document.createElement('h4');
  carMileageDiv.classList.add('sub-details');
  carMileageText.textContent = 'Mileage:';
  carMileageResult.textContent = car.mileage;
  carMileageDiv.append(carMileageText, carMileageResult);

  //       <!-- transmission -->
  let carTransmissionDiv = document.createElement('div');
  let carTransmissionText = document.createElement('h3');
  let carTransmissionResult = document.createElement('h4');
  carTransmissionDiv.classList.add('sub-details');
  carTransmissionText.textContent = 'Transmission:';
  carTransmissionResult.textContent = car.transmission;
  carTransmissionDiv.append(carTransmissionText, carTransmissionResult);

  //       <!-- fuel type -->
  let carColorDiv = document.createElement('div');
  let carColorText = document.createElement('h3');
  let carColorResult = document.createElement('h4');
  carColorDiv.classList.add('sub-details');
  carColorText.textContent = 'Color:';
  carColorResult.textContent = car.color;
  carColorDiv.append(carColorText, carColorResult);

  //       <!-- contact us button -->
  let carContactUsDiv = document.createElement('div');
  let carContactUsLink = document.createElement('a');
  let carContactUsButton = document.createElement('input');
  carContactUsButton.classList.add('contact-us-button');
  carContactUsButton.value = 'Contact us today!';
  carContactUsLink.append(carContactUsButton);
  carContactUsDiv.append(carContactUsLink);
  //     </div>

  //append to DOM
  currentCar = car;
  carCard.append(
    carImage,
    carPrice,
    carYearMakeModelDiv,
    carConditionDiv,
    carMileageDiv,
    carTransmissionDiv,
    carColorDiv,
    carContactUsDiv
  );
  carsContainer.appendChild(carCard);
}
/**********DOM RENDER FUNCTIONS END***********/

/***********GENERAL FUNCTIONS START***********/
//years filter from array of car_model_years
function buildYearFilter(cars) {
  let yearsFilter = document.querySelector('#year');
  let uniqueYears = [...new Set(cars.map((car) => car.car_model_year))];
  uniqueYears.sort((a, b) => b - a);
  uniqueYears.forEach((year) => {
    let yearOption = document.createElement('option');
    yearOption.value = year;
    yearOption.textContent = year;
    yearsFilter.append(yearOption);
  });
}
//build filter from array of car_make
function buildMakeFilter(cars) {
  let makeFilter = document.querySelector('#make');
  let uniqueMakes = [...new Set(cars.map((car) => car.car_make))];
  uniqueMakes.sort();
  uniqueMakes.forEach((make) => {
    let makeOption = document.createElement('option');
    makeOption.value = make;
    makeOption.textContent = make;
    makeFilter.append(makeOption);
  });
}

//build filter from array of car_model
function buildModelFilter(cars) {
  let modelFilter = document.querySelector('#model');
  let uniqueModels = [...new Set(cars.map((car) => car.car_model))];
  uniqueModels.sort();
  uniqueModels.forEach((model) => {
    let modelOption = document.createElement('option');
    modelOption.value = model;
    modelOption.textContent = model;
    modelFilter.append(modelOption);
  });
}

//oscar the grouch cleaning up
function garbageCollector(parent) {
  while (parent.hasChildNodes()) {
    parent.removeChild(parent.firstChild);
  }
}
/***********GENERAL FUNCTIONS END*************/

//start the car sales party
function initialize() {
  rover.fetch(`${carsUrl}`).then((cars) => {
    garbageCollector(carsContainer);
    for (let i = 0; i < 9; i++) {
      currentCar = cars[i];
      renderCarCards(cars[i]);
    }

    buildYearFilter(cars);
    buildMakeFilter(cars);
    buildModelFilter(cars);
  });
}

initialize();
