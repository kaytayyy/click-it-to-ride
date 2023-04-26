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

    post: function postJson(url, data) {
      return fetch(url, {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(data),
      }).then(resp => resp.json());
    },
    patch: function patchJson(url, data) {
      return fetch(url, {
        method: "PATCH",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(data),
      }).then(resp => resp.json());
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
  /** ********SALE FORM************************/
  const saleForm = document.getElementById("sale-form");

  saleForm.addEventListener("submit", e => {
    e.preventDefault();
    const sellCar = {
      car_model_year: e.target.year.value,
      car_make: e.target.make.value,
      car_model: e.target.model.value,
      mileage: e.target.mileage.value,
      transmission: e.target.transmission.value,
      color: e.target.color.value,
      price: e.target.price.value,
      condition: e.target.condition.value,
      fuel_type: e.target.fuel_type.value,
    };
    function sendListing(sellCar) {
      fetch(carsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sellCar),
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw response.statusText;
          }
        })
        .then(newCar => renderCarCards(newCar));
    }
    sendListing(sellCar);
    saleForm.reset();
  });

  /** ********EVENT LISTENERS START**************/
  // search icon click
  document.querySelector("#search-icon").addEventListener("click", () => {
    search.classList.toggle("active");
    menu.classList.remove("active");
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
  // menu icon click
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

  // look for the search form
  search.addEventListener("submit", event => handleSearch(event));

  // next page button
  document.querySelector("#next-cars").addEventListener("click", event => {
    rover
      .fetch(`${carsUrl}?_start=${currentCar.id}&_end=${currentCar.id + 9}`)
      .then(cars => {
        garbageCollector(carsContainer);

        const maxResults = cars.length >= 9 ? 9 : cars.length;
        for (let i = 0; i < maxResults; i++) {
          currentCar = cars[i];
          renderCarCards(cars[i]);
        }
      });
  });

  // previous page button
  document.querySelector("#prev-cars").addEventListener("click", event => {
    const startAt = currentCar.id - 18 < 0 ? 0 : currentCar.id - 18;
    const endAt = startAt + 9;
    rover.fetch(`${carsUrl}?_end=${endAt}&_start=${startAt}`).then(cars => {
      garbageCollector(carsContainer);

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

    const params =
      event.target.value === "" ? "" : `?${filter}=${event.target.value}`;

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
    // there is no significance to fox socks except that it's something I remember and my daughter has been saying it
    const detailsToHide = document.querySelectorAll(
      `.card[data-id="${car.id}"] .fox-socks`,
    );
    // hide all the details sections
    detailsToHide.forEach(detail => detail.classList.add("hide-this"));
    // render the input elements for update
    // price
    document
      .querySelector(`.card[data-id="${car.id}"] img`)
      .insertAdjacentElement(
        "afterend",
        priceInput(
          document.querySelector(`.card[data-id="${car.id}"] .price`)
            .textContent,
        ),
      );

    // year make model
    const yearMakeModelDiv = document.querySelector(
      `.card[data-id="${car.id}"] .car-title-div`,
    );
    Array.from(
      yearMakeModelInputs(car.car_model_year, car.car_make, car.car_model),
    ).forEach(input => {
      yearMakeModelDiv.append(input);
    });

    // condition
    document
      .querySelector(`.card[data-id="${car.id}"] .condition`)
      .append(
        conditionOptions(
          document.querySelector(
            `.card[data-id="${car.id}"]> .condition >.fox-socks`,
          ).textContent,
        ),
      );
    // mileage
    document
      .querySelector(`.card[data-id="${car.id}"] .mileage`)
      .append(
        mileageInput(
          document.querySelector(
            `.card[data-id="${car.id}"]> .mileage >.fox-socks`,
          ).textContent,
        ),
      );
    // transmission
    document
      .querySelector(`.card[data-id="${car.id}"] .transmission`)
      .append(
        transmissionOptions(
          document.querySelector(
            `.card[data-id="${car.id}"]> .transmission >.fox-socks`,
          ).textContent,
        ),
      );
    // fueltype
    document
      .querySelector(`.card[data-id="${car.id}"] .fuel-type`)
      .append(
        fuelOptions(
          document.querySelector(
            `.card[data-id="${car.id}"]> .fuel-type >.fox-socks`,
          ).textContent,
        ),
      );
    // color
    document
      .querySelector(`.card[data-id="${car.id}"] .color`)
      .append(
        colorInput(
          document.querySelector(
            `.card[data-id="${car.id}"]> .color >.fox-socks`,
          ).textContent,
        ),
      );

    // update text on edit button to say "Save"
    document.querySelector(
      `.card[data-id="${car.id}"] #edit-button`,
    ).textContent = "Save";
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
    const card = document.querySelector(`.card[data-id="${car.id}"]`);

    // hide the input

    // unhide all the details sections
    document
      .querySelectorAll(`.card[data-id="${car.id}"] .fox-socks`)
      .forEach(detail => {
        detail.classList.toggle("hide-this");
      });

    const data = {
      car_make: document.querySelector(`.card[data-id="${car.id}"] #make-input`)
        .value,
      car_model: document.querySelector(
        `.card[data-id="${car.id}"] #model-input`,
      ).value,
      car_model_year: document.querySelector(
        `.card[data-id="${car.id}"] #year-input`,
      ).value,
      color: document.querySelector(`.card[data-id="${car.id}"] #color-input`)
        .value,
      mileage: document.querySelector(
        `.card[data-id="${car.id}"] #mileage-input`,
      ).value,
      price: document.querySelector(`.card[data-id="${car.id}"] #price-input`)
        .value,
      transmission: document.querySelector(
        `.card[data-id="${car.id}"] #select-transmission`,
      ).value,
      fuel_type: document.querySelector(
        `.card[data-id="${car.id}"] #select-fuel-type`,
      ).value,
      condition: document.querySelector(
        `.card[data-id="${car.id}"] #select-condition`,
      ).value,
    };
    document
      .querySelectorAll(`.card[data-id="${car.id}"] .edit-inputs`)
      .forEach(input => {
        input.classList.toggle("hide-this");
      });
    // destroy the inputs
    document
      .querySelectorAll(`.card[data-id="${car.id}"] .edit-inputs`)
      .forEach(input => {
        input.remove();
      });
    card.querySelector("#edit-button").textContent = "Edit";
    // WRITE PATCH FUNCTION HERE:
    rover
      .patch(`${carsUrl}/${car.id}`, data)
      .then(car => {
        currentCar = car;
        updateCard(car);
      })
      .catch(err => {
        console.log(err);
      });
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
    // price lives in an h2 with class fox-socks
    document.querySelector(
      `.card[data-id="${car.id}"] h2.fox-socks`,
    ).textContent = car.price;
    // year make model live ni the car-title
    document.querySelector(
      `.card[data-id="${car.id}"] .car-title`,
    ).textContent = `${car.car_model_year} ${car.car_make} ${car.car_model} `;
    // condition
    document.querySelector(
      `.card[data-id="${car.id}"] >.condition > h4`,
    ).textContent = car.condition;

    document.querySelector(
      `.card[data-id="${car.id}"] .mileage > h4`,
    ).textContent = car.mileage;

    document.querySelector(
      `.card[data-id="${car.id}"] .transmission > h4`,
    ).textContent = car.transmission;

    document.querySelector(
      `.card[data-id="${car.id}"] .fuel-type > h4`,
    ).textContent = car.fuel_type;
    currentCar = car;
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

    if (car.image) {
      carImage.src = car.image;
    } else {
      getImage(car.car_model_year, car.car_make, car.car_model, car.color).then(
        image => {
          carImage.src = image.url;
          let data = {image: image.url};
          rover
            .patch(`${carsUrl}/${car.id}`, data)
            .then(updated => console.log(updated));
        },
      );
    }

    //  <!-- price container
    const carPrice = document.createElement("h2");
    carPrice.classList.add("cars-text", "price", "fox-socks");
    carPrice.textContent = `${car.price}`;

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
    carConditionText.textContent = "Condition:";
    carConditionResult.classList.add("fox-socks");
    carConditionResult.textContent = car.condition;
    carConditionDiv.append(carConditionText, carConditionResult);

    //       <!-- mileage-->
    const carMileageDiv = document.createElement("div");
    const carMileageText = document.createElement("h3");
    const carMileageResult = document.createElement("h4");
    carMileageDiv.classList.add("sub-details", "mileage");
    carMileageResult.classList.add("fox-socks");
    carMileageText.textContent = "Mileage:";
    carMileageResult.textContent = car.mileage;
    carMileageDiv.append(carMileageText, carMileageResult);

    //       <!-- transmission -->
    const carTransmissionDiv = document.createElement("div");
    const carTransmissionText = document.createElement("h3");
    const carTransmissionResult = document.createElement("h4");
    carTransmissionDiv.classList.add("sub-details", "transmission");
    carTransmissionResult.classList.add("fox-socks");
    carTransmissionText.textContent = "Transmission:";
    carTransmissionResult.textContent = car.transmission;
    carTransmissionDiv.append(carTransmissionText, carTransmissionResult);

    //       <!-- color-->
    const carColorDiv = document.createElement("div");
    const carColorText = document.createElement("h3");
    const carColorResult = document.createElement("h4");
    carColorDiv.classList.add("sub-details", "color");
    carColorResult.classList.add("fox-socks");
    carColorText.textContent = "Color:";
    carColorResult.textContent = car.color;
    carColorDiv.append(carColorText, carColorResult);

    //      <!-- fuel type-->
    const carFuelTypeDiv = document.createElement("div");
    const carFuelTypeText = document.createElement("h3");
    const carFuelTypeResult = document.createElement("h4");
    carFuelTypeDiv.classList.add("sub-details", "fuel-type");
    carFuelTypeText.textContent = "Fuel Type:";
    carFuelTypeResult.classList.add("fox-socks");
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
  const fuelOptions = currentFuelType => {
    const fuelList = ["Gasoline", "Diesel", "Electric", "Hybrid"];
    // select element for fuelOptions
    const selectFuelType = document.createElement("select");
    const fuelBuilder = fuelList.map(fuel => {
      const option = document.createElement("option");
      option.value = fuel;
      option.textContent = fuel;
      currentFuelType === fuel
        ? option.setAttribute("selected", "selected")
        : "";
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
      const option = document.createElement("option");
      option.value = transmission;
      option.textContent = transmission;
      currentTransmission === transmission
        ? option.setAttribute("selected", "selected")
        : "";
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
      const option = document.createElement("option");
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
      // document.querySelector("#prev-cars").disabled = true;
    });
  }

  initialize();
});
