addEventListener("DOMContentLoaded", () => {
  /** ********DELIVERABLES START*****************/

  /** ********DELIVERABLES END*******************/

  /** ********VARIABLE DECLARATION START*********/

  // https://{cdn-instance}.imagin.studio/{api-name}?customer={customer-key}&{query parameters}
  const imaginUrl = `https://cdn.imagin.studio/getImage?customer=${config.apikey}&`;
  const carsUrl = "http://localhost:3000/cars";
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
    // PATCH URL
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
    // DELETE URL
    sell: function deleteJSON(url) {
      return fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
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
  // once header gets below the car, make the background white so you can see the text
  document.addEventListener("scroll", () => {
    window.pageYOffset > 640
      ? header.classList.add("bg-white")
      : header.classList.remove("bg-white");
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
  search.addEventListener("submit", event => handleSearch(event));

  //next page button
  document.querySelector("#next-cars").addEventListener("click", event => {
    console.log(event, currentCar.id);
    rover
      .fetch(`${carsUrl}?_start=${currentCar.id}&_end=${currentCar.id + 9}`)
      .then(cars => {
        garbageCollector(carsContainer);
        console.log(cars);
        const maxResults = cars.length >= 9 ? 9 : cars.length;
        for (let i = 0; i < maxResults; i++) {
          currentCar = cars[i];
          renderCarCards(cars[i]);
        }
      });
  });

  //previous page button
  document.querySelector("#prev-cars").addEventListener("click", event => {
    console.log(event, currentCar.id);
    let startAt = currentCar.id - 18 < 0 ? 18 - currentCar.id : currentCar.id;
    rover
      .fetch(`${carsUrl}?_end=${currentCar.id - 9}&_start=${startAt}`)
      .then(cars => {
        garbageCollector(carsContainer);
        console.log(cars);
        const maxResults = cars.length >= 9 ? 9 : cars.length;
        for (let i = 0; i < maxResults; i++) {
          currentCar = cars[i];
          renderCarCards(cars[i]);
        }
      });
  });
  /** ********EVENT LISTENERS END****************/

  /** ********FORM PROCESSING START**************/
  // handle input from search form
  function handleSearch(event) {
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

  // editing functionality
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
    // there is no significance to fox socks except that it's something I remember and my daughter has been saying it
    const detailsToHide = document.querySelectorAll(".fox-socks");
    // hide all the details sections
    detailsToHide.forEach(detail => detail.classList.add("hide-this"));
    // render the input elements for update
    // price
    card
      .querySelector("img")
      .insertAdjacentElement("afterend", priceInput(car.price));

    // year make model
    const yearMakeModelDiv = card.querySelector(".car-title-div");
    Array.from(
      yearMakeModelInputs(car.car_model_year, car.car_make, car.car_model),
    ).forEach(input => {
      yearMakeModelDiv.append(input);
    });

    // condition
    card.querySelector(".condition").append(conditionOptions(car.condition));
    // mileage
    card.querySelector(".mileage").append(mileageInput(car.mileage));
    // transmission
    card
      .querySelector(".transmission")
      .append(transmissionOptions(car.transmission));
    // fueltype
    card.querySelector(".fuel-type").append(fuelOptions(car.fuel_type));
    // color
    card.querySelector(".color").append(colorInput(car.color));

    // update text on edit button to say "Save"
    card.querySelector("#edit-button").textContent = "Save";
  }
  // delete functionality
  function handleDelete(car) {
    // WRITE THE DELETE FUNCTION HERE
    const card = document.querySelector(`.card[data-id="${car.id}"]`);

    rover.sell(`${carsUrl}/${car.id}`).then(car => {
      card.remove();
    });
  }
  // PATCH func
  function handleSave(carCard, car) {
    const card = document.querySelector(
      `.card[data-id="${carCard.getAttribute("data-id")}"]`,
    );

    // hide the input
    card.querySelectorAll(".edit-inputs").forEach(input => {
      input.classList.toggle("hide-this");
    });

    // unhide all the details sections
    document
      .querySelectorAll(".fox-socks")
      .forEach(detail => detail.classList.toggle("hide-this"));

    const data = {
      car_make: card.querySelector("#make-input").value,
      car_model: card.querySelector("#model-input").value,
      car_model_year: card.querySelector("#year-input").value,
      color: card.querySelector("#color-input").value,
      mileage: card.querySelector("#mileage-input").value,
      price: card.querySelector("#price-input").value,
      transmission: card.querySelector("#select-transmission").value,
      fuel_type: card.querySelector("#select-fuel-type").value,
      condition: card.querySelector("#select-condition").value,
    };
    card.querySelector("#edit-button").textContent = "Edit";
    // WRITE PATCH FUNCTION HERE:
    // send the response from the patch to updateCard()
  }
  /** ********FORM PROCESSING END****************/

  /** ********DOM RENDER FUNCTIONS START*********/
  // pull generated images from third party API
  function getImage(year, make, model, color) {
    const params = `modelYear=${year}&make=${make}&modelFamily=${model}&paintDescription=${color}`;
    // console.log(imaginUrl + params);
    return imagin.image(`${imaginUrl}${params}`);
  }

  function updateCard(car) {
    const card = document.querySelector(`.card[data-id="${car.id}"]`);
    // price lives in an h2 with class fox-socks
    card.querySelector("h2.fox-socks").textContent = car.price;
    // year make model live ni the car-title
    card.querySelector(
      ".car-title",
    ).textContent = `${car.car_model_year} ${car.car_make} ${car.car_model} `;
    // condition
    card.querySelector(".condition > h4").textContent = car.condition;

    card.querySelector(".mileage > h4").textContent = car.mileage;

    card.querySelector(".transmission > h4").textContent = car.transmission;
  }

  function renderCarCards(car) {
    // create elements
    // <!-- Card -->
    const carCard = document.createElement("div");
    carCard.classList.add("card");
    carCard.setAttribute("data-id", car.id);
    //  <!-- image-->
    const carImage = document.createElement("img");
    carImage.alt = `${car.car_model_year} ${car.car_make} ${car.car_model}`;
    carImage.classList.add("car-image");

    // use imagin API to generate image for the car based on parameters
    getImage(car.car_model_year, car.car_make, car.car_model, car.color).then(
      image => (carImage.src = image.url),
    );

    //  <!-- price container
    const carPrice = document.createElement("h2");
    carPrice.classList.add("cars-text", "price", "fox-socks");
    carPrice.textContent = `$${car.price}`;

    // <!-- DETAILS SECTION
    // year | make | model
    const carYearMakeModelDiv = document.createElement("div");
    const carYearMakeModelText = document.createElement("h2");
    carYearMakeModelDiv.classList.add("car-title-div");
    carYearMakeModelText.classList.add("car-title", "fox-socks");
    carYearMakeModelText.textContent = `${car.car_model_year} ${car.car_make} ${car.car_model} `;
    carYearMakeModelDiv.append(carYearMakeModelText);

    //       <!-- condition -->
    const carConditionDiv = document.createElement("div");
    const carConditionText = document.createElement("h3");
    const carConditionResult = document.createElement("h4");
    carConditionDiv.classList.add("sub-details", "condition");
    carConditionText.classList.add("fox-socks");
    carConditionText.textContent = "Condition:";
    carConditionResult.textContent = car.condition;
    carConditionDiv.append(carConditionText, carConditionResult);

    //       <!-- mileage-->
    const carMileageDiv = document.createElement("div");
    const carMileageText = document.createElement("h3");
    const carMileageResult = document.createElement("h4");
    carMileageDiv.classList.add("sub-details", "mileage");
    carMileageText.classList.add("fox-socks");
    carMileageText.textContent = "Mileage:";
    carMileageResult.textContent = car.mileage;
    carMileageDiv.append(carMileageText, carMileageResult);

    //       <!-- transmission -->
    const carTransmissionDiv = document.createElement("div");
    const carTransmissionText = document.createElement("h3");
    const carTransmissionResult = document.createElement("h4");
    carTransmissionDiv.classList.add("sub-details", "transmission");
    carTransmissionText.classList.add("fox-socks");
    carTransmissionText.textContent = "Transmission:";
    carTransmissionResult.textContent = car.transmission;
    carTransmissionDiv.append(carTransmissionText, carTransmissionResult);

    //       <!-- color-->
    const carColorDiv = document.createElement("div");
    const carColorText = document.createElement("h3");
    const carColorResult = document.createElement("h4");
    carColorDiv.classList.add("sub-details", "color");
    carColorText.classList.add("fox-socks");
    carColorText.textContent = "Color:";
    carColorResult.textContent = car.color;
    carColorDiv.append(carColorText, carColorResult);

    //      <!-- fuel type-->
    const carFuelTypeDiv = document.createElement("div");
    const carFuelTypeText = document.createElement("h3");
    const carFuelTypeResult = document.createElement("h4");
    carFuelTypeDiv.classList.add("sub-details", "fuel-type");
    carFuelTypeText.classList.add("fox-socks");
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

    //       <!-- edit/delete buttons -->
    // create
    const carAdminDiv = document.createElement("div");
    const carEditButton = document.createElement("button");
    const carDeleteButton = document.createElement("button");
    // populate
    carAdminDiv.classList.add("admin-button-div");
    carEditButton.id = "edit-button";
    carDeleteButton.id = "delete-button";
    carEditButton.classList.add("admin-btn");
    carDeleteButton.classList.add("admin-btn");
    carEditButton.textContent = "Edit";
    carDeleteButton.textContent = "Delete listing";
    // tracking and event listeners
    currentCar = car;
    carDeleteButton.addEventListener("click", () => handleDelete(car));
    carEditButton.addEventListener("click", () => {
      carEditButton.textContent === "Edit"
        ? handleEdit(carCard, car)
        : handleSave(carCard, car);
    });
    // append
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

  // build select with options for fuel type of car being edited
  const fuelOptions = currentFuelTyle => {
    const fuelList = ["Gasoline", "Diesel", "Electric", "Hybrid"];
    // select element for fuelOptions
    const selectFuelType = document.createElement("select");
    const fuelBuilder = fuelList.map(fuel => {
      let option = document.createElement("option");
      option.value = fuel;
      option.textContent = fuel;
      selectFuelType.append(option);
    });
    selectFuelType.id = "select-fuel-type";
    selectFuelType.classList.add("edit-inputs");
    return selectFuelType;
  };

  // built select with transmission options for car being edited
  const transmissionOptions = currentTransmission => {
    const transmissionList = ["Automatic", "Manual"];
    // select element for transmission
    const selectTransmission = document.createElement("select");
    const transmissionBuilder = transmissionList.map(transmission => {
      let option = document.createElement("option");
      option.value = transmission;
      option.textContent = transmission;
      selectTransmission.append(option);
    });
    selectTransmission.id = "select-transmission";
    selectTransmission.classList.add("edit-inputs");
    return selectTransmission;
  };

  // built a new input for editing mileage
  const mileageInput = currentMileage => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentMileage;
    input.id = "mileage-input";
    input.classList.add("edit-inputs");
    return input;
  };

  // built a new input for editing price
  const priceInput = currentPrice => {
    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("cars-text", "price");
    input.textContent = currentPrice;
    input.value = currentPrice;
    input.id = "price-input";
    input.classList.add("edit-inputs");
    return input;
  };

  // built a new input for editing color
  const colorInput = currentColor => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentColor;
    input.id = "color-input";
    input.classList.add("edit-inputs");
    return input;
  };

  // allow the year make and model to be editabl;e
  const yearMakeModelInputs = (currentYear, currentMake, currentModel) => {
    const yearInput = document.createElement("input");
    yearInput.classList.add("car-title");
    yearInput.type = "text";
    yearInput.textContent = currentYear;
    yearInput.value = currentYear;
    yearInput.id = "year-input";
    yearInput.classList.add("edit-inputs");

    const makeInput = document.createElement("input");
    makeInput.classList.add("car-title");
    makeInput.type = "text";
    makeInput.value = currentMake;
    makeInput.textContent = currentMake;
    makeInput.id = "make-input";
    makeInput.classList.add("edit-inputs");

    const modelInput = document.createElement("input");
    modelInput.classList.add("car-title");
    modelInput.type = "text";
    modelInput.value = currentModel;
    modelInput.textContent = currentModel;
    modelInput.id = "model-input";
    modelInput.classList.add("edit-inputs");

    return [yearInput, makeInput, modelInput];
  };

  // built select with condition options for car being edited
  const conditionOptions = currentCondition => {
    const conditionList = ["New", "Used", "Certified Pre-Owned"];
    // select element for conditions
    const selectCondition = document.createElement("select");

    const conditionBuilder = conditionList.map(condition => {
      let option = document.createElement("option");
      option.value = condition;
      option.textContent = condition;
      currentCondition === condition
        ? option.setAttribute("selected", "selected")
        : "";
      selectCondition.append(option);
    });
    selectCondition.id = "select-condition";
    selectCondition.classList.add("edit-inputs");
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

      const maxResults = cars.length >= 9 ? 9 : cars.length;
      for (let i = 0; i < maxResults; i++) {
        currentCar = cars[i];
        renderCarCards(cars[i]);
      }

      buildYearFilter(cars);
      buildMakeFilter(cars);
      buildModelFilter(cars);
      document.querySelector("#prev-cars").disabled = true;
    });
  }

  initialize();
});
