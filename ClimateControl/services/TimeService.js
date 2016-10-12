(function () {
    "use strict";

    angular.module("climateControl")
        .factory("TimeService", ['$rootScope', '$timeout', '$interval', TimeService]);

    function TimeService($rootScope, $timeout, $interval) {

        console.log('TimeService instantiated');

        var self = this;
        var _promises = {};

        function init() {            
            self.hours = ['0:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
            self.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            self.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            self.timeSpanType = {
                DAY: 0,
                MONTH: 1
            }

            self.getTodayJSONTimeSpan = getTodayJSONTimeSpan;
            self.getJSONTimeSpan = getJSONTimeSpan;

            setTime();
            //guardo quanto manca alla prossima ora
            //aspetto
            //quando scatta la prossima ora
            //imposto ora e giorno correnti
            //aspetto un'ora e ripeto
            _promises['timeout'] = $timeout(startCheck, (60 - new Date().getMinutes()) * 60000);
        }
        function startCheck() {
            setTime();
            _promises['interval'] = $interval(setTime, 3600000)
        }
        function setTime() {
            var now = new Date();
            self.currentHour = now.getHours();
            self.currentDay = self.days[now.getDay() - 1];
            $rootScope.$broadcast('timeChanged');
            console.log('timeChanged broadcasted');
        }
        function getTodayJSONTimeSpan(timeSpanType) {
            var currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            var dateBefore = null;
            var dateAfter = null;

            if (timeSpanType === self.timeSpanType.DAY) {
                dateBefore = new Date(currentDate.getTime());
                dateBefore.setDate(currentDate.getDate() - 1);
                dateBefore.setHours(23, 0, 0, 0);
                dateBefore = dateBefore.toISOString();
                dateAfter = new Date(currentDate.getTime());
                dateAfter.setDate(currentDate.getDate() + 1)
                dateAfter.setHours(0, 0, 0, 0);
                dateAfter = dateAfter.toISOString();
            }
            else if (timeSpanType === self.timeSpanType.MONTH) {
                dateBefore = new Date(currentDate.getTime());
                dateBefore.setDate(0);
                dateBefore.setHours(23, 0, 0, 0);
                dateBefore = dateBefore.toISOString();
                dateAfter = new Date(currentDate.getTime());
                dateAfter.setMonth(currentDate.getMonth() + 1)
                dateAfter.setDate(1)
                dateAfter.setHours(0, 0, 0, 0);
                dateAfter = dateAfter.toISOString();
            }

            return {
                'dateBefore': dateBefore,
                'dateAfter': dateAfter
            }
        }
        function getJSONTimeSpan(date, timeSpanType) {
            var currentDate = angular.copy(date);
            currentDate.setHours(0, 0, 0, 0);
            var dateBefore = null;
            var dateAfter = null;

            if (timeSpanType === self.timeSpanType.DAY) {
                dateBefore = new Date(currentDate.getTime());
                dateBefore.setDate(currentDate.getDate() - 1);
                dateBefore.setHours(23, 0, 0, 0);
                dateBefore = dateBefore.toISOString();
                dateAfter = new Date(currentDate.getTime());
                dateAfter.setDate(currentDate.getDate() + 1)
                dateAfter.setHours(0, 0, 0, 0);
                dateAfter = dateAfter.toISOString();
            }
            else if (timeSpanType === self.timeSpanType.MONTH) {
                dateBefore = new Date(currentDate.getTime());
                dateBefore.setDate(0);
                dateBefore.setHours(23, 0, 0, 0);
                dateBefore = dateBefore.toISOString();
                dateAfter = new Date(currentDate.getTime());
                dateAfter.setMonth(currentDate.getMonth() + 1)
                dateAfter.setDate(1)
                dateAfter.setHours(0, 0, 0, 0);
                dateAfter = dateAfter.toISOString();
            }

            return {
                'dateBefore': dateBefore,
                'dateAfter': dateAfter
            }
        }
   
                 
        //var now = new Date();
        //self.currentHour = now.getHours();
        //self.currentDay = self.days[now.getDay() - 1];       

        init();

        return self;
    }
})();