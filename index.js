const MARVEL_API_URL_COMICS = 'https://gateway.marvel.com:443/v1/public/comics?';
const MARVEL_API_URL_CHARS = 'https://gateway.marvel.com:443/v1/public/characters?';
const privateKey = '1f5fd28b14f8ed93cec944971c0e89717203071f';
const publicKey = '700e41e58c0d4aafcbacc21d5c434f5c';
var ts = new Date().getTime();
var md5 = md5(ts+privateKey+publicKey).toString();
var characterID = "";

// this function handles the "search" button
function submitButton(){
	$('#submitButton').on('click', function(event){
    	event.preventDefault();
    	let query = $('.searchBar').val();
    	$('.searchBar').val("");
    	getAPIData_Characters(query, displayAPIData_Chars);
    	$('.searchForm').hide();
    	$('#newSearchButton').css('display', 'block');
    	$('.thumbnailContainer').css('display', 'block');
    	$('.descriptionContainer').css('display', 'block');
    	$('.comicsContainer').css('display', 'block');
    	$('body').css('background-image', 'url("")');
    	$('#homeTitle').css('display', 'none');
  });
}

// this function handles the "random search" button
function submitButtonRandom(){
	$('#submitButtonRandom').on('click', function(event){
    	event.preventDefault();
    	let randomLetter = randomChar();
    	getAPIData_Characters_Random(randomLetter, displayAPIData_Chars_Random);
    	$('.searchForm').hide();
    	$('#newSearchButton').css('display', 'block');
    	$('.thumbnailContainer').css('display', 'block');
    	$('.descriptionContainer').css('display', 'block');
    	$('.comicsContainer').css('display', 'block');
    	$('body').css('background-image', 'url("")');
    	$('#homeTitle').css('display', 'none');
  });
}

// this function handles the "new search" button
// such that it removes the data from the previous
// search, then updates the DOM to display the 
// original search form
function newSearch(){
	$('#newSearchButton').on('click', function(event){
		event.preventDefault();
		$('.searchForm').show();
		$('.thumbnailContainer').empty();
		$('.characterDescription').empty();
		$('.comicsContainer').empty();
		$('#resultsTitle').empty();
		$('#newSearchButton').css('display', 'none');
		$('.thumbnailContainer').css('display', 'none');
		$('.descriptionContainer').css('display', 'none');
    	$('.comicsContainer').css('display', 'none');
    	$('body').css('background-image', 'url("https://images5.alphacoders.com/659/thumb-1920-659840.jpg")');
    	$('#homeTitle').css('display', 'block');

	});
}

// this function will get JSON data from the Marvel
// API based on a character's name
function getAPIData_Characters(searchTerm, callback){
  const query = {
  		'name': `${searchTerm}`,
    	'ts': ts,
    	'apikey': publicKey,
    	'hash': md5
  };
  $.getJSON(MARVEL_API_URL_CHARS, query, callback);
}

// this function will get JSON data from the Marvel
// API for a randomly selected character based on a
// randomly selected letter
function getAPIData_Characters_Random(randomLetter, callback){
  const query = {
  		'nameStartsWith': randomLetter,
  		'limit': 100,
    	'ts': ts,
    	'apikey': publicKey,
    	'hash': md5
  };
  $.getJSON(MARVEL_API_URL_CHARS, query, callback);
}

// this function will get JSON data from the Marvel
// API for comics that a certain character appears in
function getAPIData_Comics(characterID, callback){
	const query = {
   		'characters': characterID, //ex. 1011334 - will return comic data based on character ID
    	'limit': 100,
    	'ts': ts,
    	'apikey': publicKey,
    	'hash': md5
  };
  $.getJSON(MARVEL_API_URL_COMICS, query, callback);		
}

// this function handles displaying character data
// if the user searches for a specific character
function displayAPIData_Chars(data){
	try{
		let characterName = data.data.results[0].name;
		let description = data.data.results[0].description;
		let imgPath = data.data.results[0].thumbnail.path + "/standard_xlarge." + data.data.results[0].thumbnail.extension;
		let output = '<img src="' + imgPath + '">';
		characterID = data.data.results[0].id;

		if(description === ""){
			$('#resultsTitle').append(characterName);
			$('.thumbnailContainer').append(output);
			let noDescription = "Marvel does not provide a description for this character.";
			$('.characterDescription').append(noDescription);
		}
		else{
			$('#resultsTitle').append(characterName);
			$('.thumbnailContainer').append(output);
			$('.characterDescription').append(description);
		}
		getAPIData_Comics(characterID, displayAPIData_Comics);
	}

	catch(e){
		if(e instanceof TypeError){
			console.log("type error");
		}
	}
}


// this function handles displaying character data
// if the user searches for a random character
function displayAPIData_Chars_Random(data){
	let randomCharacterArray = data.data.results;
	var randomCharacter = randomCharacterArray[Math.floor(Math.random()*randomCharacterArray.length)];
	//console.log(randomCharacterArray);
	//console.log(randomCharacter);

	let description = randomCharacter.description;
	let imgPath = randomCharacter.thumbnail.path + "/standard_xlarge." + randomCharacter.thumbnail.extension;
	let output = '<img src="' + imgPath + '">';
	characterID = randomCharacter.id;

// Some characters in the Marvel database do not come with descriptions
// so, if they don't have one, I need to display some generic
// message to let the user know there is no description, otherwise, if
// there is a description, then display that description
	if(description === ""){
		$('#resultsTitle').append(randomCharacter.name);
		$('.thumbnailContainer').append(output);
		let noDescription = "Marvel does not provide a description for this character.";
		$('.characterDescription').append(noDescription);
	}
	else{
		$('#resultsTitle').append(randomCharacter.name);
		$('.thumbnailContainer').append(output);
		$('.characterDescription').append(description);
	}

// After character data is retrieved, then app should also retrieve
// the comic book data	
	getAPIData_Comics(characterID, displayAPIData_Comics);
}

// this function handles displaying comic data
function displayAPIData_Comics(data){
	let comicArray = data.data.results;
	//console.log(comicArray);
	let selectedNumbers = [];
	let randomNum;
	let noComics = "Marvel does not provide comic book data for this character."
	randomComicNumber(comicArray);

	function randomComicNumber(array){
		randomNum = Math.floor(Math.random() * array.length);
		return randomNum;
	}

	if(comicArray.length < 1){
		$('.comicsContainer').append(noComics);
	}
	
	// something is wrong with this if-loop -- use Doctor Faustus as example
	if(comicArray.length > 4){
		for(let i = 0; i < 4; i++){
			if(selectedNumbers.forEach(function(element){}) !== randomNum){
				selectedNumbers.push(randomComicNumber(comicArray));
			}
			else{
				selectedNumbers.push(randomComicNumber(comicArray));
			}
		}
		for(let i = 0; i < selectedNumbers.length; i++){
			let comic = comicArray[selectedNumbers[i]];
			let comicDescription = comic.description;
			console.log(comicDescription);
			let comicTitle = '<h3>' + comic.title + '</h3>';
			let comicCover = comic.thumbnail.path + "/standard_xlarge." + comic.thumbnail.extension;
			let link = comic.urls[0].url; 
			let output = '<a href="' + link + '" target="_blank"> <img class="coverImg" src="' + comicCover + '"></a>';
			//let comicOutput = '<div class="col-6">' + comicTitle + output + '</div>'
			if(comicDescription === "" || comicDescription === null){
				let noComicDescription = "Marvel does not provide a description for this Comic";
				let comic_template = 
					'<div class="row">' +
						'<div class="comicTitle">' + comicTitle + '</div>' +
						'<div class="row">' +
							'<div class="comicCoverImg col-3">' + output + '</div>' +
							'<div class="comicDescription col-9">' + noComicDescription + '</div>' +
						'</div>' + 	
					'</div>';
			
			$('.comicsContainer').append(comic_template);
			}
			else{
				let comic_template = 
					'<div class="row">' +
						'<div class="comicTitle">' + comicTitle + '</div>' +
						'<div class="row">' +
							'<div class="comicCoverImg col-3">' + output + '</div>' +
							'<div class="comicDescription col-9">' + comicDescription + '</div>' +
						'</div>' + 	
					'</div>';
			
					$('.comicsContainer').append(comic_template);
			}
		}
	}

	else{
		comicArray.forEach(function(element){
			let comicTitle = '<h3>' + element.title + '</h3>';
			let comicDescription = element.description;
			let comicCover = element.thumbnail.path + "/standard_xlarge." + element.thumbnail.extension;
			let link = element.urls[0].url; 
			let output = '<a href="' + link + '" target="_blank"> <img class="coverImg" src="' + comicCover + '"></a>';
			
			if(comicDescription === "" || comicDescription === null){
				let noComicDescription = "Marvel does not provide a description for this Comic";
				let comic_template = 
					'<div class="row">' +
						'<div class="comicTitle">' + comicTitle + '</div>' +
						'<div class="row">' +
							'<div class="comicCoverImg col-3">' + output + '</div>' +
							'<div class="comicDescription col-9">' + noComicDescription + '</div>' +
						'</div>' + 	
					'</div>';
			
			$('.comicsContainer').append(comic_template);
			}
			else{
				let comic_template = 
					'<div class="row">' +
						'<div class="comicTitle">' + comicTitle + '</div>' +
						'<div class="row">' +
							'<div class="comicCoverImg col-3">' + output + '</div>' +
							'<div class="comicDescription col-9">' + comicDescription + '</div>' +
						'</div>' + 	
					'</div>';
			
					$('.comicsContainer').append(comic_template);
			}
		});
	}
	//console.log(comicArray);
	//console.log(selectedNumbers);
}

function randomChar(){
  	var randomLetter = "";
  	var possible = "abcdefghijklmnopqrstuvwxyz";
	randomLetter += possible.charAt(Math.floor(Math.random() * possible.length));

  	return randomLetter;
}

function start(){
	submitButton();
	submitButtonRandom();
	newSearch();
	randomChar();
}

$(start);