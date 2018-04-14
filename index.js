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
	return '<div class="coverImg col-6">'+ comicTitle + output + '</div>';
}

function character_template(characterName, output, description){
	return '<div class="row">' +
				'<div class="characterName"><h2>' + characterName + '</h2></div>' +
				'<div class="row">' +
					'<div class="characterImg col-3">' + output + '</div>' +
					'<div class="characterDescription col-9"><h3>' + description + '</h3></div>' +
				'</div>' + 	
			'</div>';
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

function randomChar(){
  	var randomLetter = "";
  	var possible = "abcdefghijklmnopqrstuvwxyz";
	randomLetter += possible.charAt(Math.floor(Math.random() * possible.length));

  	return randomLetter;
}

// this function handles the "search" button
function submitButton(){
	$('#submitButton').on('click', function(event){
    	event.preventDefault();
    	let query = $('.searchBar').val();
    	if(query === "" || query === null){
    		sharedShowAll();
    		conceal('#instructions');
    		$('.searchForm').hide();
    		let emptyError = '<h2>ERROR! Your search for NOTHING returned NOTHING! Press New Search to search again</h2>'
    		$('.characterContainer').append(emptyError);
    	}
    	else{
    		$('.searchBar').val("");
    		getAPIData_Characters(query, displayAPIData_Chars);
    		sharedShowAll();
    		conceal('#instructions');
    		$('.searchForm').hide();
    	}	
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
function newSearch(){
	$('#newSearchButton').on('click', function(event){
		event.preventDefault();
		$('.searchForm').show();
		$('.characterContainer').empty();
    	$('body').css('background-image', 'url("http://data.1freewallpapers.com/download/avengers.jpg")');
    	reveal('#instructions');
    	$('.comicCarousel').empty();
    	$('.comicsContainer').empty();
    	sharedConcealAll();
    	$('.comicCarousel').append('<div class="loaderBottom hidden"></div>');
    	$('.characterContainer').append('<div class="loaderTop hidden"></div>');
	});
}

function getAPIData_Characters(searchTerm, callback){
	$(".loaderTop").toggleClass("hidden");
	$.getJSON(MARVEL_API_URL_CHARS, q_Char(searchTerm), callback, function(json){
		$(".loaderTop").toggleClass("hidden");
	});
}

function getAPIData_Characters_Random(randomLetter, callback){
	$(".loaderTop").toggleClass("hidden");
	$.getJSON(MARVEL_API_URL_CHARS, q_Char_Random(randomLetter), callback, function(json){
		$(".loaderTop").toggleClass("hidden");
	});
}

function getAPIData_Comics(characterID, callback){
	$(".loaderBottom").toggleClass("hidden");
	$(".loaderTop").toggleClass("hidden")
	$.getJSON(MARVEL_API_URL_COMICS, q_Comics(characterID), callback, function(json){
		$(".loaderBottom").toggleClass("hidden");
	});
}

let characterID = "";
let characterName = "";

// this function handles displaying character data if the user searches for a specific character
function displayAPIData_Chars(data){
	try{
		characterName = data.data.results[0].name;
		let description = data.data.results[0].description;
		let imgPath = data.data.results[0].thumbnail.path + '/standard_xlarge.' + data.data.results[0].thumbnail.extension;
		let output = '<img class="characterThumbnail" src="' + imgPath + '" alt="A thumbnail image of ' + characterName + '">';
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
			$(".loaderTop").toggleClass("hidden");
		}
	}
}

// this function handles displaying character data if the user searches for a random character
function displayAPIData_Chars_Random(data){
	let randomCharacterArray = data.data.results;
	var randomCharacter = randomCharacterArray[Math.floor(Math.random()*randomCharacterArray.length)];
	characterName = randomCharacter.name;
	let description = randomCharacter.description;
	let imgPath = randomCharacter.thumbnail.path + '/standard_xlarge.' + randomCharacter.thumbnail.extension;
	let output = '<img class="characterThumbnail" src="' + imgPath + '" alt="A thumbnail image of ' + characterName + '">';
	characterID = randomCharacter.id;

	if(description === ""){
		description = "Marvel does not provide a description for this character.";
		$('.characterContainer').append(character_template(characterName, output, description));
	}
	else{
		$('.characterContainer').append(character_template(characterName, output, description));
	}
// After character data is retrieved, then app should also retrieve the comic book data	
	getAPIData_Comics(characterID, displayAPIData_Comics);
}

// this function handles displaying comic data
function displayAPIData_Comics(data){
	let comicArray = data.data.results;
	//let characterName = 
	console.log(comicArray);
	let noComics = "Marvel does not provide comic book data for this character."

	function comic_display(characterName, array){
	let character = characterName;
	let comicExists = '<h3>' + character + ' appears in the following comics. Click on the thumbnail to visit the Marvel website to preview the comic book or to purchase it.</h3>';
	let comicNonexists = '<h3>' +character + ' does not appear in any Marvel comic books at this time</h3>';
	if(array.length < 1){
		$('.comicsContainer').append(comicNonexists);
		$('.loaderBottom').toggleClass('hidden');
	}

	else{
		for(let i = 0; i < 50; i++){
		let comicTitle = '<h5>' + comicArray[i].title + '</h5>';
		let comicDescription = comicArray[i].description;
		let comicCover = comicArray[i].thumbnail.path + '/standard_xlarge.' + comicArray[i].thumbnail.extension;
		let link = comicArray[i].urls[0].url; 
		let output = '<a href="' + link + '" target="_blank"> <img class="coverImg" src="' + comicCover + '" alt="Comic book cover"></a>';
		
			if(comicDescription === "" || comicDescription === null){
				$('.comicCarousel').append(comic_template(comicTitle, output));
			}
			else{
				$('.comicCarousel').append(comic_template(comicTitle, output));
			}
		}
			$('.comicsContainer').append(comicExists);
		}
}
	comic_display(characterName, comicArray);
}

function start(){
	submitButton();
	submitButtonRandom();
	newSearch();
	randomChar();
}

$(start);