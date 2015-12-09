var APIManager = function (view, accessToken) {
    var requestTimer,
        requestHandle,
        postTimer,
        thermView = view,
        token = accessToken,
        self = this;

    $.ajaxSetup({
        headers: { 'Authorization': 'Bearer '+token }
    });
    
    var getAgreement = function (cache) {

        $.ajax({
            url: 'https://api.toonapi.com/toon/api/v1/agreements',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                registerAgreement(data);
            },
            error: function (e) {
                handleAgreementError();
            }
        });
    
    }
    
    var registerAgreement = function (data) {
    
        $.ajax({
            url: 'https://api.toonapi.com/toon/api/v1/agreements',
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                agreementId: data[0].agreementId
            }),
            success: function () {
                console.log("Error while updating scheme State : " + JSON.stringify(e, null, 4));
            },
            error: function (e) {
                console.log("Error while updating scheme State : " + JSON.stringify(e, null, 4));
            }
        });

    }
    
    var handleAgreementError = function () {
        console.log("Error while registering agreement");
    };

    var getDataFromWSO2 = function (cache) {
        var timeStamp = new Date().getTime().toString();

        requestHandle = $.ajax({
            url: 'https://api.toonapi.com/toon/api/v1/status',
            type: 'GET',
            dataType: 'text',
            success: function (data) {
                handleUpdateData(data);
            },
            error: function (e) {
                handleUpdateError(e);
            }
        });

    };

    var handleUpdateData = function (updates) {
        if (updates == "") {
            console.log("Nothing changed!");
            startUpdates();
            return;
        }
        
        var jsonDATA = JSON.parse(updates);
        var thermostatInfo = jsonDATA.thermostatInfo;
        var thermostatStates = jsonDATA.thermostatStates;
        
        console.log("Got update data");
                
        if (typeof thermostatInfo !== 'undefined') {
            if (thermostatInfo.programState !== null && thermostatInfo.programState == "0" || thermostatInfo.programState == "8") {
                view.model.set({"programActive": false});
            } else {
                view.model.set({"programActive": true});
            }
            var temp = getTempString(parseFloat(thermostatInfo.currentDisplayTemp));
            var setpoint = getTempString(parseFloat(thermostatInfo.currentSetpoint));
            view.model.set({
                "temperature": temp,
                "programText": "Op " + setpoint,
                "setpoint": parseInt(thermostatInfo.currentSetpoint),
                "actualTemp": parseInt(thermostatInfo.currentDisplayTemp),
                "stateActive": thermostatInfo.activeState
            });
        }
        if (typeof thermostatStates !== 'undefined') {
            for (var i = 0; i < thermostatStates.state.length; i++) {
                var temp = parseFloat(thermostatStates.state[i].tempValue);
                var tempString = getTempString(temp);
                switch (thermostatStates.state[i].id) {
                    case "0":
                        view.model.set({"comfortTemp": temp, "comfortTempString": tempString});
                        break;
                    case "1":
                        view.model.set({"homeTemp": temp, "homeTempString": tempString});
                        break;
                    case "2":
                        view.model.set({"sleepTemp": temp, "sleepTempString": tempString});
                        break;
                    case "3":
                        view.model.set({"awayTemp": temp, "awayTempString": tempString});
                        break;
                }
            }
        }

        startUpdates();
    };

    var stopUpdates = function () {
        clearTimeout(requestTimer);
        if(requestHandle){
            requestHandle.abort();
        }
    };

    var startUpdates = function () {
        clearTimeout(requestTimer);
        requestTimer = setTimeout(function () {
            getDataFromWSO2();
        }, intervalTime);
    };

    var handleUpdateError = function (error) {
        console.log("Got error :" + JSON.stringify(error, null, 4));
        requestTimer = setTimeout(function () {
            getDataFromWSO2();
        }, intervalTime);
    };

    self.updateSetpoint = function (setpoint) {
        clearTimeout(postTimer);
        stopUpdates();
        postTimer = setTimeout(function () {
            console.log("Setting setpoint to :"+setpoint);
            $.ajax({
                url: 'https://api.toonapi.com/toon/api/v1/temperature',
                type: 'PUT',
                dataType: 'text',
                contentType: 'application/json',
                data: JSON.stringify({
                    "scale": "C",
                    value: setpoint
                }),
                success: function () {
                    console.log("New setpoint accepted by API");
                    startUpdates();
                },
                error: function (e) {
                    console.log("Error while updating setpoint : " + JSON.stringify(e, null, 4));
                    startUpdates();
                }
            });
        }, 1000);
    };

    self.setComfortProgram = function (){
        updateProgram(0,0);
    };
    self.setHomeProgram = function (){
        updateProgram(0,1);
    };
    self.setAwayProgram = function (){
        updateProgram(0,3);
    };
    self.setSleepProgram = function (){
        updateProgram(0,2);
    };
    self.enableProgram = function(){
        updateProgram(0,6);
    };
    self.disableProgram = function() {
        updateProgram(1,5);
    };

    var updateProgram = function(state,temperatureState){
        clearTimeout(postTimer);
        stopUpdates();
        postTimer = setTimeout(function () {
            $.ajax({
                url: 'https://api.toonapi.com/toon/api/v1/temperature/states',
                type: 'PUT',
                dataType: 'text',
                contentType: 'application/json',
                data: JSON.stringify({
                    state: state,
                    temperatureState: temperatureState
                }),
                success: function () {
                    console.log("New schemeState accepted by API");
                    startUpdates();
                },
                error: function (e) {
                    console.log("Error while updating scheme State : " + JSON.stringify(e, null, 4));
                    startUpdates();
                }
            });
        }, 1000);
    };
 
    // get agreement id
    getAgreement();
    
    // Get initial data, allow data from the WSO2 cache to prevent only getting the refreshes from the longpoll mechanism
    getDataFromWSO2(false);
}