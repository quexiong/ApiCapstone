'use strict';

const MARVEL_API_URL_COMICS = 'https://gateway.marvel.com:443/v1/public/comics?';
const MARVEL_API_URL_CHARS = 'https://gateway.marvel.com:443/v1/public/characters?';
const privateKey = '1f5fd28b14f8ed93cec944971c0e89717203071f';
const publicKey = '700e41e58c0d4aafcbacc21d5c434f5c';

let characterID = "";
let characterName = "";
let limit;
let marvelCharactersArray = [];

// autofill section
function autoCompleteSearch(){
	$('.searchBar').keyup(function(event){
		event.preventDefault();
		let searchTerm = $('.searchBar').val();
		console.log(searchTerm);
		limit = 10;
		getAPIData_Characters(searchTerm, limit, autocompleteNames);
		emptyContent('#autocomplete-list');
	});
}

function autocompleteNames(data){
	let autoCharacterArray = data.data.results;
	console.log(autoCharacterArray);
	$('.autocompleteContainer').append('<div id="autocomplete-list"></div>');
	for(let i = 0; i < autoCharacterArray.length; i++){
		let autoCharacterName = autoCharacterArray[i].name;
		$('#autocomplete-list').append(auto_template(autoCharacterName));
	}
	autoHover();
	autoClick();
}

function auto_template(name){
	return '<div class="autocomplete-items">' +
				'<div class="autoName">' + name + '</div>';
}

function autoHover(){
	$('.autocomplete-items div').mouseenter(function(event){
		console.log('hovered');
		$(this).toggleClass('autocomplete-active');
	});
	$('.autocomplete-items div').mouseleave(function(event){
		console.log('hovered');
		$(this).toggleClass('autocomplete-active');
	});
	$('#autocomplete-list').mouseleave(function(event){
		emptyContent($(this));
	});
}

function autoClick(){
	$('.autocomplete-items div').click(function(event){
		let autoFillName = $(this).text();
		console.log(autoFillName);
		$('.searchBar').val(autoFillName);
		emptyContent('#autocomplete-list');
	});
}
// end autofill section

// query section
function q_Char(searchTerm, limit){
	const ts = new Date().getTime();
	return {
		nameStartsWith: searchTerm,
		limit: limit,
		ts: ts,
		apikey: publicKey,
		hash: md5(ts+privateKey+publicKey).toString()
	};
}

function q_Comics(characterID){
	const ts = new Date().getTime();
	return {
		characters: characterID,
		limit: 50,
		ts: ts,
		apikey: publicKey,
		hash: md5(ts+privateKey+publicKey).toString()
	};
}
// end query section

// html templates section
function comic_template(comicTitle, output){
	return '<div class="item">' + comicTitle + output + '</div>';	
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
// end html templates section

// helper functions section
function reveal(eventListener){
	$(eventListener).css('display', 'block');
}

function conceal(eventListener){
	$(eventListener).css('display', 'none');
}

function emptyContent(eventListener){
	$(eventListener).empty();
}

function hideCarouselNav(){
	$('.carousel-control').css('visibility', 'hidden');
}

function showCarouselNav(){
	$('.carousel-control').css('visibility', 'visible');
}

function sharedShowAll(){
	reveal('.characterContainer');
	reveal('.comicsContainer');
}

function sharedConcealAll(){
	conceal('.errorMessage');
	conceal('.comicsContainer');
	conceal('characterContainer');
	conceal('#newSearchButton');
}

function clearAllContent(){
	emptyContent('.characterContainer');
	emptyContent('.comicsContainer');
	emptyContent('.carousel-inner');
	emptyContent('.carousel-indicators');
}
// end helper functions section

function randomChar(){
  	let randomLetter = "";
  	const possible = "abcdefghijklmnopqrstuvwxyz";
	randomLetter += possible.charAt(Math.floor(Math.random() * possible.length));
  	return randomLetter;
}

// button handlers section
function submitButton(){
	$('#submitButton').on('click', function(event){
    	event.preventDefault();
    	let searchTerm = $('.searchBar').val();
    	limit = 1;
    	if(searchTerm === "" || searchTerm === null){
    		sharedShowAll();
    		conceal('#instructions');
    		$('.searchForm').hide();
    		let emptyError = '<div class="errorMessage">ERROR! Your search for NOTHING returned NOTHING! Press New Search to search again</div>';
    		$('.characterContainer').append(emptyError);
    		reveal('#newSearchButton');
    	}
    	else{
    		$('.searchBar').val("");
    		getAPIData_Characters(searchTerm, limit, displayAPIData_Chars);
    		sharedShowAll();
    		conceal('#instructions');
    		$('.searchForm').hide();	
    	}	
  });
}

function submitButtonRandom(){
	$('#submitButtonRandom').on('click', function(event){
    	event.preventDefault();
    	let randomLetter = randomChar();
    	limit = 100;
    	getAPIData_Characters(randomLetter, limit, displayAPIData_Chars_Random);
    	sharedShowAll();
    	conceal('#instructions');
    	$('.searchForm').hide();
  });
}

function newSearch(){
	$('#newSearchButton').on('click', function(event){
		event.preventDefault();
		$('.searchForm').show();
    	$('body').css('background-image', 'url("http://data.1freewallpapers.com/download/avengers.jpg")');
    	reveal('#instructions');
    	sharedConcealAll();
    	$('.characterContainer').append('<div class="loaderTop hidden"></div>');
    	clearAllContent();
    	hideCarouselNav();
    	$('.searchBar').val("");
    	emptyContent('#autocomplete-list');
	});
}
// end button handlers section

// API requests and data handlers section
function getAPIData_Characters(searchTerm, limit, callback){
	$(".loaderTop").toggleClass("hidden");
	$.getJSON(MARVEL_API_URL_CHARS, q_Char(searchTerm, limit), callback, function(json){
		$(".loaderTop").toggleClass("hidden");
	});
}

function getAPIData_Comics(characterID, callback){
	$(".loaderBottom").toggleClass("hidden");
	$(".loaderTop").toggleClass("hidden");
	$.getJSON(MARVEL_API_URL_COMICS, q_Comics(characterID), callback, function(json){
		$(".loaderBottom").toggleClass("hidden");
	});
}

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
			let errorMessage = '<div class="errorMessage"><p>Invalid Character/Character Does Not Exist.<br>Press New Search to restart.</p></div>';
			$('.characterContainer').append(errorMessage);
			$('.loaderTop').toggleClass('hidden');
			reveal('#newSearchButton');
		}
	}
}

function displayAPIData_Chars_Random(data){
	let randomCharacterArray = data.data.results;
	let randomCharacter = randomCharacterArray[Math.floor(Math.random()*randomCharacterArray.length)];
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
	getAPIData_Comics(characterID, displayAPIData_Comics);
}

function displayAPIData_Comics(data){
	let comicArray = data.data.results;
	let noComics = "Marvel does not provide comic book data for this character.";

	function comic_display(characterName, array){
	let character = characterName;
	let comicExists = '<h3>' + character + ' appears in the following comics. Click on the thumbnail to visit the Marvel website to preview the comic book or to purchase it.</h3>';
	let comicNonexists = '<h3>' +character + ' does not appear in any Marvel comic books at this time</h3>';
	if(array.length < 1){
		$('.comicsContainer').append(comicNonexists);
	}
	else{
		try{
			for(let i = 0; i < comicArray.length; i++){
				let comicTitle = '<h4>' + comicArray[i].title + '</h4>';
				let comicDescription = comicArray[i].description;
				let comicCover = comicArray[i].thumbnail.path + '/standard_xlarge.' + comicArray[i].thumbnail.extension;
				let link = comicArray[i].urls[0].url; 
				let output = '<a href="' + link + '" target="_blank"> <img class="coverImg" src="' + comicCover + '" alt="Comic book cover"></a>';
				let indicators = '<li data-target="#myCarousel" data-slide-to="' + i + '" class=""></li>';
					if(comicDescription === "" || comicDescription === null){
						$('.carousel-inner').append(comic_template(comicTitle, output));
					}
					else{
						$('.carousel-inner').append(comic_template(comicTitle, output));
						$('.carousel-indicators').append(indicators);
					}
				}
					$('.comicsContainer').append(comicExists);
					$('.item').first().addClass('active');
					$('.carousel-indicators > li').first().addClass('active');
					showCarouselNav();
				}
		catch(e){
			if(e instanceof TypeError){
				let errorMessage = '<div class="errorMessage"><p>Could not retrieve comic book data for ' + characterName + '.<br>Click on New Search to restart.</p></div>';
				$('.comicsContainer').append(errorMessage);
			}
		}
	}
}
	comic_display(characterName, comicArray);
	$('.loaderBottom').toggleClass('hidden');
	reveal('#newSearchButton');
}
// end API requests and data handlers section


function start(){
	autoCompleteSearch();
	submitButton();
	submitButtonRandom();
	newSearch();
	randomChar();
	hideCarouselNav();
}

$(start);