var TASTEDIVE_BASE_URL = 'https://tastedive.com/api/similar?';

var state = {

  route: 'start',
  query: '',
  results: [],
  genres: [],
  genreShorts: [],
  genrePicks: [],
  directors: [],
  directorShorts: [],
  directorPicks: [],
  stars: [],
  starShorts: [],
  starPicks: [],
  movieKeys: [],
  movieIdeas: []
}


function getDataFromApi(searchTerm, callback) {  
  var settings = {
    url: TASTEDIVE_BASE_URL,
    data: {
      q: 'movie:' + searchTerm,
      type: 'movies',
      k: '269724-PhilHeis-FQRV1O9N',
      verbose: 1,
      limit: 1000
    },
    dataType: 'jsonp',
    type: 'GET',
    success: callback
  };
  $.ajax(settings);
}


// State modification functions
function setRoute(state, route) {
  state.route = route;
}


function startProcess(data) {
  createStateArrays(state, data);
}


function resetGame(state) {
  for (var prop in state) {
    if (prop === "route") {
      state[prop] = "start";
    } else {
      state[prop] = [];
    }
  }
}


function createStateArrays(state, data) {
  if (data.Similar.Results[0] && data.Similar.Results.length > 20) {
    state.results = data.Similar.Results;
    state.resultsMinusGPickIndices = data.Similar.Results.map(function(result, i) { return { index: i } });
    state.resultsMinusGDPickIndices = data.Similar.Results.map(function(result, i) { return { index: i } });
    createTypeArrays(state, "genres");
    createTypeArrays(state, "directors");
    createTypeArrays(state, "stars");
    createRandomPicks(state, 3, "genres", "genrePicks");
    createRandomPicks(state, 3, "directors", "directorPicks");
    createRandomPicks(state, 3, "stars", "starPicks");
    setRoute(state, 'genre');
    renderApp(state, PAGE_ELEMENTS);
  }
  else {
    setRoute(state, 'error');
    renderApp(state, PAGE_ELEMENTS);
  }
}


function createTypeArrays(state, type) {
  var descriptions = state.results.map(function(movie) { return movie.wTeaser; });
  if (type === "genres") {
    var genres = descriptions.map(function(description, i) { return { name: description.match(/(?:is a )(.+?film noir |.+?film)/), index: i } });
    state.genreShorts = genres.filter(function(genre) { if (genre.name && genre.name[1].trim().split(' ').length > 2) { return genre; }});
    state.genres = state.genreShorts.map(function(genre) { return { name: genre.name[1].trim(), index: genre.index} });
  } else if (type === "directors") {
    var directors = descriptions.map(function(description, i) { 
      return { name: description.match(/(?:filmmaker | directorial debut of | directed by and starred | directed and written by | directed and co-written by | directed and produced by | directed and co-produced by | directed by | Directed by | film by )(.+?\b([A-Z]{1}[a-z\x7f-\xff]{1,30}[-]{1,}[a-z\x7f-\xff]{1,30}|[A-Z]{1}[a-z\x7f-\xff]{1,30}[- ]{0,1}|[A-Z]{1}[- \']{1}[A-Z]{0,1}[a-z\x7f-\xff]{1,30}[- ]{0,1}|[a-z\x7f-\xff]{1,2}[ -\']{1}[A-Z]{1}[a-z\x7f-\xff]{1,30}){1,3})/), index: i } });
    state.directorShorts = directors.filter(function(director) { if (director.name) { return director; }});
    state.directors = state.directorShorts.map(function(director) { return { name: director.name[1].trim(), index: director.index} });
    for (var i = 0; i < state.directors.length; i++) {
      var withProbArray = state.directors[i].name.split(' ');
      var withTarget;
      for (var x = 0; x < withProbArray.length; x++) {
        if (withProbArray[x] === "with") {
          withTarget = x;
          state.directors[i].name = withProbArray.splice(0, withTarget).join(' ');
        }
      }
    }
  } else if (type === "stars") {
    var stars = descriptions.map(function(description, i) { 
    return { name: description.match(/(?:starring the voices of | starring South Park creators | starring | starred | stars Academy Award nominee | stars the voices of | South Korean pop musician | stars | played by )(.+?\b([A-Z]{1}[a-z\x7f-\xff]{1,30}[-]{1}[a-z\x7f-\xff]{1,30}|[A-Z]{1}[a-z\x7f-\xff]{1,30}[- ]{0,1}|[A-Z]{1}[- \']{1}[A-Z]{0,1}[a-z\x7f-\xff]{1,30}[- ]{0,1}|[a-z\x7f-\xff]{1,2}[ -\']{1}[A-Z]{1}[a-z\x7f-\xff]{1,30}){1,3})/), index: i } });
    state.starShorts = stars.filter(function(star) { if (star.name && star.name[1][0].match(/[A-Z]/)) { return star; }});
    state.stars = state.starShorts.map(function(star) { return { name: star.name[1].trim(), index: star.index } });

    for (var i = 0; i < state.stars.length; i++) {
      var asProbArray = state.stars[i].name.split(' ');
      var asTarget;
      for (var x = 0; x < asProbArray.length; x++) {
        if (asProbArray[x] === "as" || asProbArray[x] === "and" ) {
          sTarget = x;
          state.stars[i].name = asProbArray.splice(0, asTarget).join(' ');
        }
      }
    }
  }
}


function createRandomPicks(state, number, type, pickType) {
  var max = state[type].length - 1;
  var min = 0
  var randomPick;
  var words = 0;
  while (state[pickType].length < number) { 
    randomPick = state[type][randomIntFromInterval(min,max)];
    words = randomPick.name.split(' ');
    updatePicks(randomPick, words, pickType);
  }
}


function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random() * (max - min + 1) + min);
}


function updatePicks(randomPick, words, pickType) {
  if (pickType === "genrePicks") {
    if (randomPickOk(randomPick, words, pickType)){
      state.genrePicks.push(randomPick);
    }
  } else if (pickType === "directorPicks") {
     if (randomPickOk(randomPick, words, pickType)){
      state.directorPicks.push(randomPick);
    }
  } else if (pickType === "starPicks") {
     if (randomPickOk(randomPick, words, pickType)){
      state.starPicks.push(randomPick);
    }
  }
}


function randomPickOk(randomPick, words, pickType) {
  if (pickType === "genrePicks") {
    return (words.length < 11 && !(randomPick.name.match(/^[a-z]/) || randomPick.name.match(/[a-z][a-z][.]/) || randomPick.name.match(/[,]/)) && notInPicksArray(randomPick, pickType));
  } else if (pickType === "directorPicks") {
    return (words.length > 1 && words.length < 5 && !(randomPick.name.match(/(starring)/) || randomPick.name.match(/^[a-z]/) || randomPick.name.match(/[a-z][a-z][.]/) || randomPick.name.match(/[,]/) || randomPick.name.match(/&/) || randomPick.name.match(/\"/)) && notInPicksArray(randomPick, pickType));
  } else if (pickType === "starPicks") {
    return (words.length > 1 && words.length < 4 && !(randomPick.name.match(/^[a-z]/) || randomPick.name.match(/[a-z][a-z][.]/) || randomPick.name.match(/[,]/) || randomPick.name.match(/&/) || randomPick.name.match(/\"/)) && notInPicksArray(randomPick, pickType));
  }
}


function notInPicksArray(randomPick, pickType) {
  var result = true;
  for(var i = 0; i < state[pickType].length; i++) {
    if(JSON.stringify(state[pickType][i]) === JSON.stringify(randomPick) | JSON.stringify(state[pickType][i].name) === JSON.stringify(randomPick.name)) {
     result = false;
    }
  }
  return result;
}

// Render functions
function renderApp(state, elements) {
  Object.keys(elements).forEach(function(route) {
    elements[route].hide();
  });
  elements[state.route].show();
  if (state.route === 'start') {
      renderStartPage(state, elements[state.route]);
  } else if (state.route === 'genre') {
      renderGenrePage(state, elements[state.route]);
  } else if (state.route === 'director') {
      renderDirectorPage(state, elements[state.route]);
  } else if (state.route === 'star') {
      renderStarPage(state, elements[state.route]);
  } else if (state.route === 'final') {
      renderFinalPage(state, elements[state.route]);
  } else if (state.route === 'error') {
      renderErrorPage(state, elements[state.route]);
  }
}


function renderStartPage(state, element) {
  $('.query').focus();
}


function renderErrorPage(state, element) {
  $('.query').focus();
  $('.search-again').find('.query').val('');
}


function renderGenrePage(state, element) {
  renderGenreText(state, element.find('.genre-text'));
  renderGenreChoices(state, element.find('.choices'));
}


function renderGenreChoices(state, element) {
  var choices = state.genrePicks.map(function(choice, index) {
    return (
      '<li class="radio">' +
        '<input type="radio" name="user-answer1" id="' + index + '" value="' + index + '" required>' +
        '<label for="' + index + '" class="radio-label">' + choice.name + '</label>' +
      '</li>'
    );
  });
  element.html(choices);
}


function renderGenreText(state, element) {
  var text = 'Ok, now click on one of the genres below:';
  element.text(text);
}


function renderDirectorPage(state, element) {
  renderDirectorText(state, element.find('.director-text'));
  renderDirectorChoices(state, element.find('.choices'));
}


function renderDirectorChoices(state, element) {
  var choices = state.directorPicks.map(function(choice, index) {
    return (
      '<li class="radio">' +
        '<input type="radio" name="user-answer2" id="' + index + '" value="' + index + '" required>' +
        '<label for="' + index + '" class="radio-label">' + choice.name + '</label>' +
      '</li>'
    );
  });
  element.html(choices);
}


function renderDirectorText(state, element) {
  var text = 'Now pick a director (even if the name is unfamiliar):';
  element.text(text);
}


function renderStarPage(state, element) {
  renderStarText(state, element.find('.star-text'));
  renderStarChoices(state, element.find('.choices'));
}


function renderStarChoices(state, element) {
  var choices = state.starPicks.map(function(choice, index) {
    return (
      '<li class="radio">' +
        '<input type="radio" name="user-answer3" id="' + index + '" value="' + index + '" required>' +
        '<label for="' + index + '" class="radio-label">' + choice.name + '</label>' +
      '</li>'
    );
  });
  element.html(choices);
}


function renderStarText(state, element) {
  var text = 'You\'re almost done!  Choose one of the stars below:';
  element.text(text);
}


function renderFinalPage(state, element) {

  var text = "Here are some movies you might enjoy, based upon the title you entered (\"" + state.query +
  "\") - as well as the genre," +
  " director, and star you chose.  Click on the items below to watch the trailers.  If you don't like these selections," +
  " search again with the same title (or another one). The choices will be different each time!";

  var resultElement1 = '<a target="_blank" class="popup-youtube" href="' + findMovieUrl(state, state.movieKeys[0], state.genres) + 
  '"><img class="movie-image popup-youtube" src="https://i.ytimg.com/vi/' + findYouTubeID(state, state.movieKeys[0], state.genres) + '/mqdefault.jpg"></a>';

  var resultElement2 = '<a target="_blank" href="' + findMovieUrl(state, state.movieKeys[1], state.directors) + 
  '"><img class="movie-image" src="https://i.ytimg.com/vi/' + findYouTubeID(state, state.movieKeys[1], state.directors) + '/mqdefault.jpg"></a>';

  var resultElement3 = '<a target="_blank" href="' + findMovieUrl(state, state.movieKeys[2], state.stars) + 
  '"><img class="movie-image" src="https://i.ytimg.com/vi/' + findYouTubeID(state, state.movieKeys[2], state.stars) + '/mqdefault.jpg"></a>';

  var resultLink1 = '<a target="_blank" href="' + findMovieUrl(state, state.movieKeys[0], state.genres) + '">' + 
  findMovieName(state, state.movieKeys[0], state.genres) + ' - A ' + state.movieKeys[0] + '</a>';

  var resultLink2 = '<a target="_blank" href="' + findMovieUrl(state, state.movieKeys[1], state.directors) + '">' + 
  findMovieName(state, state.movieKeys[1], state.directors) + ' - Directed by ' + state.movieKeys[1] + '</a>';

  var resultLink3 = '<a target="_blank" href="' + findMovieUrl(state, state.movieKeys[2], state.stars) + '">' + 
  findMovieName(state, state.movieKeys[2], state.stars)  + ' - Starring ' + state.movieKeys[2] + '</a>';

  element.find('.results-text').text(text);
  element.find('.results-trailer1').html(resultElement1);
  element.find('.results-trailer2').html(resultElement2);
  element.find('.results-trailer3').html(resultElement3);
  element.find('.trailer1-link').html(resultLink1);
  element.find('.trailer2-link').html(resultLink2);
  element.find('.trailer3-link').html(resultLink3);
}


function findMovieName(state, movieKey, type) {
  var typeShort = type.filter(function(short) { return short.name === movieKey; });
  var movieIndex = typeShort[0].index;
  return state.results[movieIndex].Name;
}


function findMovieUrl(state, movieKey, type) {
  var typeShort = type.filter(function(short) { return short.name === movieKey; });
  var movieIndex = typeShort[0].index;
  return state.results[movieIndex].yUrl;
}


function findYouTubeID(state, movieKey, type) {
  var typeShort = type.filter(function(short) { return short.name === movieKey; });
  var movieIndex = typeShort[0].index;
  return state.results[movieIndex].yID;
}


// Event handlers
$(".restart-game").click(function(event){
  event.preventDefault();
  resetGame(state);
  renderApp(state, PAGE_ELEMENTS);
  $('.js-search-form').find('.query').val('');
});


$("form[name='genre-choices']").submit(function(event) {
  event.preventDefault();
  var answer1 = $("input[name='user-answer1']:checked").val();
  state.movieKeys.push(state.genrePicks[answer1].name);
  setRoute(state, 'director');
  renderApp(state, PAGE_ELEMENTS);
});


$("form[name='director-choices']").submit(function(event) {
  event.preventDefault();
  var answer2 = $("input[name='user-answer2']:checked").val();
  state.movieKeys.push(state.directorPicks[answer2].name);
  setRoute(state, 'star');
  renderApp(state, PAGE_ELEMENTS);
});


$("form[name='star-choices']").submit(function(event) {
  event.preventDefault();
  var answer3 = $("input[name='user-answer3']:checked").val();
  state.movieKeys.push(state.starPicks[answer3].name);
  setRoute(state, 'final');
  renderApp(state, PAGE_ELEMENTS);
});


$("form[name='search-again']").submit(function(event) {
  event.preventDefault();
  var query = $(this).find('.query').val();
  query = queryCase(query);
  state.query = query;
  getDataFromApi(query, startProcess);
});


function watchSubmit(state) {
  $('.js-search-form').submit(function(e) {
    e.preventDefault();
    var query = $(this).find('.query').val();
    query = queryCase(query);
    state.query = query;
    getDataFromApi(query, startProcess);
  });
}


function queryCase(query) {
  var query = query.toLowerCase().split(" ");
  for (var i = 0; i < query.length; i++) {
    query[i] = query[i].charAt(0).toUpperCase() + query[i].slice(1); 
  }
  return query.join(' ');
}


var PAGE_ELEMENTS = {
  'start': $('.start-page'),
  'genre': $('.genre-page'),
  'director': $('.director-page'),
  'star': $('.star-page'),
  'final': $('.final-page'),
  'error': $('.error-page')
};


$(function(){
  renderApp(state, PAGE_ELEMENTS);
  watchSubmit(state);
});
