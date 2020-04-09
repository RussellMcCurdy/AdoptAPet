'use strict'

const baseURL = 'https://api.petfinder.com/v2/animals?organization=';
const petFinderKey = 'hyDKKrJw4KAbju7PD8zWfVSWrwPpl0arsHp9w1KbGFtB8Rqw8l';
const petFinderSecret = 'oMxNdOPgKqXJWXVVbKf2Vjfy0QwQoKSbFzFNWf7t';



function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function displayResults(responseJson) {
  console.log(responseJson);
  $('#results-list').empty();
  for (let i = 0; i < responseJson.animals.length; i++){
    $('#results-list').append(
      `<li><h2>${responseJson.animals[i].name}</h2>
      <h3>${responseJson.animals[i].breeds.primary}</h3>
      <div clas="dogPic">
      <img src="${responseJson.animals[i].photos.map(x => x.medium)}" alt="A picure of a dog with ${responseJson.animals[i].breeds.primary} as it's primary breed">
      </div>
      <p>${responseJson.animals[i].description}</p>
      </li>`
    )};
  $('#results').removeClass('hidden');
}

function getPets(zip, type, breed, limit=20) {

    let url = 'https://api.petfinder.com/v2/animals?location=' + zip +'&' + 'limit=' + limit;
    url += (type != '' ?  '&type=' + type : '');
    url += (breed != '' ?  '&breed=' + breed : '');
    // statement ? '' : '';
    // if(statement){''}else{''}

// Call the API
// This is a POST request, because we need the API to generate a new token for us
fetch('https://api.petfinder.com/v2/oauth2/token', {
	method: 'POST',
	body: 'grant_type=client_credentials&client_id=' + petFinderKey + '&client_secret=' + petFinderSecret,
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded'
	}
}).then(function (resp) {

    return resp.json();
    
}).then(function (data) {

	console.log('token', data);
    return fetch(url,  {
		headers: {
			'Authorization': data.token_type + ' ' + data.access_token,
			'Content-Type': 'application/x-www-form-urlencoded'
		}
    });

}).then(function (resp) {

	// Return the API response as JSON
	return resp.json();

}).then(function (data) {

	// Log the pet data
    console.log('pets', data);
    displayResults(data);

}).catch(function (err) {

	// Log any errors
	console.log('something went wrong', err);
})}




function watchForm() {
  $('#js-form').submit(event => {
    event.preventDefault();
    const zipCode = $('#zipCode').val().toLowerCase();
    const type = $('#type').val();
    const breed = $('#breed').val();
    getPets(zipCode, type, breed);
  });
}

$(watchForm);