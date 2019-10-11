var APIManager = function () {
    var token,
        baseUrl = "//" + window.location.hostname,
        apiUrl = "https://api.toon.eu/toon/v3",
        self = this;

    self.loggedIn = false;
    self.agreements = null;

    self.login = (callback) => {
        $.getJSON(baseUrl + ":3001/login", (data) => {
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


    self.getAgreements = (cb) => {
        if (!self.loggedIn) {
            console.warn('You need to have a user-token to use this, try logging in first!');
            return;
        }
        if (self.agreements) {
            cb(self.agreements);
            return;
        }

        $.ajax({
            url: apiUrl + '/agreements',
            type: 'GET',
            dataType: 'json',
            success: (data) => {
                self.agreements = data;
                cb(data);
            },
            error: (data) => {
                cb(null, data.responseText);
            }
        });

    };

    self.getStatus = (agremeentId, success, error) => {
        if (!self.loggedIn) {
            console.warn('You need to have a user-token to use this, try logging in first!');
            return;
        }

        $.ajax({
            url: apiUrl + '/' + agremeentId + '/status',
            type: 'GET',
            dataType: 'json',
            success: success,
            error: error
        });

    };

    self.getThermostat = (agreementId, success, error) => {
        if (!self.loggedIn) {
            console.warn('You need to have a user-token to use this, try logging in first!');
            return;
        }

        $.ajax({
            url: apiUrl + '/' + agreementId+ '/thermostat',
            type: 'GET',
            dataType: 'json',
            success: success,
            error: error
        });
    };

    self.setTemperature =  (agreementId, setpoint) => {
        if (!self.loggedIn) {
            console.warn('You need to have a user-token to use this, try logging in first!');
            return;
        }
        console.log('Setting Temperature to: ' + setpoint);

        self.getThermostat(agreementId, (currentState) => {
            currentState.currentSetpoint = setpoint;

            $.ajax({
                url: apiUrl + '/' + agreementId + '/thermostat',
                type: 'PUT',
                dataType: 'text',
                contentType: 'application/json',
                data: JSON.stringify(
                    currentState
                ),
                success: () => {
                    console.log("New setpoint accepted by API");
                },
                error: (e) => {
                    console.log("Error while updating setpoint : " + JSON.stringify(e, null, 4));
                }
            });
        }, (error) => {
            console.log(error);
        });
    };

    self.setProgram = (agreementId, enabled) => {
        if (enabled) {
            self.setDisplayToState(agreementId, -1, 1/*Program on*/);
        } else {
            self.setDisplayToState(agreementId, -1, 0/*Program off*/);
        }
    };

    self.setDisplayToState = (agreementId, activeState, programState) => {
        console.log("setDisplayToState activeState: " + activeState + " programState: " + programState);
        if (!self.loggedIn) {
            console.warn('You need to have a user-token to use this, try logging in first!');
            return;
        }

        self.getThermostat(agreementId, (currentState) => {
            currentState.activeState = activeState;
            currentState.programState = programState;
            
            $.ajax({
                url: apiUrl + '/' + agreementId + '/thermostat',
                type: 'PUT',
                dataType: 'text',
                contentType: 'application/json',
                data: JSON.stringify(currentState),
                success: () => {
                    console.log("New schemeState accepted by API");
                },
                error: (e) => {
                    console.log("Error while updating scheme State : " + JSON.stringify(e, null, 4));
                }
            });
        });
    };
};
