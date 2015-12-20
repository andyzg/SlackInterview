(function() {

    // Utility functions
    function formatQueryParameter(queryParamterDict) {
        var queryParameters = [];
        for (var i in queryParamterDict) {
            queryParameters.push(i + '=' + queryParamterDict[i]);
        }
        return queryParameters.join('&');
    }

    function $(selector) {
        return document.querySelectorAll(selector);
    }

    var FlickrAPI = function() {};

    FlickrAPI.API_ENDPOINT = 'https://api.flickr.com/services';
    FlickrAPI.API_KEY = '8c1e32c8cf8aef1aa2327eaa91fc305d';
    FlickrAPI.ANDY_ZHANG_USER_ID = '136059316@N02';
    FlickrAPI.PHOTOS_METHOD = 'flickr.people.getPublicPhotos';
    FlickrAPI.EXTRAS = ['url_s', 'url_l'];
    FlickrAPI.REQUEST_FORMAT = 'rest'
    FlickrAPI.RESPONSE_FORMAT = 'json';

    FlickrAPI.loadImages = function(cb, error) {
        // Construct the request URL
        var queryParams = {};
        queryParams['method'] = FlickrAPI.PHOTOS_METHOD;
        queryParams['format'] = FlickrAPI.RESPONSE_FORMAT;
        queryParams['user_id'] = FlickrAPI.ANDY_ZHANG_USER_ID;
        queryParams['api_key'] = FlickrAPI.API_KEY;
        queryParams['nojsoncallback'] = '1';
        queryParams['extras'] = FlickrAPI.EXTRAS.join(',');
        var requestUrl = FlickrAPI.API_ENDPOINT + '/' +
            FlickrAPI.REQUEST_FORMAT + '?' + formatQueryParameter(queryParams);

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
    };

    var Photo = function(photo) {
        this.smallImageUrl = photo['url_s'];
        this.largeImageUrl = photo['url_l'];
        this.id = photo['id'];
    };

    Photo.prototype.getSmallImageUrl = function() {
        return this.smallImageUrl;
    };

    Photo.prototype.getLargeImageUrl = function() {
        return this.largeImageUrl;
    };

    Photo.prototype.getId = function() {
        return this.id;
    };

    var FlickrImagesView = function() {
        this.photoList = [];
        this.currentPhotoIndex = null;
    };

    FlickrImagesView.KEY_CODE_ESC = 27;
    FlickrImagesView.KEY_CODE_LEFT = 37;
    FlickrImagesView.KEY_CODE_RIGHT = 39;

    FlickrImagesView.prototype.renderError = function() {
        alert('There was an error loading the response.');
    };

    FlickrImagesView.prototype.renderImages = function(photos) {
        var rootListElement = $('#photo-list')[0];
        this.photoList = photos.map(function(p) {
            return new Photo(p);
        });
        for (var i = 0; i < this.photoList.length; i++) {
            // Use a factory to create photo DOM elements, then add it
            // to the DOM.
            var photoElement = FlickrImagesView.createPhotoElement(this.photoList[i]);
            this.setupOnclick(photoElement, i);
            rootListElement.appendChild(photoElement);
        }
    };

    FlickrImagesView.prototype.setupOnclick = function(element, i) {
        element.onclick = function() {
            this.currentPhotoIndex = i;
            this.renderFocusedView(this.currentPhotoIndex);
        }.bind(this);
    };

    FlickrImagesView.prototype.renderFocusedView = function(currentPhotoIndex) {
        $('#photo-viewer').item(0).style.display = 'block';
        this.setupEventListeners();
        this.setupFocusedImage(this.photoList[currentPhotoIndex].getLargeImageUrl());
    };

    FlickrImagesView.prototype.setupFocusedImage = function(imgUrl) {
        $('#photo-focus').item(0).src = imgUrl;
    }

    FlickrImagesView.disableScrollEvent = function(e) {
        e.preventDefault();
    };

    FlickrImagesView.prototype.setupEventListeners = function() {
        document.addEventListener('mousewheel', FlickrImagesView.disableScrollEvent);
        window.onkeydown = function(e) {
            var code = e.keyCode ? e.keyCode : e.which;
            switch (code) {
                case FlickrImagesView.KEY_CODE_ESC:
                    this.exitFocusedView();
                    break;
                case FlickrImagesView.KEY_CODE_LEFT:
                    this.focusNextImage();
                    break;
                case FlickrImagesView.KEY_CODE_RIGHT:
                    this.focusPreviousImage();
                    break;
                default:
                    break;
            }
        }.bind(this);
    }
    FlickrImagesView.prototype.focusNextImage = function() {
        console.log('Next image');
    };
    FlickrImagesView.prototype.focusPreviousImage = function() {
        console.log('Previous image');
    };

    FlickrImagesView.prototype.exitFocusedView = function() {
        this.currentPhotoIndex = null;
        document.removeEventListener('mousewheel', FlickrImagesView.disableScrollEvent);
        window.onkeydown = null;
        $('#photo-viewer').item(0).style.display = 'none';
    };

    FlickrImagesView.createPhotoElement = function(photo) {
        var rootDiv = document.createElement('div');
        rootDiv.style['background-image'] = 'url(' + photo.getSmallImageUrl() + ')';
        rootDiv.className = 'photo-thumbnail';

        var overlay = document.createElement('div');
        overlay.className = 'photo-overlay';
        rootDiv.appendChild(overlay);
        return rootDiv;
    }

    FlickrImagesView.prototype


    document.addEventListener('DOMContentLoaded', function() {
        var photoView = new FlickrImagesView();
        FlickrAPI.loadImages(photoView.renderImages.bind(photoView),
                             photoView.renderError.bind(photoView));
    }, false);

})()
