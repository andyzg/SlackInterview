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
        this.photoRootElement = $('#photo-list')[0];
        this.focusElement = $('#photo-focus').item(0);
    };

    FlickrImagesView.KEY_CODE_ESC = 27;
    FlickrImagesView.KEY_CODE_LEFT = 37;
    FlickrImagesView.KEY_CODE_RIGHT = 39;

    FlickrImagesView.prototype.renderError = function() {
        alert('There was an error loading the response.');
    };

    FlickrImagesView.prototype.renderImages = function(photos) {
        this.photoList = photos.map(function(p) {
            return new Photo(p);
        });
        for (var i = 0; i < this.photoList.length; i++) {
            // Use a factory to create photo DOM elements, then add it
            // to the DOM.
            var photoElement = FlickrImagesView.createPhotoElement(this.photoList[i]);
            this.setupOnclick(photoElement, i);
            this.photoRootElement.appendChild(photoElement);
        }
    };

    FlickrImagesView.prototype.setupOnclick = function(element, i) {
        element.onclick = function(e) {
            // This prevents any event handlers to be called immediately after
            // attaching them.
            e.stopPropagation();

            this.currentPhotoIndex = i;
            this.setupEventListeners();
            this.renderFocusedView(this.currentPhotoIndex);
        }.bind(this);
    };

    FlickrImagesView.prototype.renderFocusedView = function(currentPhotoIndex) {
        debugger;
        $('#photo-viewer').item(0).style.display = 'block';
        this.setupFocusedImage(this.photoList[currentPhotoIndex].getLargeImageUrl());
    };

    FlickrImagesView.prototype.setupFocusedImage = function(imgUrl) {
        this.focusElement.src = imgUrl;
        if (this.currentPhotoIndex === 0) {
            $('#left-icon').item(0).style.display = 'none';
        } else {
            $('#left-icon').item(0).style.display = 'block';
        }

        if (this.currentPhotoIndex === this.photoList.length - 1) {
            $('#right-icon').item(0).style.display = 'none';
        } else {
            $('#right-icon').item(0).style.display = 'block';
        }
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
                    this.focusPreviousImage();
                    break;
                case FlickrImagesView.KEY_CODE_RIGHT:
                    this.focusNextImage();
                    break;
                default:
                    break;
            }
        }.bind(this);
        $('#close-icon').item(0).onclick = function() {
            this.exitFocusedView();
        }.bind(this);
        $('#left-icon').item(0).onclick = function() {
            this.focusPreviousImage();
        }.bind(this);
        $('#right-icon').item(0).onclick = function() {
            this.focusNextImage();
        }.bind(this);
        window.onclick = function(e) {
            if (e.target.id !== 'photo-focus') {
                debugger;
                this.exitFocusedView();
            }
        }.bind(this);
    }

    FlickrImagesView.prototype.focusNextImage = function() {
        this.currentPhotoIndex++;
        this.setupFocusedImage(this.photoList[this.currentPhotoIndex].getLargeImageUrl());
    };

    FlickrImagesView.prototype.focusPreviousImage = function() {
        this.currentPhotoIndex--;
        debugger;
        this.setupFocusedImage(this.photoList[this.currentPhotoIndex].getLargeImageUrl());
    };

    FlickrImagesView.prototype.exitFocusedView = function() {
        debugger;
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

    document.addEventListener('DOMContentLoaded', function() {
        var photoView = new FlickrImagesView();
        FlickrAPI.loadImages(photoView.renderImages.bind(photoView),
                             photoView.renderError.bind(photoView));
    }, false);

})()
