function getData(url, callback) {
    var xhr = new XMLHttpRequest();
    // CAPABILITY: This is an old sync XHR pattern
    xhr.open('GET', url, false); 
    xhr.send(null);

    if (xhr.status === 200) {
        callback(xhr.responseText);
    }
}
