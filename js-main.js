"use strict";

const baseURL = "https://api.petfinder.com/v2/animals?organization=";
const petFinderKey = "hyDKKrJw4KAbju7PD8zWfVSWrwPpl0arsHp9w1KbGFtB8Rqw8l";
const petFinderSecret = "oMxNdOPgKqXJWXVVbKf2Vjfy0QwQoKSbFzFNWf7t";
const wikiURL =
  "https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&iwurl&prop=extracts&generator=prefixsearch&exchars=1200&exlimit=1&exintro=10&explaintext=1&gpsnamespace=0&gpslimit=1&gpssearch=";
//' https://en.wikipedia.org/w/api.php?action=query&list=search&prop=extracts&exintro&explaintext&utf8=&format=json&origin=*&srlimit=20&srsearch='

function formatQueryParams(params) {
  const queryItems = Object.keys(params).map(
    (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  );
  return queryItems.join("&");
}

function displayResults(response) {
  console.log(response);
  $("#results-list").empty();
  for (let i = 0; i < response.animals.length; i++) {
    $("#results-list").append(
      `<li><h2>${response.animals[i].name}</h2>
      <h3 id = "breed${response.animals[i].id}">${
        response.animals[i].breeds.primary
      }</h3>
      <div clas="dogPic">
      <img src="${
        response.animals[i].photos.map((x) => x.medium)[0]
          ? response.animals[i].photos.map((x) => x.medium)[0]
          : getDefaultImage()
      }" alt="A picure of a dog with ${
        response.animals[i].breeds.primary
      } as it's primary breed">
      </div>
      <p>${
        response.animals[i].description
          ? response.animals[i].description
          : getDefaultDescription()
      } </p>
           <div>
        <button class="moreInfo button" id="${
          response.animals[i].id
        }">Primay Breed Info</button>
   <button title="button title" class="button" onclick=" window.open('${
     response.animals[i].url
   }', '_blank'); return false;">More info about me!</button>
          <div class="wiki" id=results${response.animals[i].id}> 
        </div>
    </li>`
    );
  }
  $("#results").removeClass("hidden");
  watchResults();
}

function getDefaultImage() {
  return "dog-1532627_640.png";
}

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
      console.log("token", data);
      return fetch(url, {
        headers: {
          Authorization: data.token_type + " " + data.access_token,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
    })
    .then(function (resp) {
      // Return the API response as JSON
      return resp.json();
    })
    .then(function (data) {
      // Log the pet data
      console.log("pets", data);
      displayResults(data);
    })
    .catch(function (err) {
      // Log any errors
      console.log("something went wrong", err);
      fetch("");
    });
}

function getWikiPets(breed, id) {
  let searchURL = wikiURL + breed;
  fetch(searchURL)
    .then(function (wikiData) {
      return wikiData.json();
    })
    .then(function (wikiData) {
      console.log(wikiData);
      displayWiki(wikiData, id);
    })
    .catch(function (err) {
      console.log("something went wrong", err);
    });
}

function displayWiki(wikiData, id) {
  let pageID = Object.keys(wikiData.query.pages)[0];
  let data = wikiData.query.pages[pageID];

  $("#results" + id).append(
    `<li>
    <h2>${data.title}
    </li>
    <li>
    <p>${data.extract ? data.extract : getDefaultWiki()}</p>
    <a href="https://en.wikipedia.org/?curid=${pageID}" target="_blank"> MORE info on this breed...</a>
      </li>`
  );
}
function getDefaultWiki() {
  return "Please click the More Info on this Breed Button";
}
function watchResults() {
  $(".moreInfo").click(function () {
    let id = this.id;
    console.log(id); // or alert($(this).attr('id'));
    // $(`#breed${id}`).text()
    let breed = document.getElementById("breed" + id).textContent;
    console.log(breed);
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
