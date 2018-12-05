let getParams = window.location.search;
let loginCode = getParams.substring(getParams.indexOf('loginCode') + 10);

axios.get(API_SERVER + '/getToken/' + loginCode + '/apiToken/' + API_TOKEN)
    .then(response => {
        localStorage.setItem('jwt', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);

        let loc = window.location.toString();
        window.location = loc.substring(0, loc.indexOf('login.html'));
    }).catch(err => {
        console.log(err.response);
    }
);