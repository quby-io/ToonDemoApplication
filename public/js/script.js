var api = new APIManager();
var temperatureInfo = null;
var updater = null;
var selectedAgreementId = null;

if (!api.loggedIn) {
    $('.content').hide();
    $('aside.actions').show();
} else {
    $('.content').show();
    $('aside.actions').hide();
}

$("[data-action=login]").on('click', login);
$("[data-action=state]").on('click', 'button', changeState);
$("[data-action=toggleProgram]").on('click', toggleProgram);
$("[data-action=temperature]").on('click', temperatureChange);

function login(event) {
    event.preventDefault();
    api.login(() => {
        // It is possible to have more than one display per customer, if that is the case, we are showing the agreements
        // and the user has to pick one. (If not, just select the first one)
        api.getAgreements((agreements, error) => {
            if (error) {
                console.log(error);
            } else {
                console.log(agreements);
                switch (agreements.length) {
                    case 0:
                        console.error('There are no agreements registered for this user. Contact support');
                        break;
                    case 1:
                        selectAgreement(agreements[0].agreementId);
                        break;
                    default:
                        showAgreements(agreements);
                }
            }
        });

    });
}

function showAgreements(agreements) {
    //This should display the agreements, and the user does the selection.
    console.log(agreements);
}

function selectAgreement(agreementId) {
    $('.content').show();
    $('aside.actions').hide();

    selectedAgreementId = agreementId;

    //Enable the interval-update!
    updater = new StatusUpdater(agreementId, statusParser);
}

function changeState(event) {
    event.preventDefault();

    var button = $(event.currentTarget);
    var buttons = button.parent().find("button");

    buttons.removeClass("selected");
    button.addClass('selected');

    updater.pause(() => {
        //send the call to the api
        api.setDisplayToState(selectedAgreementId, button.index(), 0);
    });
}

function toggleProgram(event) {
    event.preventDefault();

    var button = $(event.currentTarget);
    var state = button.hasClass('active');

    $('.thermostat-program .switch').toggleClass('active');

    updater.pause(() => {
        //send the call to the api
        api.setProgram(selectedAgreementId, !state);
    });
}

function temperatureChange(event) {
    if ($(event.currentTarget).data('type') == "up") {
        temperatureInfo.currentSetpoint += 50;
    } else {
        temperatureInfo.currentSetpoint -= 50;
    }

    $('.temperature').html(formatTemperature(temperatureInfo.currentSetpoint));

    updater.pause(() => {
        //send the call to the api
        api.setTemperature(selectedAgreementId, temperatureInfo.currentSetpoint);
    });
}

function statusParser(update) {
    if (!update) {
        //nothing changed!
        return;
    }
    if (update.thermostatInfo) {
        temperatureEvent(update.thermostatInfo);
    }
    if (update.thermostatStates) {
        programEvent(update.thermostatStates);
    }
}

function temperatureEvent(info) {

    //Update the global variable, so we can use that when changing the temperature
    temperatureInfo = info;

    if (info.programState !== null && info.programState == "0" || info.programState == "8") {
        $('.thermostat-program .switch').removeClass('active');
    } else {
        $('.thermostat-program .switch').addClass('active');
    }

    var temp = formatTemperature(parseFloat(info.currentDisplayTemp));
    var setpoint = formatTemperature(parseFloat(info.currentSetpoint));

    if (info.currentDisplayTemp != info.currentSetpoint) {
        $('.set-temperature').html(formatTemperature(setpoint));
    }
    if (info.activeState != -1) {
        $('.state-buttons .state-button:nth(' + info.activeState + ')').addClass('selected');
    } else {
        $('.state-buttons .state-button:nth(' + info.activeState + ')').removeClass('selected');
    }

    $('.temperature').html(temp);
}

function programEvent(states) {
    var programButtons = $('.state-buttons .state-button');

    for (var i = 0; i < states.length; i++) {
        var tempString = formatTemperature(parseFloat(states[i].tempValue));

        $(programButtons[i]).find('.temp').html(tempString);
    }
}
