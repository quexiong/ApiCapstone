const MARVEL_API_URL_COMICS = 'https://gateway.marvel.com:443/v1/public/comics?';
const MARVEL_API_URL_CHARS = 'https://gateway.marvel.com:443/v1/public/characters?';
const privateKey = '1f5fd28b14f8ed93cec944971c0e89717203071f';
const publicKey = '700e41e58c0d4aafcbacc21d5c434f5c';

function q_Char(searchTerm){
	const ts = new Date().getTime();
	return {
		name: `${searchTerm}`,
		ts: ts,
		apikey: publicKey,
		hash: md5(ts+privateKey+publicKey).toString()
	};
}

function q_Char_Random(randomLetter){
	const ts = new Date().getTime();
	return {
		nameStartsWith: randomLetter,
		limit: 100,
		ts: ts,
		apikey: publicKey,
		hash: md5(ts+privateKey+publicKey).toString()
	};
}
function q_Comics(characterID){
	const ts = new Date().getTime();
	return {
		characters: characterID,
		limit: 100,
		ts: ts,
		apikey: publicKey,
		hash: md5(ts+privateKey+publicKey).toString()
	};
}

function comic_template(comicTitle, output){
	return '<span class="coverImg">'+ output + '</span><span class="comicTitle">' + comicTitle + '</span>';
}

function character_template(characterName, output, description){
	return '<div class="row">' +
				'<div class="characterName"><h2>' + characterName + '</h2></div>' +
				'<div class="row">' +
					'<div class="characterImg col-3">' + output + '</div>' +
					'<div class="characterDescription col-9">' + description + '</div>' +
				'</div>' + 	
			'</div>'
}

function reveal(eventListener){
	$(eventListener).css('display', 'block');
}

function conceal(eventListener){
	$(eventListener).css('display', 'none');
}

function sharedShowAll(){
	reveal('#newSearchButton');
	reveal('.characterContainer');
	reveal('.comicsContainer');
}

function sharedConcealAll(){
	conceal('.errorMessage');
	conceal('.comicsContainer');
	conceal('characterContainer');
	conceal('#newSearchButton');
}

// this function handles the "search" button
function submitButton(){
	$('#submitButton').on('click', function(event){
    	event.preventDefault();
    	let query = $('.searchBar').val();
    	$('.searchBar').val("");
    	getAPIData_Characters(query, displayAPIData_Chars);
    	sharedShowAll();
    	conceal('#instructions');
    	$('.searchForm').hide();
  });
}

// this function handles the "random search" button
function submitButtonRandom(){
	$('#submitButtonRandom').on('click', function(event){
    	event.preventDefault();
    	let randomLetter = randomChar();
    	getAPIData_Characters_Random(randomLetter, displayAPIData_Chars_Random);
    	sharedShowAll();
    	conceal('#instructions');
    	$('.searchForm').hide();
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
		$('.characterContainer').empty();
		//$('#resultsTitle').empty();
		//$('#newSearchButton').css('display', 'none');
    	//$('.characterContainer').css('display', 'none');		
    	//$('.comicsContainer').css('display', 'none');
    	$('body').css('background-image', 'url("http://data.1freewallpapers.com/download/avengers.jpg")');
    	//$('#homeTitle').css('display', 'block');
    	reveal('#instructions');
    	//$('.errorMessage').css('display', 'none');
    	$('.comicCarousel').empty();
    	sharedConcealAll();
	});
}

// this function will get JSON data from the Marvel
// API based on a character's name
function getAPIData_Characters(searchTerm, callback){
	$.getJSON(MARVEL_API_URL_CHARS, q_Char(searchTerm), callback);
}

function getAPIData_Characters_Random(randomLetter, callback){
	$.getJSON(MARVEL_API_URL_CHARS, q_Char_Random(randomLetter), callback);
}

function getAPIData_Comics(characterID, callback){
	$.getJSON(MARVEL_API_URL_COMICS, q_Comics(characterID), callback);
}

let characterID = "";

// this function handles displaying character data
// if the user searches for a specific character
function displayAPIData_Chars(data){
	try{
		let characterName = data.data.results[0].name;
		let description = data.data.results[0].description;
		let imgPath = data.data.results[0].thumbnail.path + "/standard_xlarge." + data.data.results[0].thumbnail.extension;
		let output = '<img class="characterThumbnail" src="' + imgPath + '">';
		characterID = data.data.results[0].id;


		if(description === ""){
			description = "Marvel does not provide a description for this character.";
			$('.characterContainer').append(character_template(characterName, output, description));
		}
		else{
			$('.characterContainer').append(character_template(characterName, output, description));
		}
		getAPIData_Comics(characterID, displayAPIData_Comics);
	}

	catch(e){
		if(e instanceof TypeError){
			let errorMessage = '<div class="errorMessage"><p>Invalid Character/Character Does Not Exist.</p> <p>Click on New Search to restart.</p></div>';
			$('#restart').append(errorMessage);
		}
	}
}

// this function handles displaying character data
// if the user searches for a random character
function displayAPIData_Chars_Random(data){
	let randomCharacterArray = data.data.results;
	var randomCharacter = randomCharacterArray[Math.floor(Math.random()*randomCharacterArray.length)];
	let randomCharacterName = randomCharacter.name;
	let description = randomCharacter.description;
	let imgPath = randomCharacter.thumbnail.path + "/standard_xlarge." + randomCharacter.thumbnail.extension;
	let output = '<img class="characterThumbnail" src="' + imgPath + '">';
	characterID = randomCharacter.id;

// Some characters in the Marvel database do not come with descriptions
// so, if they don't have one, I need to display some generic
// message to let the user know there is no description, otherwise, if
// there is a description, then display that description
	if(description === ""){
		description = "Marvel does not provide a description for this character.";
		$('.characterContainer').append(character_template(randomCharacterName, output, description));
	}
	else{
		$('.characterContainer').append(character_template(randomCharacterName, output, description));
	}

// After character data is retrieved, then app should also retrieve
// the comic book data	
	getAPIData_Comics(characterID, displayAPIData_Comics);
}

// this function handles displaying comic data
function displayAPIData_Comics(data){
	let comicArray = data.data.results;
	console.log(comicArray);
	//let selectedNumbers = [];
	//let randomNum;
	let noComics = "Marvel does not provide comic book data for this character."
	//randomComicNumber(comicArray);

	// function randomComicNumber(array){
	// 	randomNum = Math.floor(Math.random() * array.length);
	// 	return randomNum;
	// }

	if(comicArray.length < 1){
		$('.comicsContainer').append(noComics);
	}
	
	// something is wrong with this if-loop -- use Doctor Faustus as example
	// if(comicArray.length > 50){
	// 	for(let i = 0; i < 50; i++){
	// 		if(selectedNumbers.forEach(function(element){}) !== randomNum){
	// 			selectedNumbers.push(randomComicNumber(comicArray));
	// 		}
	// 		else{
	// 			selectedNumbers.push(randomComicNumber(comicArray));
	// 		}
	// 	}
	// 	for(let i = 0; i < selectedNumbers.length; i++){
	// 		let comic = comicArray[selectedNumbers[i]];
	// 		let comicDescription = comic.description;
	// 		let price = comic.prices;
	// 		console.log(price);
	// 		let comicTitle = comic.title;
	// 		let comicCover = comic.thumbnail.path + "/standard_xlarge." + comic.thumbnail.extension;
	// 		let link = comic.urls[0].url; 
	// 		let output = '<a href="' + link + '" target="_blank"> <img class="coverImg" src="' + comicCover + '"></a>';
	// 		if(comicDescription === "" || comicDescription === null){
	// 			let noComicDescription = "Marvel does not provide a description for this Comic";
	// 			let comic_template = 
	// 				'<span class="coverImg">'+ output + '</span><span class="comicTitle">' + comicTitle + '</span>';

	// 			$('.comicCarousel').append(comic_template);
			
	// 		$('.comicsContainer').append(comic_template);
	// 		}
	// 		else{
	// 			let comic_template = 
	// 				'<span class="coverImg">'+ output + '</span><span class="comicTitle">' + comicTitle + '</span>';
			
	// 				$('.comicCarousel').append(comic_template);
	// 		}
	// 	}
	// }

	else{
		comicArray.forEach(function(element){
			let comicTitle = '<h3>' + element.title + '</h3>';
			let comicDescription = element.description;
			let comicCover = element.thumbnail.path + "/standard_xlarge." + element.thumbnail.extension;
			let link = element.urls[0].url; 
			let output = '<a href="' + link + '" target="_blank"> <img class="coverImg" src="' + comicCover + '"></a>';
			
			if(comicDescription === "" || comicDescription === null){
				// comicDescription = "Marvel does not provide a description for this Comic";
				// let comic_template = 
				// 	'<span class="coverImg">' + output + '</span><span class="comicTitle">' + comicTitle + '</span>'; 
			
			$('.comicCarousel').append(comic_template(comicTitle, output));
			}
			else{
				// let comic_template = 
				// 	'<span class="coverImg">'+ output + '</span><span class="comicTitle">' + comicTitle + '</span>';
			
					$('.comicCarousel').append(comic_template(comicTitle, output));
			}
		});
	}
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