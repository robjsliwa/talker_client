import Fetch from 'whatwg-fetch'

const managementApiUrl = 'https://st-irisauth-wcdcc-001.poc.sys.comcast.net/'

export default class AuthApiController {
  _checkStatus(response) {
    console.log('response status: ' + response.status);
    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      let error = new Error(response.statusText);
      error.response = response;
      throw error;
    }
  }

  _parseJSON(response) {
    return response.json();
  }

  login(userID, successCallback, errorCallback) {
    return fetch(managementApiUrl + 'login/anonymous/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Key': 'bJjeXEpiqXMBAJpuDr0ksg7pkUCQlNlV',
      },
      body: JSON.stringify({
        'UserID': userID,
      }),
    })
    .then(this._checkStatus)
    .then(this._parseJSON)
    .then((data) => {
      successCallback(data);
    })
    .catch((error) => {
      if (error.response && error.response.status == 404) {
        notFoundCallback();
      } else if(error.response && error.response.status == 401) {
        // token expired - logout
        UserActions.logout();
      } else {
        console.log('Get all applications failed' + error);
        errorCallback(error);
      }
    });
  }
}
