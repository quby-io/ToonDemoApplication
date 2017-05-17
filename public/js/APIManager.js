var APIManager = function () {
    var token,
        baseUrl = "//" + window.location.hostname,
        apiUrl = "https://api.toonapi.com/toon/api/v1",
        self = this;

    self.loggedIn = false;
    self.agreements = null;

    self.login = function (callback) {
        $.getJSON(baseUrl + ":3001/login", function (data) {
            var obj = JSON.parse(data);
            if (obj.access_token !== null) {
                self.token = obj.access_token;

                //subsequent calls will be done with this authentication-token.
                $.ajaxSetup({
                    headers: {'Authorization': 'Bearer ' + self.token}
                });
                self.loggedIn = true;
            } else {
                console.error("No access token, data : " + data);
                self.loggedIn = false;
            }
            if (callback) {
                callback();
            }
        });
    };


    self.getAgreements = function (success, error) {
        if (!self.loggedIn) {
            console.warn('You need to have a user-token to use this, try logging in first!');
            return;
        }
        if (self.agreements) {
            success(self.agreements);
            return;
        }

        $.ajax({
            url: apiUrl + '/agreements',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                self.agreements = data;
                success(data);
            },
            error: error
        });

    };

    self.selectAgreement = function (agreementId, success, error) {
        if (!self.loggedIn) {
            console.warn('You need to have a user-token to use this, try logging in first!');
            return;
        }
        var agreementObject = {
            agreementId : agreementId
        };

        $.ajax({
            url: apiUrl + '/agreements',
            type: 'POST',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify(agreementObject),
            success: success,
            error: error
        });
    };

    self.getStatus = function (success, error) {
        if (!self.loggedIn) {
            console.warn('You need to have a user-token to use this, try logging in first!');
            return;
        }

        $.ajax({
            url: apiUrl + '/status',
            type: 'GET',
            dataType: 'json',
            success: success,
            error: error
        });

    };

    self.getTemperature = function (success, error) {
        if (!self.loggedIn) {
            console.warn('You need to have a user-token to use this, try logging in first!');
            return;
        }

        $.ajax({
            url: apiUrl + '/temperature',
            type: 'GET',
            dataType: 'json',
            success: success,
            error: error
        });
    };

    self.setTemperature = function (setpoint) {
        if (!self.loggedIn) {
            console.warn('You need to have a user-token to use this, try logging in first!');
            return;
        }
        console.log('Setting Temperature to: ' + setpoint);

        $.ajax({
            url: apiUrl + '/temperature',
            type: 'PUT',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify({
                "scale": "C",
                value: setpoint
            }),
            success: function () {
                console.log("New setpoint accepted by API");
            },
            error: function (e) {
                console.log("Error while updating setpoint : " + JSON.stringify(e, null, 4));
            }
        });
    };

    self.getProgramStates = function (success, error) {
        if (!self.loggedIn) {
            console.warn('You need to have a user-token to use this, try logging in first!');
            return;
        }

        $.ajax({
            url: apiUrl + '/temperature/states',
            type: 'GET',
            dataType: 'json',
            success: success,
            error: error
        });

    };

    self.setComfort = function () {
        self.setDisplayToState(0, 0);
    };
    self.setHome = function () {
        self.setDisplayToState(0, 1);
    };
    self.setSleep = function () {
        self.setDisplayToState(0, 2);
    };
    self.setAway = function () {
        self.setDisplayToState(0, 3);
    };

    self.setProgram = function (enabled) {
        if (enabled) {
            self.setDisplayToState(0, 6);
        } else {
            self.setDisplayToState(1, 5);
        }
    };

    self.setDisplayToState = function (state, temperatureState) {
        if (!self.loggedIn) {
            console.warn('You need to have a user-token to use this, try logging in first!');
            return;
        }

        $.ajax({
            url: apiUrl + '/temperature/states',
            type: 'PUT',
            dataType: 'text',
            contentType: 'application/json',
            data: JSON.stringify({
                state: state,
                temperatureState: temperatureState
            }),
            success: function () {
                console.log("New schemeState accepted by API");
            },
            error: function (e) {
                console.log("Error while updating scheme State : " + JSON.stringify(e, null, 4));
            }
        });
    };
};
