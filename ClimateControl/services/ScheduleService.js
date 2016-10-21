(function () {
    "use strict";

    angular.module("climateControl")
        .factory("ScheduleService", ['TimeService', 'ModelService', ScheduleService]);

    function ScheduleService(TimeService, ModelService) {

        console.log('ScheduleService instantiated');

        var self = this;
        var _eventHandlers = [];

        function init() {
            _eventHandlers.push($rootScope.$on('timeChanged', upateSchedule));
        }
        function clean() {
            for (var i = 0; i < _eventHandlers.length; i++) {
                _eventHandlers[i]();
            }
        }
        function getMonthlySchedule() {
            var timespan = TimeService.getTodayJSONTimeSpan(TimeService.timeSpanType.DAY);
            return ModelService.scheduled_temps().get({ timespan: JSON.stringify(timespan) }, null, getMonthlyScheduledTemp, function (error) { console.log(error); });
        }
        function getMonthlyScheduledTemp(schedule) {
            var temperatures = schedule.data;
            if (temperatures.length > 0) {
                self.scheduledBoilerTemperature = temperatures[TimeService.currentHour];
                return;
            }
            self.scheduledBoilerTemperature = 2;
        }
        function getDailySchedule() {
            return ModelService.daily_temps().get({ day: TimeService.currentDay, hour: TimeService.currentHour + ':00' }, null, getDailyScheduledTemp, function (error) { console.log(error); });
        }
        function getDailyScheduledTemp(schedule) {
            self.scheduledBoilerTemperature = schedule.data || 2;
        }
        function upateSchedule() {
            console.log('UPDATE SCHEDULE');
            return ModelService.scheduled_days().get({}, function (result) {
                if (!result.data || result.data.length == 0) {
                    return getDailySchedule();
                    //return;
                }
                var now = new Date();
                now.setHours(0, 0, 0, 0);
                now.setMinutes(-1 * now.getTimezoneOffset());
                now = now.toISOString();
                for (var i = 0; i < 24; i++) {
                    if (result.data[i] === now) {
                        return getMonthlySchedule();
                        //return;
                    }
                }
                return getDailySchedule();
            }, function (error) { console.log(error); });
        }       

        self.scheduledBoilerTemperature = 2;

        self.upateSchedule = upateSchedule;        

        return self;
    }
})();