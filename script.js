(function() {

    // Utility functions
    function $(id) {
        return document.getElementById(id);
    }

    var API_ENDPOINT = 'https://api.flickr.com/services';
    var API_KEY = '8c1e32c8cf8aef1aa2327eaa91fc305d';
    var ANDY_ZHANG_USER_ID = '136059316@N02';
    var PHOTOS_METHOD = 'flickr.people.getPublicPhotos';
    var REQUEST_FORMAT = 'rest'
    var RESPONSE_FORMAT = 'json';

    function formatQueryParameter(queryParamterDict) {
        var queryParameters = [];
        for (var i in queryParamterDict) {
            queryParameters.push(i + '=' + queryParamterDict[i]);
        }
        return queryParameters.join('&');
    }

    // Network functions to fetch data
    function loadImageIds(cb) {
        // Construct the request URL
        var queryParams = {};
        queryParams['method'] = PHOTOS_METHOD;
        queryParams['format'] = RESPONSE_FORMAT;
        queryParams['user_id'] = ANDY_ZHANG_USER_ID;
        queryParams['api_key'] = API_KEY;
        queryParams['nojsoncallback'] = '1';
        var requestUrl = API_ENDPOINT + '/' + REQUEST_FORMAT + '?' + formatQueryParameter(queryParams);

        // Open a GET request
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                cb(xmlHttp.responseText);
            } else {
                // TODO: Handle error
            }
        };
        xmlHttp.open('GET', requestUrl, true);
        xmlHttp.send(null);
    }


    // Rendering functions to render image data
    function renderImageIds(data) {
        var listOfPhotos = JSON.parse(data);
        console.log(listOfPhotos);
    }


    document.addEventListener('DOMContentLoaded', function() {
        loadImageIds(function(data) {
            renderImageIds(data);
        });
    }, false);

})()
