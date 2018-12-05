//set login href
let loc = window.location.toString();
let i = loc.lastIndexOf('/');
let redirect = (i > -1 ? loc.substring(0, i) : loc) + '/login.html';

//verify login
if (localStorage.getItem('jwt') !== null) {
    jwtPostApiCall(API_SERVER + '/verifyToken', {}, (err, response) => {
        if (err === null) {
            localStorage.setItem('library', response.data.library);

            if (response.data.library !== null) {
                document.getElementById('insert-book-btn').style.display = 'block';
                document.getElementById('delete-book-btn').style.display = 'block';
            } else {
                document.getElementById('get-borrowed-books-btn').style.display = 'block';
                document.getElementById('borrow-book-btn').style.display = 'block';
                document.getElementById('return-book-btn').style.display = 'block';
            }
        } else {
            console.log(err.response);
        }
    });
}

document.getElementById('login').href = API_SERVER + '/login/' + encodeURIComponent(redirect) + '/apiToken/' + API_TOKEN;

document.getElementById('get-libraries-btn').onclick = () => {
    let url = API_SERVER + '/getLibraries/apiToken/' + API_TOKEN;
    axios.get(url)
        .then(response => {
            showRepsonse('GET', url, response.status, response.statusText, response.data);
        }).catch(err => {
            showRepsonse('GET', url, err.response.status, err.response.statusText, err.response.data);
        }
    );
};

document.getElementById('get-books-btn').onclick = () => {
    let url = API_SERVER + '/getBooks/apiToken/' + API_TOKEN;
    axios.get(url)
        .then(response => {
            showRepsonse('GET', url, response.status, response.statusText, response.data);
        }).catch(err => {
            showRepsonse('GET', url, err.response.status, err.response.statusText, err.response.data);
        }
    );
};

document.getElementById('get-books-by-library-btn').onclick = () => {
    let url = API_SERVER + '/getLibraries/apiToken/' + API_TOKEN;
    axios.get(url)
        .then(response => {
            setSet('get-books-by-library',
                [{
                    id: 'lib-sel',
                    type: 'select',
                    options: response.data.map(l => {
                        return {value: l, text: l}
                    })
                }])
            ;
        }).catch(err => {
        showRepsonse('GET', url, err.response.status, err.response.statusText, err.response.data);
    });
};

document.getElementById('insert-book-btn').onclick = () => {
    setSet('insert-book',
        [{
            id: 'nr',
            type: 'text',
            placeholder: 'Booknumber'
        }, {
            id: 'name',
            type: 'text',
            placeholder: 'Name'
        }]);
};

document.getElementById('delete-book-btn').onclick = () => {
    let library = localStorage.getItem('library');
    let url = API_SERVER + '/getBooks/' + encodeURIComponent(library) + '/apiToken/' + API_TOKEN;

    axios.get(url)
        .then(response => {
            setSet('delete-book',
                [{
                    id: 'book-sel',
                    type: 'select',
                    options: response.data.map(b => {
                        return {value: b.nr, text: b.nr + ' ' + b.name}
                    })
                }]);
        }).catch(err => {
            showRepsonse('GET', url, err.response.status, err.response.statusText, err.response.data);
        }
    );
};

document.getElementById('borrow-book-btn').onclick = () => {
    let url = API_SERVER + '/getLibraries/apiToken/' + API_TOKEN;

    axios.get(url)
        .then(response => {
            setSet('borrow-book',
                [{
                    id: 'lib-sel',
                    type: 'select',
                    options: response.data.map(l => {
                        return {value: l, text: l}
                    })
                }, {
                    id: 'book-sel',
                    type: 'select',
                    options: []
                }]);
            document.getElementById('lib-sel').onchange = onChangeLibSel;
            onChangeLibSel();
        }).catch(err => {
            showRepsonse('GET', url, err.response.status, err.response.statusText, err.response.data);
        }
    );
};

document.getElementById('return-book-btn').onclick = () => {
    let url = API_SERVER + '/getBorrowedBooks';
    jwtGetApiCall(url, (err, response) => {
        if (err !== null) {
            showRepsonse('GET', url, response.status, response.statusText, response.data);
        } else {
            setSet('return-book',
                [
                    {
                        id: 'book-sel',
                        type: 'select',
                        options: response.data.map(b => {
                            return {
                                value: encodeURIComponent(JSON.stringify({nr: b.nr, library: b.library})),
                                text: b.nr + ' ' + b.name
                            };
                        })
                    }
                ])
        }
    });
};

document.getElementById('get-borrowed-books-btn').onclick = () => {
    let url = API_SERVER + '/getBorrowedBooks';
    jwtGetApiCall(url, (err, response) => {
        if (err !== null) {
            response = err.response;
        }
        showRepsonse('GET', url, response.status, response.statusText, response.data);
    });
};

function onChangeLibSel() {
    let libSelElem = document.getElementById('lib-sel');
    let lib = libSelElem.options[libSelElem.selectedIndex].value;
    let url = API_SERVER + '/getBooks/' + encodeURIComponent(lib) + '/apiToken/' + API_TOKEN;

    axios.get(url)
        .then(response => {
            let optionHtml = '';
            response.data.forEach(book => {
                optionHtml += '<option value="' + book.nr + '">' + book.nr + ' ' + book.name + '</option>';
            });

            document.getElementById('book-sel').innerHTML = optionHtml;
        }).catch(err => {
            showRepsonse('GET', url, err.response.status, err.response.statusText, err.response.data);
        }
    );
};

let setFormElem = document.getElementById('set-form');
document.getElementById('set-form').onsubmit = e => {
    e.preventDefault();

    let url;
    switch (setFormElem.dataset.name) {
        case 'get-books-by-library':
            let select = document.getElementById('lib-sel');
            let selVal = select.options[select.selectedIndex].value;
            url = API_SERVER + '/getBooks/' + encodeURIComponent(selVal) + '/apiToken/' + API_TOKEN;
            axios.get(url)
                .then(response => {
                    showRepsonse('GET', url, response.status, response.statusText, response.data);
                }).catch(err => {
                    showRepsonse('GET', url, err.response.status, err.response.statusText, err.response.data);
                }
            );
            break;

        case 'insert-book':
            let insertBookNr = document.getElementById('nr').value;
            let name = document.getElementById('name').value;
            url = API_SERVER + '/insertBook';
            jwtPostApiCall(url, {bookNr: insertBookNr, name: name}, (err, response) => {
                if (err !== null) {
                    response = err.response;
                }
                showRepsonse('POST', url, response.status, response.statusText, response.data);
            });
            break;

        case 'delete-book':
            let delSel = document.getElementById('book-sel');
            let delBookNr = delSel.options[delSel.selectedIndex].value;
            url = API_SERVER + '/deleteBook/' + encodeURIComponent(delBookNr);
            jwtDeleteApiCall(url, (err, response) => {
                if (err !== null) {
                    response = err.response;
                }
                showRepsonse('POST', url, response.status, response.statusText, response.data);
            });
            break;

        case 'borrow-book':
            let libSel = document.getElementById('lib-sel');
            let lib = libSel.options[libSel.selectedIndex].value;
            let bookSel = document.getElementById('book-sel');
            let borrowBookNr = bookSel.options[bookSel.selectedIndex].value;
            url = API_SERVER + '/borrowBook';
            jwtPostApiCall(url, {bookNr: borrowBookNr, library: lib}, (err, response) => {
                if (err !== null) {
                    response = err.response;
                }
                showRepsonse('POST', url, response.status, response.statusText, response.data);
            });
            break;

        case 'return-book':
            let returnBookSel = document.getElementById('book-sel');
            let returnBook = JSON.parse(decodeURIComponent(returnBookSel.options[returnBookSel.selectedIndex].value));
            url = API_SERVER + '/returnBook';
            jwtPostApiCall(url, {bookNr: returnBook.nr, library: returnBook.library}, (err, response) => {
                if (err !== null) {
                    response = err.response;
                }
                showRepsonse('POST', url, response.status, response.statusText, response.data);
            });
            break;
    }
};

let disableBgElem = document.getElementById('disable-bg');
disableBgElem.onclick = function () {
    disableBgElem.style.display = 'none';
    responseElem.style.display = 'none';
    setElem.style.display = 'none';
};

let responseElem = document.getElementById('response');
let setElem = document.getElementById('set');
let requestElem = document.getElementById('request');
let statusCodeElem = document.getElementById('status-code');
let responseBodyElem = document.getElementById('response-body');

function showRepsonse(requestType, requestUrl, status, statusText, body) {
    disableBgElem.style.display = 'block';
    responseElem.style.display = 'block';
    setElem.style.display = 'none';

    requestElem.innerText = requestType + ' ' + requestUrl;
    statusCodeElem.innerText = status + ' ' + statusText;
    responseBodyElem.innerText = JSON.stringify(body, null, 4);
}

function setSet(name, inputs) {
    //remove all inputs
    while (setFormElem.firstChild) {
        setFormElem.removeChild(setFormElem.firstChild);
    }

    setFormElem.dataset.name = name;

    inputs.forEach(input => {
        let inputHtml;

        switch (input.type) {
            case 'text':
                inputHtml = '<input id="' + input.id + '" type="text" class="set-text" placeholder="' + input.placeholder + '"/>';
                break;
            case 'select':
                inputHtml = '<select id="' + input.id + '" class="set-sel">';
                input.options.forEach(option => {
                    inputHtml += '<option value="' + option.value + '">' + option.text + '</option>';
                });
                inputHtml += '</select>';
                break;
        }


        setFormElem.innerHTML += inputHtml;

        disableBgElem.style.display = 'block';
        setElem.style.display = 'block';
    });
    setFormElem.innerHTML += '<input type="submit" class="set-btn" value="Submit"/>';
}

function jwtPostApiCall(url, data, callback) {
    let conf = {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('jwt')
        }
    };
    axios.post(url, data, conf)
        .then(response => {
            callback(null, response);
        }).catch(err => {
            if (err.response.status === 401 && err.response.data.err === 'Invalid token') {
                //if jwt is invalid --> try to get new one with refreshToken

                let d = {
                    apiToken: API_TOKEN,
                    refreshToken: localStorage.getItem('refreshToken')
                };

                axios.post(API_SERVER + '/refreshToken', d)
                    .then(response => {
                        localStorage.setItem('jwt', response.data.token);
                        //if refreshToken is valid --> try again
                        jwtPostApiCall(url, data, callback);
                    }).catch(err => {
                        callback(err);
                    }
                );
            } else {
                callback(err);
            }
        }
    );
}

function jwtGetApiCall(url, callback) {
    let conf = {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('jwt')
        }
    };
    axios.get(url, conf)
        .then(response => {
            callback(null, response);
        }).catch(err => {
            getDeleteJWTErrResponse(err, url, callback, jwtGetApiCall);
        }
    );
}

function jwtDeleteApiCall(url, callback) {
    let conf = {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('jwt')
        }
    };
    axios.delete(url, conf)
        .then(response => {
            callback(null, response);
        }).catch(err => {
            getDeleteJWTErrResponse(err, url, callback, jwtDeleteApiCall);
        }
    );
}

function getDeleteJWTErrResponse(err, url, callback, calFun) {
    if (err.response.status === 401 && err.response.data.err === 'Invalid token') {
        let d = {
            apiToken: API_TOKEN,
            refreshToken: localStorage.getItem('refreshToken')
        };

        axios.post(API_SERVER + '/refreshToken', d)
            .then(response => {
                localStorage.setItem('jwt', response.data.token);
                calFun(url, callback);
            }).catch(err => {
                callback(err);
            }
        );
    } else {
        callback(err);
    }
}