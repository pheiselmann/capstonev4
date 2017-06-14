# Movie Suggestion App

## Table of Contents

  - [Introduction](#introduction)
  - [How It Works](#how-it-works)
  - [Demo](#demo)
  - [Technology](#technology)
  - [Issues](#issues)

## Introduction

This app was initially developed as a capstone project for the front end web development portion of Thinkful's full stack web development program.  Through the use of HTML, CSS, JavaScript, JQuery, and Ajax calls to the TasteDive and YouTube APIs, this app creates an interactive movie search experience that is intended to be both educational and entertaining.  


## How It Works

On the first page of the app, the user is prompted to enter a movie title.  This title query is then sent as part of an asynchronous Ajax request to the TasteDive API, which then returns a data object that includes either a populated "Results" array with data objects containing properties of movies similar to the user's query title - or an empty "Results" array.  If the "Results" array is empty or contains less than a certain number of movie objects, the user receives an error message and is prompted to enter another movie title.  Otherwise, the app uses regex match searches to parse through the "wTeaser" property (which contains a Wikipedia "blurb") of each movie object, extracting arrays of genres, directors, and stars.  The app then randomly chooses three elements of each of these arrays - excluding duplicates - and the user then is prompted, on three successive pages, to choose one entry from each of these three category sets.  

In addition to excluding duplicates for each category, the app also excludes any random element that is associated with an inactive trailer video on YouTube.  This is accomplished through synchronous Ajax requests to the YouTube API with the YouTube ID of the movie associated with that element.  The app finds the YouTube ID in the TasteDive API movie object, and if the Ajax call to the YouTube API returns no data for that ID, the element associated with that ID is excluded from the choices offered to the user.  

The end result of this process is a final page containing clickable links to three movie trailers - each of which is associated with the element chosen by the user.  The user may then do a new search and start the process all over again.  Because of the random nature of the choice elements, the user may have unique interactive experiences using the same movie title query multiple times.

## Demo

![Walkthrough](images/full_metal_jacket.gif)

## Technology

CSS, HTML, JavaScript, JQuery, Ajax, TasteDive & Youtube API Libraries

## Issues

### Issue #1: 

The Tastedive API occasionally provides a YouTube video URL that does not match the movie title and/or description.  

Examples:

The results for "Bambi", the 1942 animated Disney classic, includes a YouTube URL for Dwayne "The Rock" Johnson's parody of the movie on SNL.

The results for "City Lights", the 1931 silent film starring Charlie Chaplin, includes a YouTube URL for a modern Indian film by the same name.

The results for "Lethal Weapon", the 1987 buddy cop action film starring Mel Gibson and Danny Glover, includes a YouTube URL for a TV series by the same name that began in 2016.
 
The results for "Badlands", a 1973 American crime film starring Martin Sheen and Sissy Spacek, includes a YouTube URL for a TV series entitled, "Into the Badlands", which began in 2015.

### Issue #2: 

When this app sends a movie search request to the TasteDive API, the API returns a "wTeaser" property which contains the opening paragraph(s) of the Wikipedia page for each movie. This app uses a complex series of regex match searches to extract a genre, director and star from each of these blurbs. However, given the lack of uniformity in the Wikipedia blurbs returned, the regex match searches for this app were developed through trial-and-error - and there is a high probability that these searches will need to be continuously refined to eliminate unusual results.

That being said, this app could be readily adapted to an API with more uniform data, e.g., the Internet Movie Database (IMDb) API. Regex matches for such an API would be much simpler, and would yield far more reliable results.




