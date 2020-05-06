"use strict";

const baseURL = "https://api.petfinder.com/v2/animals?organization=";
const petFinderKey = "hyDKKrJw4KAbju7PD8zWfVSWrwPpl0arsHp9w1KbGFtB8Rqw8l";
const petFinderSecret = "oMxNdOPgKqXJWXVVbKf2Vjfy0QwQoKSbFzFNWf7t";
const wikiURL = "https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&iwurl&prop=extracts&generator=prefixsearch&exchars=1200&exlimit=1&exintro=10&explaintext=1&gpsnamespace=0&gpslimit=1&gpssearch=";


function formatQueryParams(params) {
  const queryItems = Object.keys(params).map(
    (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  );
  return queryItems.join("&");
}

function displayResults(response) {
  $("#results-list").empty();
  for (let i = 0; i < response.animals.length; i++) {
    $("#results-list").append(
      `<li><h3 class="name">${response.animals[i].name}</h3>
      <h3 id = "breed${response.animals[i].id}">${
      response.animals[i].breeds.primary
      }</h3>
      <div>
      <img  class="animalPic" src="${
      response.animals[i].photos.map((x) => x.medium)[0]
        ? response.animals[i].photos.map((x) => x.medium)[0]
        : getDefaultImage()
      }" alt="A picure of a dog with ${
      response.animals[i].breeds.primary
      } as it's primary breed">
      </div>
      <p class="description">${
      response.animals[i].description
        ? response.animals[i].description
        : getDefaultDescription()
      } </p>
           <div>
        <button class="moreInfo button" id="${
      response.animals[i].id
      }">Primay Breed Info</button>
   <a href="${response.animals[i].url}" target="_blank" class="moreInfo">More info about me!</a>
          <div class="wiki" id=results${response.animals[i].id}> 
        </div>
    </li>`
    );
  }
  $("#results").removeClass("hidden");
  watchResults();
}
//catches error if there is no image in the json
function getDefaultImage() {
  return "dog-1532627_640.png";
}
//catches error if there is no description in the json
function getDefaultDescription() {
  return "No description. Please click the link below to get more info.";
}

function getPets(zip, type, breed, limit = 50) {
  let url =
    "https://api.petfinder.com/v2/animals?location=" +
    zip +
    "&" +
    "limit=" +
    limit;
  url += type != "" ? "&type=" + type : "";
  url += breed != "" ? "&breed=" + breed : "";
  // statement ? '' : '';
  // if(statement){''}else{''}

  // Call the API
  // This is a POST request, because we need the API to generate a new token for us
  fetch("https://api.petfinder.com/v2/oauth2/token", {
    method: "POST",
    body:
      "grant_type=client_credentials&client_id=" +
      petFinderKey +
      "&client_secret=" +
      petFinderSecret,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then(function (resp) {
      return resp.json();
    })
    .then(function (data) {
      return fetch(url, {
        headers: {
          Authorization: data.token_type + " " + data.access_token,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
    })
    .then(function (resp) {
      if (resp.ok) {
        // Return the API response as JSON
        return resp.json();
      }
      throw new Error(resp.status);
    })
    .then(function (data) {
      // Log the pet data
      displayResults(data);
    })
    .catch(function (err) {
      // Log any errors
      alert("Please enter a valid input, or something went wrong.");
      console.log("something went wrong", err);
    });
}

//calls the wiki API
function getWikiPets(breed, id) {
  const searchURL = wikiURL + breed;
  if (breed == "Mixed Breed") {
    displayWikiError(id);
  }
  else {
    fetch(searchURL)
      .then(function (wikiData) {
        if (wikiData.ok) {
          return wikiData.json();
        }
        throw new Error(wikiData.status)
      })
      .then(function (wikiData) {
        console.log(wikiData);
        if (!wikiData.query) {
          displayWikiError(id);
        }
        else {
          displayWiki(wikiData, id);
        }
      })
      .catch(function (err) {
        diplayWikiError(id);
        console.log("something went wrong", err);
      });
  }
}

//displays a message if the wikipage does not pull up the breed
function displayWikiError(id) {
  $("#results" + id).append(
    `<li>
    <h2>We're sorry</h2>
    </li>
    <li>
    <p>We have no info on this breed at this time.  Please click the \"<b>More info about me!</b>\" button to find out more about this awesome pet</p>
      </li>`
  );
}
//displays wiki data
function displayWiki(wikiData, id) {
  const pageID = Object.keys(wikiData.query.pages)[0];
  const data = wikiData.query.pages[pageID];

  $("#results" + id).append(
    `<li>
    <h2>${data.title}</h2>
    </li>
    <li>
    <p>${data.extract ? data.extract : getDefaultWiki()}</p>
    <a href="https://en.wikipedia.org/?curid=${pageID}" target="_blank" class="breed"> MORE info on this breed...</a>
      </li>`
  );
}
//catches error if wiki returns no data
function getDefaultWiki() {
  return "Please click the More Info on this Breed Button";
}

function watchResults() {
  $(".moreInfo").one("click", function () {
    const id = this.id;
    const breed = document.getElementById("breed" + id).textContent;
    getWikiPets(breed, id);
  });
}

function watchForm() {
  $("#js-form").submit((event) => {
    event.preventDefault();
    const zipCode = $("#zipCode").val().toLowerCase();
    const type = $("#type").val();
    const breed = $("#breed").val();
    getPets(zipCode, type, breed);
  });
}

$(watchForm);
