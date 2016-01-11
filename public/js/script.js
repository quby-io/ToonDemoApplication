var api = new APIManager();
var temperatureInfo = null;
var updater = null;

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
    api.login(function () {
        $('.content').show();
        $('aside.actions').hide();

        initProgramStates();

        //Enable the interval-update!
        updater = new StatusUpdater(statusParser);
    });
}

function changeState(event) {
    event.preventDefault();

    var button = $(event.currentTarget);
    var buttons = button.parent().find("button");

    buttons.removeClass('selected');
    button.addClass('selected');

    updater.pause(function () {
        //send the call to the api
        api.setDisplayToState(0, button.index());
    });
}

function toggleProgram(event) {
    event.preventDefault();

    var button = $(event.currentTarget);
    var state = button.hasClass('active');

    $('.thermostat-program .switch').toggleClass('active');

    updater.pause(function () {
        //send the call to the api
        api.setProgram(!state);
    });
}

function temperatureChange(event) {

    if ($(event.currentTarget).data('type') == "up") {
        temperatureInfo.currentSetpoint += 50;
    } else {
        temperatureInfo.currentSetpoint -= 50;
    }

    $('.temperature').html(formatTemperature(temperatureInfo.currentSetpoint));

    updater.pause(function () {
        //send the call to the api
        api.setTemperature(temperatureInfo.currentSetpoint);
    });
}

function initProgramStates() {
    var error = function (error) {
        console.log(error);
    };
    api.getProgramStates(programEvent, error);
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
