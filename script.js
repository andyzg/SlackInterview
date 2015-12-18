(function() {

    // Utility functions
    function $(id) {
        return document.getElementById(id);
    }

    // Network functions to fetch data
    function loadImages(cb) {
        cb('Data');
    }


    // Rendering functions to render image data
    function renderImages(data) {
        console.log(data);
    }


    document.addEventListener('DOMContentLoaded', function() {
        loadImages(function(data) {
            renderImages(data);
        });
    }, false);

})()
