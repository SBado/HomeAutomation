(function () {
    "use strict";

    angular.module('climateControl')
        .factory('TemperatureService', ['$rootScope', 'ConfigService', TemperatureService]);


    function TemperatureService($rootScope, ConfigService) {

        console.log('TemperatureService instantiated');

        var self = this;
        var _eventHandlers = [];
        var trends = {
            RISING: 'rising',
            FALLING: 'falling',
            NOCHANGE: 'nochange'
        }
        var oldRoomTemp = 10;

        function setMinTemp(temp) {
            self.minTemp.value = parseFloat(temp);
        }
        function setMaxTemp(temp) {
            self.maxTemp.value = parseFloat(temp);
        }
        function openConnection() {
            //    // the URL of the WAMP Router (e.g. Crossbar.io)
            //    //
            //    var wsuri;
            //    if ($document.location.origin == "file://") {
            //        wsuri = "ws://localhost:8080/ws";
            //    } else {
            //        wsuri = "ws://" + $document.location.hostname + ":8080";
            //    }

            //    // connect to WAMP server
            //    //
            //    var connection = new autobahn.Connection({
            //        url: wsuri,
            //        realm: 'realm1'
            //    });
            //    connection.onopen = function (new_session) {
            //        console.log("connected to " + wsuri);
            //        session = new_session;
            //        session.subscribe("com.myapp.mcu.on_analog_value", onAnalogValue);
            //        eventCnt = 0;
            //        $interval(updateEventCnt, eventCntUpdateInterval * 1000);
            //    };
            //    connection.open();

            console.log('aeiou');
        };
        function onAnalogValue(args) {
            var payload = args[0];
            //DA CALCOLARE LA TEMPERATURA? O MI ARRIVA A POSTO?
            //payload.value = payload.value / 400 * 100;
            //payload.value = payload.value.toFixed(2);
            switch (payload.id) {
                case 0:
                    updateRoomTemperature(payload.value);
                    //$rootScope.$broadcast('newTemperatureReading', { 'value': payload.value })
                    break;
                case 1:
                    updateHumidity(payload.value);
                    //$rootScope.$broadcast('newHumidityReading', { 'value': payload.value })
                    break;
                default:
                    break;
            }
        }             
        function updateRoomTemperature(roomTemperature) {
            if (roomTemperature > oldRoomTemp)
                self.trend = trends.RISING;
            else if (roomTemperature < oldRoomTemp)
                self.trend = trends.FALLING
            else
                self.trend = trends.NOCHANGE;

            oldRoomTemp = self.temperatures.roomTemperature;
            self.temperatures.roomTemperature = roomTemperature;
        }
        function updateHumidity(humidity) {
            self.humidity = humidity;
        }
        function startBurning(targetTemperature) {
            $rootScope.$broadcast('burningStarted');
        }
        function isBurning() {
            return false;
        }
        function stopBurning() {
            $rootScope.$broadcast('burningStopped');
        }
        function getSession() {
            return session;
        }
        function init() {
            self.minTemp = { value: 2 };
            self.maxTemp = { value: 35 };
            self.minTemperature = 2;
            self.maxTemperature = 35;
            self.roomTemperature = 20;
            self.humidity = 23;
            self.trend = trends.NOCHANGE;
            self.startBurning = startBurning;
            self.isBurning = isBurning;
            self.stopBurning = stopBurning;
            self.getSession = getSession;

            _eventHandlers.push($rootScope.$on('minTempChanged', function (event, args) {
                setMinTemp(args)
            }));
            _eventHandlers.push($rootScope.$on('maxTempChanged', function (event, args) {
                setMaxTemp(args)
            }));

            ConfigService.getConfig('minTemp').$promise.then(function (result) {
                setMinTemp(result.data)
            });
            ConfigService.getConfig('maxTemp').$promise.then(function (result) {
                setMaxTemp(result.data)
            });

            openConnection();                 
        }       
        
        init();

        return self;
    }
})();