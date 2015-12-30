/**
 * Created by Jonfor on 11/28/15.
 */
module.exports = function ($scope, $uibModalInstance, businessFactory, socketService, auth, $state, $rootScope,
                           userFactory, personal, tier, service, notificationFactory, facebookApi) {

    $scope.facebookApi = facebookApi;

    $scope.service = service;

    function getGooglePlusPhoto(employeeArray) {
        for (var employeeIndex = 0; employeeIndex < employeeArray.length; employeeIndex++) {
            if (employeeArray[employeeIndex].provider === 'google_plus') {
                var photoIndex = employeeIndex;
                userFactory.getGooglePhoto(employeeArray[employeeIndex].providerId)
                    .then(function (response) {
                        employeeArray[photoIndex].photo = response.image.url.replace('sz=50', 'sz=200');

                    });
            }
        }
    }

    getGooglePlusPhoto($scope.service.employees);


    $scope.stripePrice = $scope.service.price * 100;
    $scope.minDate = $scope.minDate ? null : moment();
    $scope.progressBar = 100;
    $scope.showCount = false;
    $scope.countdown = 600;
    $scope.tier = tier;
    var timeStarted = false;
    // $scope.currentUser = auth.currentUser();
    $scope.$watch('selectedDate', function (newVal, oldVal) {
        if (newVal) {
            $scope.dayMessage = false;
            getAvailableTimes(newVal, $scope.employee._id);
        }
    });

    $scope.timerFinished = function () {
        $scope.activeTime.toggled = !$scope.activeTime.toggled;
        $scope.showCount = false;
        $scope.$apply();
        socketService.emit('timeDestroyed', $scope.activeTime);
    };
    /**
     *
     * @param employee
     */
    $scope.selectEmployee = function (employee) {
        $scope.availableTimes = [];
        $scope.employee = employee;
        var day = new Date();
        getAvailableTimes(day, $scope.employee._id);
    };
    /**
     * Disable days on the calendar
     * @param date
     * @param mode
     * @returns {boolean}
     */
    //$scope.disabled = function(date, mode) {
    //    $scope.employee.availability
    //    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    //};
    /**
     *
     * @param date
     * @param employeeId
     */
    function getAvailableTimes(date, employeeId) {
        var newDate = moment(date).format('MM/DD/YYYY');
        $scope.monthYear = moment(newDate).format('MM/YYYY');
        var employeeApptObj = {};
        if (personal) {
            employeeApptObj = {
                startDate: newDate,
                id: employeeId,
                personal: true
            };
        } else {
            employeeApptObj = {
                startDate: newDate,
                id: employeeId,
                personal: false
            };
        }

        userFactory.getAppts(employeeApptObj)
            .then(function (data) {
                calculateAppointments(data);
                socketService.emit('joinApptRoom', employeeApptObj);
            });
    }

    /**
     *
     * @param data
     */
    function calculateAppointments(data) {
        var weekDay = moment($scope.selectedDate).format('dddd');
        $scope.availableTimes = [];
        for (var dayOfWeek = 0; dayOfWeek < $scope.employee.availability.length; dayOfWeek++) {
            if (weekDay === $scope.employee.availability[dayOfWeek].day) {
                var formatStart = moment($scope.employee.availability[dayOfWeek].start).format('hh:mm a');
                var formatEnd = moment($scope.employee.availability[dayOfWeek].end).format('hh:mm a');
                var startTime = moment(formatStart, 'hh:mm a');
                var endTime = moment(formatEnd, 'hh:mm a');
            }
            if (weekDay === $scope.employee.availability[dayOfWeek].day && $scope.employee.availability[dayOfWeek].available === false) {
                $scope.dayMessage = true;
                return;
            }

        }
        var duration = $scope.service.duration;
        for (var m = startTime; startTime.isBefore(endTime); m.add(duration, 'minutes')) {
            var timeObj = {
                time: m.format('hh:mm a'),
                end: moment(startTime).add(duration, 'minutes').format('hh:mm a'),
                available: true,
                toggled: false,
                status: false,
                user: $scope.currentUser.user._id
            };
            $scope.availableTimes.push(timeObj);
        }
        data.forEach(function (array) {
            for (var availableTimesIndex = 0; availableTimesIndex < $scope.availableTimes.length; availableTimesIndex++) {
                for (var appointmentsIndex = 0; appointmentsIndex < array.length; appointmentsIndex++) {

                    var availableTime = moment($scope.availableTimes[availableTimesIndex].time, 'hh:mm a');
                    var startTime = moment(array[appointmentsIndex].start.time, 'hh:mm a');

                    var decreasedTime = moment($scope.availableTimes[availableTimesIndex].time, 'hh:mm a');

                    var endTime = moment(array[appointmentsIndex].end.time, 'hh:mm a');
                    var subtractedTime = decreasedTime.subtract(duration / 2, 'minutes');


                    if (availableTime.isSame(startTime)) {
                        $scope.availableTimes[availableTimesIndex].available = false;
                    }
                    if (availableTime.isBetween(startTime, endTime, 'minute')) {
                        $scope.availableTimes[availableTimesIndex].available = false;
                    }

                    if (startTime.isSame(subtractedTime)) {
                        $scope.availableTimes[availableTimesIndex - 1].available = false;
                    }
                }
            }
        });
        for (var availableTimesIndex = 0; availableTimesIndex < $scope.availableTimes.length; availableTimesIndex++) {
            for (var availableDaysIndex = 0; availableDaysIndex < $scope.employee.availability.length; availableDaysIndex++) {
                if (weekDay == $scope.employee.availability[availableDaysIndex].day) {
                    for (var gapsInDayIndex = 0; gapsInDayIndex < $scope.employee.availability[availableDaysIndex].gaps.length; gapsInDayIndex++) {

                        var formattedStart = moment($scope.employee.availability[availableDaysIndex].gaps[gapsInDayIndex].start).format('hh:mm a');
                        var formattedEnd = moment($scope.employee.availability[availableDaysIndex].gaps[gapsInDayIndex].end).format('hh:mm a');

                        var availableTime = moment($scope.availableTimes[availableTimesIndex].time, 'hh:mm a');
                        var gapStartTime = moment(formattedStart, 'hh:mm a');

                        var decreasedTime = moment(formattedEnd, 'hh:mm a');

                        var gapEndTime = moment(formattedEnd, 'hh:mm a');
                        var subtractedTime = decreasedTime.subtract(duration / 2, 'minutes');

                        if (availableTime.isSame(gapStartTime)) {
                            $scope.availableTimes[availableTimesIndex].available = false;
                        }
                        if (availableTime.isBetween(gapStartTime, gapEndTime, 'minute')) {
                            $scope.availableTimes[availableTimesIndex].available = false;
                        }

                        if (gapStartTime.isSame(subtractedTime)) {
                            $scope.availableTimes[availableTimesIndex - 1].available = false;
                        }
                    }
                }
            }
        }
    }

    socketService.on('update', function () {
        getAvailableTimes($scope.selectedDate, $scope.employee._id);
    });

    socketService.on('oldHold', function (data) {
        for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
            calculateHold(data[dataIndex].data);
        }
    });
    socketService.on('newHold', function (data) {
        if (data.user !== $scope.currentUser.user._id) {
            calculateHold(data);
        }
    });
    socketService.on('destroyOld', function (data) {
        destroyOld(data);
    });
    var calculateHold = function (timeObj) {
        var indexToReplace = parseInt(_.findKey($scope.availableTimes, {'time': timeObj.time}));
        var startTime = moment(timeObj.time, 'hh:mm a');
        var endTime = moment(timeObj.end, 'hh:mm a');
        var calculatedDuration = $scope.service.duration;
        for (var m = startTime; startTime.isBefore(endTime); m.add(calculatedDuration, 'minutes')) {
            $scope.availableTimes[indexToReplace].status = true;
            indexToReplace += 1;
        }
    };
    var destroyOld = function (timeObj) {
        var indexToReplace = parseInt(_.findKey($scope.availableTimes, {'time': timeObj.time}));
        var startTime = moment(timeObj.time, 'hh:mm a');
        var endTime = moment(timeObj.end, 'hh:mm a');
        var destroyDuration = $scope.service.duration;

        for (var m = startTime; startTime.isBefore(endTime); m.add(destroyDuration, 'minutes')) {
            $scope.availableTimes[indexToReplace].status = false;
            indexToReplace += 1;
        }
    };

    $scope.selectedIndex = null;
    $scope.createAppointmentObj = function (time, index) {
        $scope.activeTime = time;
        $scope.showCount = true;
        socketService.emit('timeTaken', time);
        if (!timeStarted) {
            $scope.$broadcast('timer-start');
            $scope.timerRunning = true;
            timeStarted = true;
        } else if (timeStarted) {
            $scope.$broadcast('timer-reset');
            $scope.$broadcast('timer-start');
        }

        /**
         *
         * If there is a previously selected time and the previous selected time isn't equal to the current one
         * we toggle the previously selected time to be false; Toggle the current time to be true.
         * Then we set the current index as the selected index
         */
        if ($scope.selectedIndex !== null) {
            $scope.availableTimes[$scope.selectedIndex].toggled = false;
            socketService.emit('timeDestroyed', $scope.availableTimes[$scope.selectedIndex]);
            time.toggled = !time.toggled;
            $scope.selectedIndex = index;
        }
        /**
         *
         * If there is no previously selected time we simply toggle the current time, then
         * set the current index as the selected index.
         */
        if ($scope.selectedIndex == null) {
            time.toggled = !time.toggled;
            $scope.selectedIndex = index;
        }
        $scope.selectedIndex = index;
        var apptDay = moment($scope.selectedDate).format('dddd');
        var apptDate = moment($scope.selectedDate).format('MM/DD/YYYY');
        var apptTime = moment(time.time, 'hh:mm a').format('hh:mm a');
        var endTime = moment(time.time, 'hh:mm a').add($scope.service.duration, 'minutes').format('hh:mm a');

        var customerId;
        if (personal) {
            customerId = $rootScope.currentUser.user._id;
        } else {
            customerId = '';
        }

        $scope.appointment = {
            businessId: $scope.service.businessId,
            employee: $scope.employee._id,
            customer: customerId,
            start: {
                date: apptDate,
                monthYear: $scope.monthYear,
                time: apptTime,
                day: apptDay,
                full: moment(apptDate + ' ' + apptTime, 'MM/DD/YYYY hh:mm a').format()
            },
            end: {
                date: apptDate,
                time: endTime,
                day: apptDay,
                full: moment(apptDate + ' ' + endTime, 'MM/DD/YYYY hh:mm a').format()

            },
            service: $scope.service._id,
            title: $scope.service.name,
            timestamp: moment()
        };
    };

    //TODO Handle the case where the add appointment callback returns 400 because of overlapping appointments
    this.checkOut = function (token) {
        $scope.appointment.stripeToken = token;
        $scope.appointment.price = $scope.stripePrice;
        businessFactory.addAppointment($scope.appointment)
            .then(function (appointment) {
                socketService.emit('timeDestroyed', $scope.activeTime);
                $scope.appointment.personal = personal;
                socketService.emit('apptBooked', appointment);
                if (personal) {
                    userFactory.getUserAppts().then(
                        function (data) {
                            $rootScope.currentUser.user.appointments = data;
                        },
                        function (errorMessage) {
                            console.log(errorMessage);
                        }
                    );
                }
                $uibModalInstance.close(appointment);
            }, function (err) {
                //TODO Really handle this
                console.log(err);
            });
    };
    $scope.book = function () {
        businessFactory.addAppointment($scope.appointment)
            .then(function (appointment) {
                socketService.emit('timeDestroyed', $scope.activeTime);
                $scope.appointment.personal = personal;
                socketService.emit('apptBooked', appointment);
                $uibModalInstance.close(appointment);
            });

    };

    $scope.cancel = function () {
        if ($scope.activeTime) {
            socketService.emit('timeDestroyed', $scope.activeTime);
        }
        $uibModalInstance.dismiss('cancel');
    };

    $scope.newNotification = function (appointment, personToNotify) {
        //TODO Move this string to somewhere we can access it globally!
        notificationFactory.addNotification(personToNotify,
                'You have a ' + $scope.service.name + ' on ' + appointment.start.date + ' at ' + appointment.start.time
                + '.', 'alert', false)
            .then(function () {

            }, function (err) {
                console.log(err);
            });
    };
};
