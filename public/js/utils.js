var api = new APIManager();

/**
 * The statusUpdater handles the logistics of doing continuous updates.
 * The display can get updates from other sources besides your app, for this we have a statuscall that needs to be called regularly.
 * When you do an update with the api, the response will be empty and you can see the result when it comes in with the updater
 * @param success
 * @constructor
 */
function StatusUpdater(success) {
    this.updateInterval = 1000;
    this.pauseInterval = 500;
    this.success = success;

    this.start();
}
StatusUpdater.prototype = {
    start: function () {
        console.log('Started the status updater');

        var self = this;

        this.updateTimer = setInterval(function () {
            api.getStatus(self.success, self.statusError);
        }, this.updateInterval);
    },
    stop: function () {
        console.log('Stopped the status updater');
        clearInterval(this.updateTimer);
    },
    pause: function (pauseAction) {
        var self = this;
        this.stop();

        clearTimeout(this.pauseTimer);
        this.pauseTimer = setTimeout(function () {

            pauseAction();

            //start the updater
            self.start();
        }, this.pauseInterval);
    },
    statusError: function (error) {
        console.error(error);
    }
};

function formatTemperature(temp) {
    if (temp / 100 > 1) {
        temp = temp / 100;
    }
    tempStr = "";
    if (temp % 1 == 0)
        tempStr += temp + ",0";
    else
        tempStr += temp;
    tempStr = tempStr.replace(".", ",");
    tempStr += "&deg;";
    return tempStr;
}
