addEventListener("DOMContentLoaded", () => {
  /** ********DELIVERABLES START*****************/

  /** ********DELIVERABLES END*******************/

  /** ********VARIABLE DECLARATION START*********/

  // https://{cdn-instance}.imagin.studio/{api-name}?customer={customer-key}&{query parameters}
  const imaginUrl = `https://cdn.imagin.studio/getImage?customer=${config.apikey}&`;
  const carsUrl = "http://localhost:3000/cars/";
  const search = document.querySelector(".search-box");
  const menu = document.querySelector(".navbar");
  const header = document.querySelector("header");
  let currentCar;
  let currentPage;
  const carsPerPage = 9;
  // let isLoggedIn = false;
  const carsContainer = document.querySelector("#cars-container");

  /** ********VARIABLE DECLARATION END***********/

  /** ********FETCH REQUESTS START***************/
  // set up for 3rd party image API
  const imagin = {
    image: function getJSON(url) {
      return fetch(url)
        .then(response => {
          if (response.ok) {
            return response; // this API returns an image, it cannot be parsed into JSON
          } else {
            throw response.statusText;
          }
        })
        .catch(error => console.log(error.message));
    },
  };

  // good ol Rover will fetch whatever you need
  const rover = {
    fetch: function getJSON(url) {
      return fetch(url)
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw response.statusText;
          }
        })
        .catch(error => console.log(error.message));
    },
    //PATCH URL
    patch: function patchJSON(url, data) {
      return fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw response.statusText;
          }
        })
        .catch(error => console.log(error.message));
    },
  };
  /** ********FETCH REQUESTS END*****************/

  /** ********EVENT LISTENERS START**************/
  document.querySelector("#search-icon").addEventListener("click", () => {
    search.classList.toggle("active");
    menu.classList.remove("active");
  });

  document.querySelector("#menu-icon").addEventListener("click", () => {
    menu.classList.toggle("active");
    search.classList.remove("active");
  });

  // Hide Menu And Search Box On Scroll
  window.addEventListener("scroll", () => {
    menu.classList.remove("active");
    search.classList.remove("active");
  });

  // Header - ensure shadow stays away
  window.addEventListener("scroll", () => {
    header.classList.remove("shadow", window.scrollY > 0);
  });
  //once header gets below the car, make the background white so you can see the text
  document.addEventListener("scroll", () => {
    window.pageYOffset > 640
      ? header.classList.add("bg-white")
      : header.classList.remove("bg-slate-50");
  });
  // check for changes in the <SELECT> filter elements
  const yearSelector = document.querySelector("#year");
  yearSelector.addEventListener("change", event => {
    filterList(event);
  });
  const makeSelector = document.querySelector("#make");
  makeSelector.addEventListener("change", event => {
    filterList(event);
  });
  const modelSelector = document.querySelector("#model");
  modelSelector.addEventListener("change", event => {
    filterList(event);
  });

  // look for the search form
  search.addEventListener("submit", event => handleForm(event));

  //login button event listener
  // const loginButton = document.querySelector("#login-btn");

  /** ********EVENT LISTENERS END****************/

  /** ********FORM PROCESSING START**************/
  // handle input from search form
  function handleForm(event) {
    event.preventDefault();

    rover.fetch(`${carsUrl}?q=${event.target.search.value}`).then(cars => {
      garbageCollector(carsContainer);
      for (let i = 0; i < 9; i++) {
        currentCar = cars[i];
        renderCarCards(cars[i]);
      }
    });
  }

  function filterList(event) {
    // only simple filtering right now, not looking at multiple values yet

    const filter =
      event.target.id === "year"
        ? "car_model_year"
        : event.target.id === "make"
        ? "car_make"
        : "car_model";
    const params = `?${filter}=${event.target.value}`;
    // grab the filtered cars array and render the first 9
    rover.fetch(`${carsUrl}${params}`).then(cars => {
      garbageCollector(carsContainer);
      const maxResults = cars.length >= 9 ? 9 : cars.length;
      for (let i = 0; i < maxResults; i++) {
        currentCar = cars[i];
        renderCarCards(cars[i]);
      }
    });
  }

  //editing functionality
  function handleEdit(card, car) {
    const functionsArray = [
      priceInput(car.price),
      yearMakeModelInputs(car.car_model_year, car.car_make, car.car_model),
      conditionOptions(car.condition),
      mileageInput(car.mileage),
      transmissionOptions(car.transmission),
      fuelOptions(car.fuel_type),
      colorInput(car.color),
    ];

    for (let i = 0; i <= 6; i++) {
      if (i === 0) {
        card.childNodes[i + 1].classList.add("hide-this");
        card.childNodes[i].insertAdjacentElement("afterend", functionsArray[i]);
      } else if (i === 1) {
        card.childNodes[i + 2].childNodes[0].classList.add("hide-this");
        functionsArray[i].forEach(input =>
          card.childNodes[i + 2].append(input),
        );
      } else {
        card.childNodes[i + 2].childNodes[1].classList.add("hide-this");
        card.childNodes[i + 2].childNodes[0].insertAdjacentElement(
          "afterend",
          functionsArray[i],
        );
      }
    }
    // const carEditButton = document.querySelector("#edit-button");
    card.childNodes[10].childNodes[0].textContent = "Save";

    //on click edit
    //expose the select element
    //show the same drop down options that exist with add new car
  }
  //delete functionality
  function handleDelete(car) {
    //WRITE THE DELETE FUNCTION HERE
  }

  //PATCH func
  function handleSave(carCard, car) {
    const element = document.querySelector(
      `.card[data-id="${carCard.getAttribute("data-id")}"]`,
    );

    const data = {
      car_make: element.querySelector("#make-input").value,
      car_model: element.querySelector("#model-input").value,
      car_model_year: element.querySelector("#year-input").value,
      color: element.querySelector("#color-input").value,
      mileage: element.querySelector("#mileage-input").value,
      price: element.querySelector("#price-input").value,
      transmission: element.querySelector("#select-transmission").value,
      fuel_type: element.querySelector("#select-fuel-type").value,
      condition: element.querySelector("#select-condition").value,
    };
    //WRITE PATCH FUNCTION HERE:
  }
  /** ********FORM PROCESSING END****************/

  /** ********DOM RENDER FUNCTIONS START*********/
  // pull generated images from third party API
  function getImage(year, make, model, color) {
    const params = `modelYear=${year}&make=${make}&modelFamily=${model}&paintDescription=${color}`;
    // console.log(imaginUrl + params);
    return imagin.image(`${imaginUrl}${params}`);
  }

  function renderCarCards(car) {
    // create elements
    // <!-- Cars Container -->
    // <div class="cars-container container">
    //   <!-- card 1 -->
    //   <div class="card">
    const carCard = document.createElement("div");
    carCard.classList.add("card");
    carCard.setAttribute("data-id", car.id);

    //     <img src="" class="car-image" alt="" />
    const carImage = document.createElement("img");
    carImage.alt = `${car.car_model_year} ${car.car_make} ${car.car_model}`;
    carImage.classList.add("car-image");
    getImage(car.car_model_year, car.car_make, car.car_model, car.color).then(
      image => (carImage.src = image.url),
    );

    //     <h2 class="cars-text price">Car 1</h2>
    const carPrice = document.createElement("h2");
    carPrice.classList.add("cars-text", "price");
    carPrice.textContent = `$${car.price}`;

    //     <div class="details">
    // year
    const carYearMakeModelDiv = document.createElement("div");
    const carYearMakeModelText = document.createElement("h2");
    carYearMakeModelDiv.classList.add("car-title-div");
    carYearMakeModelText.classList.add("car-title");
    carYearMakeModelText.textContent = `${car.car_model_year} ${car.car_make} ${car.car_model} `;
    carYearMakeModelDiv.append(carYearMakeModelText);

    //       <!-- condition -->
    const carConditionDiv = document.createElement("div");
    const carConditionText = document.createElement("h3");
    const carConditionResult = document.createElement("h4");

    carConditionDiv.classList.add("sub-details");
    carConditionText.textContent = "Condition:";
    carConditionResult.textContent = car.condition;
    carConditionDiv.append(carConditionText, carConditionResult);

    //       <!-- mileage-->
    const carMileageDiv = document.createElement("div");
    const carMileageText = document.createElement("h3");
    const carMileageResult = document.createElement("h4");
    carMileageDiv.classList.add("sub-details");
    carMileageText.textContent = "Mileage:";
    carMileageResult.textContent = car.mileage;
    carMileageDiv.append(carMileageText, carMileageResult);

    //       <!-- transmission -->
    const carTransmissionDiv = document.createElement("div");
    const carTransmissionText = document.createElement("h3");
    const carTransmissionResult = document.createElement("h4");
    carTransmissionDiv.classList.add("sub-details");
    carTransmissionText.textContent = "Transmission:";
    carTransmissionResult.textContent = car.transmission;
    carTransmissionDiv.append(carTransmissionText, carTransmissionResult);

    //       <!-- color-->
    const carColorDiv = document.createElement("div");
    const carColorText = document.createElement("h3");
    const carColorResult = document.createElement("h4");
    carColorDiv.classList.add("sub-details");
    carColorText.textContent = "Color:";
    carColorResult.textContent = car.color;
    carColorDiv.append(carColorText, carColorResult);

    //      <!-- fuel type-->
    const carFuelTypeDiv = document.createElement("div");
    const carFuelTypeText = document.createElement("h3");
    const carFuelTypeResult = document.createElement("h4");
    carFuelTypeDiv.classList.add("sub-details");
    carFuelTypeText.textContent = "Fuel Type:";
    carFuelTypeResult.textContent = car.fuel_type;
    carFuelTypeDiv.append(carFuelTypeText, carFuelTypeResult);

    //       <!-- contact us button -->
    const carContactUsDiv = document.createElement("div");
    const carContactUsLink = document.createElement("a");
    const carContactUsButton = document.createElement("input");
    carContactUsButton.classList.add("contact-us-button");
    carContactUsButton.value = "Contact us today!";
    carContactUsLink.append(carContactUsButton);
    carContactUsDiv.append(carContactUsLink);
    //     </div>
    //       <!-- edit/delete buttons -->
    //create
    const carAdminDiv = document.createElement("div");
    const carEditButton = document.createElement("button");
    const carDeleteButton = document.createElement("button");
    //populate
    carAdminDiv.classList.add("admin-button-div");
    carEditButton.id = "edit-button";
    carDeleteButton.id = "delete-button";
    carEditButton.classList.add("admin-btn");
    carDeleteButton.classList.add("admin-btn");
    carEditButton.textContent = "Edit";
    carDeleteButton.textContent = "Delete listing";
    //tracking and event listeners
    currentCar = car;
    carDeleteButton.addEventListener("click", () => handleDelete(car));
    carEditButton.addEventListener("click", () => {
      carEditButton.textContent === "Edit"
        ? handleEdit(carCard, car)
        : handleSave(carCard, car);
    });
    //append
    carAdminDiv.append(carEditButton, carDeleteButton);
    // append to DOM

    carCard.append(
      carImage,
      carPrice,
      carYearMakeModelDiv,
      carConditionDiv,
      carMileageDiv,
      carTransmissionDiv,
      carFuelTypeDiv,
      carColorDiv,
      carContactUsDiv,
      carAdminDiv,
    );
    // carCard.addEventListener("change", () => console.log(car, carCard));
    carsContainer.appendChild(carCard);
  }

  function handleClick(card, element) {
    console.log(element);
  }
  /** ********DOM RENDER FUNCTIONS END***********/

  /** *********GENERAL FUNCTIONS START***********/
  // years filter from array of car_model_years
  function buildYearFilter(cars) {
    const yearsFilter = document.querySelector("#year");
    const uniqueYears = [...new Set(cars.map(car => car.car_model_year))];
    uniqueYears.sort((a, b) => b - a);
    uniqueYears.forEach(year => {
      const yearOption = document.createElement("option");
      yearOption.value = year;
      yearOption.textContent = year;
      yearsFilter.append(yearOption);
    });
  }
  // build filter from array of car_make
  function buildMakeFilter(cars) {
    const makeFilter = document.querySelector("#make");
    const uniqueMakes = [...new Set(cars.map(car => car.car_make))];
    uniqueMakes.sort();
    uniqueMakes.forEach(make => {
      const makeOption = document.createElement("option");
      makeOption.value = make;
      makeOption.textContent = make;
      makeFilter.append(makeOption);
    });
  }

  // build filter from array of car_model
  function buildModelFilter(cars) {
    const modelFilter = document.querySelector("#model");
    const uniqueModels = [...new Set(cars.map(car => car.car_model))];
    uniqueModels.sort();
    uniqueModels.forEach(model => {
      const modelOption = document.createElement("option");
      modelOption.value = model;
      modelOption.textContent = model;
      modelFilter.append(modelOption);
    });
  }

  //build select with options for fuel type of car being edited
  const fuelOptions = currentFuelTyle => {
    const fuelList = ["Gasoline", "Diesel", "Electric", "Hybrid"];
    //select element for fuelOPtions
    const selectFuelType = document.createElement("select");
    const fuelOptions = fuelList.map(fuel => {
      let option = document.createElement("option");
      option.value = fuel;
      option.textContent = fuel;
      selectFuelType.append(option);
    });
    selectFuelType.id = "select-fuel-type";
    return selectFuelType;
  };

  //built select with transmission options for car being edited
  const transmissionOptions = currentTransmission => {
    const transmissionList = ["Automatic", "Manual"];
    //select element for transmission
    const selectTransmission = document.createElement("select");
    const transmissionOptions = transmissionList.map(transmission => {
      let option = document.createElement("option");
      option.value = transmission;
      option.textContent = transmission;
      selectTransmission.append(option);
    });
    selectTransmission.id = "select-transmission";
    return selectTransmission;
  };

  //built a new input for editing mileage
  const mileageInput = currentMileage => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentMileage;
    input.id = "mileage-input";
    return input;
  };

  //built a new input for editing price
  const priceInput = currentPrice => {
    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("cars-text", "price");
    input.textContent = currentPrice;
    input.value = currentPrice;
    input.id = "price-input";
    return input;
  };

  //built a new input for editing color
  const colorInput = currentColor => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentColor;
    input.id = "color-input";
    return input;
  };

  const yearMakeModelInputs = (currentYear, currentMake, currentModel) => {
    const yearInput = document.createElement("input");
    yearInput.classList.add("car-title");
    yearInput.type = "text";
    yearInput.textContent = currentYear;
    yearInput.value = currentYear;
    yearInput.id = "year-input";

    const makeInput = document.createElement("input");
    makeInput.classList.add("car-title");
    makeInput.type = "text";
    makeInput.value = currentMake;
    makeInput.textContent = currentMake;
    makeInput.id = "make-input";

    const modelInput = document.createElement("input");
    modelInput.classList.add("car-title");
    modelInput.type = "text";
    modelInput.value = currentModel;
    modelInput.textContent = currentModel;
    modelInput.id = "model-input";
    return [yearInput, makeInput, modelInput];
  };

  //built select with condition options for car being edited
  const conditionOptions = currentCondition => {
    const conditionList = ["New", "Used", "Certified Pre-Owned"];
    // select element for conditions
    const selectCondition = document.createElement("select");

    const conditionOptions = conditionList.map(condition => {
      let option = document.createElement("option");
      option.value = condition;
      option.textContent = condition;
      currentCondition === condition
        ? option.setAttribute("selected", "selected")
        : "";
      selectCondition.append(option);
    });
    selectCondition.id = "select-condition";
    return selectCondition;
  };
  // oscar the grouch cleaning up
  function garbageCollector(parent) {
    while (parent.hasChildNodes()) {
      parent.removeChild(parent.firstChild);
    }
  }

  /** *********GENERAL FUNCTIONS END*************/

  // start the car sales party
  function initialize() {
    rover.fetch(`${carsUrl}`).then(cars => {
      garbageCollector(carsContainer);

      const currentPage = 1;
      const maxResults = cars.length >= 9 ? 9 : cars.length;
      for (let i = 0; i < maxResults; i++) {
        currentCar = cars[i];
        renderCarCards(cars[i]);
      }

      buildYearFilter(cars);
      buildMakeFilter(cars);
      buildModelFilter(cars);

      document.querySelector("#result_number").textContent = cars.length;
    });
  }

  initialize();
});
