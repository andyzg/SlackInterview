(function() {

    var FlickrAPI = function() {

        var API_ENDPOINT = 'https://api.flickr.com/services';
        var API_KEY = '8c1e32c8cf8aef1aa2327eaa91fc305d';
        var ANDY_ZHANG_USER_ID = '136059316@N02';
        var PHOTOS_METHOD = 'flickr.people.getPublicPhotos';
        var EXTRAS = ['url_s', 'url_l'];
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
        function loadImages(cb, error) {
            // Construct the request URL
            var queryParams = {};
            queryParams['method'] = PHOTOS_METHOD;
            queryParams['format'] = RESPONSE_FORMAT;
            queryParams['user_id'] = ANDY_ZHANG_USER_ID;
            queryParams['api_key'] = API_KEY;
            queryParams['nojsoncallback'] = '1';
            queryParams['extras'] = EXTRAS.join(',');
            var requestUrl = API_ENDPOINT + '/' + REQUEST_FORMAT + '?' + formatQueryParameter(queryParams);

            // Open a GET request
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function() {
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                    var parsedData = JSON.parse(xmlHttp.responseText);
                    if (parsedData['stat'] === 'ok') {
                        cb(parsedData['photos']['photo']);
                    } else {
                        error(); // TODO: Add error message
                    }
                } else {
                    // TODO: Handle error
                }
            };
            xmlHttp.open('GET', requestUrl, true);
            xmlHttp.send(null);
        }

        // Interface
        return {
            loadImages: loadImages
        };
    };

    var FlickrImagesView = function() {

        var photoList = [];
        var currentPhotoIndex = null;

        var Photo = function(photo) {
            var smallImageUrl = photo['url_s'];
            var largeImageUrl = photo['url_l'];
            var id = photo['id'];

            function getSmallImageUrl() {
                return smallImageUrl;
            }

            function getLargeImageUrl() {
                return largeImageUrl;
            }

            function getId() {
                return id;
            }

            return {
                getId: getId,
                getLargeImageUrl: getLargeImageUrl,
                getSmallImageUrl: getSmallImageUrl
            };
        };

        // Utility functions
        function $(selector) {
            return document.querySelectorAll(selector);
        }

        function renderError() {
            alert('There was an error loading the response.');
        }

        // Rendering functions to render image data
        function renderImages(photos) {
            var rootListElement = $('#photo-list')[0];
            photoList = photos.map(function(p) {
                return new Photo(p);
            });
            for (var i = 0; i < photoList.length; i++) {
                // Use a factory to create photo DOM elements, then add it 
                // to the DOM.
                var photoElement = createPhotoElement(photoList[i]);
                setupOnclick(photoElement, i);
                rootListElement.appendChild(photoElement);
            }
        }

        function setupOnclick(element, i) {
            element.onclick = function() {
                currentPhotoIndex = i;
                renderFocusedView(currentPhotoIndex);
            };
        }

        function renderFocusedView(currentPhotoIndex) {
            $('#photo-focus').item(0).src = photoList[currentPhotoIndex].getLargeImageUrl();
            $('#photo-viewer').item(0).style.display = 'block';
            document.addEventListener('mousewheel', function(e) {
                e.preventDefault();
            });
        }

        function createPhotoElement(photo) {
            var rootDiv = document.createElement('div');
            rootDiv.style['background-image'] = 'url(' + photo.getSmallImageUrl() + ')';
            rootDiv.className = 'photo-thumbnail';

            var overlay = document.createElement('div');
            overlay.className = 'photo-overlay';
            rootDiv.appendChild(overlay);
            return rootDiv;
        }

        // Interface
        return {
            renderImages: renderImages,
            renderError: renderError
        };
    };

    document.addEventListener('DOMContentLoaded', function() {
        var flickrApi = new FlickrAPI();
        var photoView = new FlickrImagesView();
        flickrApi.loadImages(photoView.renderImages,
                             photoView.renderError);
    }, false);

})()
