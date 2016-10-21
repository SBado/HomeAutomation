(function () {
    'use strict';

    angular.module('climateControl')
        .directive('weekScheduler', weekSchedulerDirective)
        .controller('WeekSchedulerController', WeekSchedulerController)
        .controller('WS_ModalInstanceController', WS_ModalInstanceController);

    function weekSchedulerDirective() {
        return {
            restrict: 'E',
            templateUrl: 'directives/elements/templates/WeekScheduler.html',
            controller: WeekSchedulerController,
            controllerAs: 'vm',
            scope: {},           
        };
    }

    WeekSchedulerController.$inject = ['$rootScope', '$scope', '$uibModal', '$confirm', 'ClipboardService', 'ModelService', 'TimeService', 'temperatures'];
    WS_ModalInstanceController.$inject = ['$uibModalInstance', 'params'];

    function WeekSchedulerController($rootScope, $scope, $uibModal, $confirm, ClipboardService, ModelService, TimeService, temperatures) {

        var vm = this;

        var _clipboard = ClipboardService.clipboard;
        var _clipboardType = ClipboardService.type;
        var _data = temperatures.data;
        var _days = TimeService.days;
        var _eventHandlers = [];

        function init() {            
                    
            vm.values = {};
            /*for (var i = 0; i < _data.length; i += 24) {            	            	
            	vm.values[_data[i].Day] = {};
            }
            for (var i = 0; i < _data.length; i++) {
            	vm.values[_data[i].Day][_data[i].Hour] = _data[i].Temperature;            	                
            }*/
            
            _data.forEach(function (element) {
	        	if (!vm.values[element.Day])
	        		vm.values[element.Day] = {};
	        	vm.values[element.Day][element.Hour] = element.Temperature;
	        });

            //TODO: query per valore di isBurning
            vm.isBurning = true;
            vm.today = TimeService.currentDay;
            vm.currentHour = TimeService.currentHour + ':00';            
            vm.hours = TimeService.hours;                        
            vm.emptyContextMenu = [];
            vm.hourContextMenu = [
                ['Copy', function ($itemScope) {
                    _clipboard.set(_clipboardType.HOUR, $itemScope.temperature);
                }],                               
                ['Copy To Day', function ($itemScope, $event, model) {
                    _clipboard.set(_clipboardType.HOUR, $itemScope.temperature);
                    setSameTempForDay(model, $itemScope.temperature);
                }],
                ['Copy To Hour', function ($itemScope, $event, model) {
                    _clipboard.set(_clipboardType.HOUR, $itemScope.temperature);
                    setSameTempForHour($itemScope.hour, $itemScope.temperature);
                }],                                
                ['Copy To All', function ($itemScope) {                                       
                    $confirm({ title: 'Warning', text: 'Are you sure you want to overwrite all of your schedules?', type: 'danger' }, { animation: true, size: 'sm' }).then(function () {
						_clipboard.set(_clipboardType.HOUR, $itemScope.temperature);                        
                        setSameTempForAll($itemScope.temperature);
                    })
                }],                                
                ['Paste', function ($itemScope, $event, model) {                    
                    setTempForDayAtHour(model, $itemScope.hour, _clipboard.get().values[0]);
                }, function ($itemScope) {
                    return _clipboard.get().values.length == 1 && _clipboard.get().type === _clipboardType.HOUR;
                }],                
                ['Reset', function ($itemScope, $event, model) {
                    $confirm({ text: 'Are you sure you want to reset ' + model + ' at ' + $itemScope.hour + '?' }, { animation: true, size: 'sm' }).then(function () {
                        setTempForDayAtHour(model, $itemScope.hour, 2.0);
                    })
                }],                                
                ['Reset Day', function ($itemScope, $event, model) {
                    $confirm({ title: 'Warning', text: 'Are you sure you want to reset ' + model + '?', type: 'warning' }, { animation: true, size: 'sm' }).then(function () {
                        setSameTempForDay(model, 2.0);
                    })
                }],                               
                ['Reset All Days', function ($itemScope) {
                    $confirm({ title: 'Warning', text: 'Are you really sure you want to reset all days?', type: 'danger' }, { animation: true, size: 'sm' }).then(function () {                     
                        setSameTempForAll(2.0);
                    })
                }]
            ];
            vm.dayContextMenu = [
                ['Copy Day', function ($itemScope) {
                    _clipboard.set(_clipboardType.DAY, getTemperatures($itemScope.day));
                }],                
                ['Copy Day To All', function ($itemScope) {
                	$confirm({ title: 'Warning', text: 'Are you sure you want to overwrite all of your schedules?', type: 'danger' }, { animation: true, size: 'sm' }).then(function () {
	                    _clipboard.set(_clipboardType.DAY, getTemperatures($itemScope.day));
	                    setDifferentTempsForAll(_clipboard.get().values);
                    })
                }],                
                ['Paste Day', function ($itemScope) {
                    setDifferentTempsForDay($itemScope.day, _clipboard.get().values);
                }, function () {
                    return _clipboard.get().values.length == 24 && _clipboard.get().type === _clipboardType.DAY;
                }],
                ['Reset Day', function ($itemScope) {
                    $confirm({ title: 'Warning', text: 'Are you sure you want to reset ' + $itemScope.day + '?', type: 'warning' }, { animation: true, size: 'sm' }).then(function () {
                        setSameTempForDay($itemScope.day, 2.0);
                    })
                }],                
                ['Reset All Days', function ($itemScope) {
                    $confirm({ title: 'Warning', text: 'Are you really sure you want to reset all days?', type: 'danger' }, { animation: true, size: 'sm' }).then(function () {
                        setSameTempForAll(2.0);
                    })
                }]
            ];

            vm.onClick = openModal;
            vm.currentHourStyle = currentHourStyle;

            _eventHandlers.push($rootScope.$on('timeChanged', checkSchedule));
            $scope.$on("$destroy", clean);
        }        
        function checkSchedule() {
            vm.today = TimeService.currentDay;
            vm.currentHour = TimeService.currentHour + ':00';
            //TODO: CONTROLLO SE LA CALDAIA È AVVIATA: isBurning = ...
        }
        function getTemperatures(day) {

            var temps = [];                      
            Object.keys(vm.values[day]).forEach(function(hour) {
            	temps.push(vm.values[day][hour]);
           	});
            return temps;
        }
        function openModal(day, hour, temperature) {
            var modalInstance = $uibModal.open({
                animation: true,
                template: '<div class="modal-header">\
                             <h3 class="modal-title">' + day + ' ' + hour + '</h3>\
                           </div>\
                           <div class="modal-body">\
                             <div style="background-color: rgb(245,245,245); padding-top: 8px; padding-bottom: 8px; border-style: solid; border-width: 1px 0.5px 0.5px 0.5px; border-color: #ddd; border-radius: 6px;">\
                               <slider min="2" max="35" step="0.1" selected-value="vm.temperature" uom="°"></slider>\
                             </div>\
                           </div>\
                           <div class="modal-footer">\
                             <button type="button" class="btn btn-primary btn-sm fade-background-color" ng-click="vm.onOk()">OK</button>\
                             <button type="button" class="btn btn-default btn-sm fade-background-color" ng-click="vm.onCancel()">Cancel</button>\
                           </div>',
                controller: 'WS_ModalInstanceController as vm',
                bindToController: true,
                size: 'sm',
                resolve: {
                    params: {
                        'day': day,
                        'hour': hour,
                        'temperature': temperature
                    }
                }
            });

            modalInstance.result.then(saveSchedule, function () {
            });
        }
        function saveSchedule(schedule) {
            setTempForDayAtHour(schedule.day, schedule.hour, schedule.temperature);
        }
        function setTempForDayAtHour(day, hour, temperature) {

            ModelService.daily_temps().update({ day: day, hour: hour, temperature: temperature }, null, function (result) {
                //deleteCacheForHour(day, hour);
                refreshHour(day, hour);
            });
        }
        function setSameTempForHour(hour, temperature) {
        	
        	var json = {};
            for (var i = 0; i < 7; i++)
                json[_days[i]] = temperature;

            ModelService.daily_temps().update({ hour: hour, temperature: JSON.stringify(json) }, null, function (result) {              
                refreshHours(hour);
            });
        }
        function setDifferentTempsForHour(hour, temperatures) {

			var json = {};
            for (var i = 0; i < 24; i++)
                json[vm.hours[i]] = temperatures[i];

            ModelService.daily_temps().update({ hour: hour, temperature: JSON.stringify(json) }, null, function (result) {                
                refreshHours(hour);
            });
        }
        function setSameTempForDay(day, temperature) {

            var json = {};
            for (var i = 0; i < 24; i++)
                json[vm.hours[i]] = temperature;

            ModelService.daily_temps().update({ day: day, temperature: JSON.stringify(json) }, null, function (result) {                
                refreshDay(day);
            });
        }
        function setDifferentTempsForDay(day, temperatures) {

            var json = {};
            for (var i = 0; i < 24; i++)
                json[vm.hours[i]] = temperatures[i];

            ModelService.daily_temps().update({ day: day, temperature: JSON.stringify(json) }, null, function (result) {                
                refreshDay(day);
            });
        }
        function setSameTempForAll(temperature) {

            var json = {};
            for (var i = 0; i < 24; i++)
                json[vm.hours[i]] = temperature;

            ModelService.daily_temps().update({ temperature: JSON.stringify(json) }, null, function (result) {                
                refreshAll();
            });
        }
        function setDifferentTempsForAll(temperatures) {

            var json = {};
            for (var i = 0; i < 24; i++)
                json[vm.hours[i]] = temperatures[i];

            ModelService.daily_temps().update({ temperature: JSON.stringify(json) }, null, function (result) {                
                refreshAll();
            });
        }
        function refreshHour(day, hour) {                        
            ModelService.daily_temps().get({ day: day, hour: hour }, null, function (result) {                
                vm.values[day][hour] = result.data;
            });                        
        }    
        function refreshHours(hour) {                        
            ModelService.daily_temps().get({ hour: hour }, null, function (result) { 
				result.data.forEach(function (element) {
	        		vm.values[element.Day][hour] = element.Temperature; 
	        	});              
            });                        
        }              
		function refreshDay(day) {
			ModelService.daily_temps().get({ day: day }, null, function (result) {  
				result.data.forEach(function (element) {
	        		vm.values[day][element.Hour] = element.Temperature;
	        	});				
            }); 
		}                
        function refreshAll() {
        	ModelService.daily_temps().get({}, null, function (result) {                
	            result.data.forEach(function (element) {
	        		vm.values[element.Day][element.Hour] = element.Temperature;
	            });
            }); 
        }
        function currentHourStyle (day, hour) {
            var border = day == vm.today && hour == vm.currentHour ? (vm.isBurning ? '2px solid red' : '2px solid') : ''
            return { 'border': border };
        }
        function clean() {
            for (var i = 0; i < _eventHandlers.length; i++) {
                _eventHandlers[i]();
            }
        }

        init();
        
    }

    function WS_ModalInstanceController($uibModalInstance, params) {

        var vm = this;

        function init() {
            vm.day = params.day;
            vm.hour = params.hour;
            vm.temperature = params.temperature;

            vm.onOk = submit;
            vm.onCancel = cancel;
        }
        function submit() {
            $uibModalInstance.close({ 'day': vm.day, 'hour': vm.hour, 'temperature': vm.temperature });
        };
        function cancel() {
            $uibModalInstance.dismiss('cancel');
        };

        init();
    }



})();