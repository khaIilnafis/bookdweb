module.exports = function ($scope, auth, $state, businessFactory, $rootScope, $uibModal, userFactory, socketService,
                           notificationFactory, $interval) {
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.logOut = auth.logOut;

    $scope.navbarCollapsed = true;
    $rootScope.show = false;
    //animations for the modal
    $scope.animationEnabled = true;

    $scope.myInterval = 10000;
    $scope.noWrapSlides = false;
    $scope.active = 0;
    $scope.activeIndex = 0;
    $scope.slides = [
        {
            image: '/images/masc.jpg',
            id: 0,
            style: 'center center'
        }, {
            image: '/images/fem.jpg',
            id: 1,
            style: 'center bottom'
        }
    ];
    $scope.$watch('active', function (newVal, oldVal) {
        $scope.activeIndex = newVal;
    });
    //TODO change this to check if the current name equals any of the values set here for the states.
    if ($state.current.name == 'partner' || $state.current.name == 'new' || $state.current.name == 'terms' || $state.current.name == 'contact' || $state.current.name == 'reset' || $state.current.name == 'privacy') {
        $scope.bool = false;
    } else {
        $scope.bool = true;
    }
    $interval(function () {
        if ($state.current.name == 'partner') {
            $scope.bool = false;
        } else {
            $scope.bool = !$scope.bool;
        }
    }, 11000);
    //Determines whether to show 'Book'd Partners' or Customers links
    // if ($state.current.name === 'landing') {
    //     $scope.forBusiness = true;
    // } else {
    //     $scope.forBusiness = false;
    // }
  //send a new authToken if the current user needs to be updated (Used for availability)
    socketService.on('clientUpdate', function (data) {
        auth.saveToken(data.token);
        $rootScope.currentUser = auth.currentUser();
    });


    /**
     * Helper function, used to determine which pages we should show the search
     * bar in the navbar. Gets called in the template
     *
     * @param show
     */
    $scope.showSearch = function (show) {
        if (show) {
            $rootScope.show = true;
        }
    };

    $scope.checkStateandLogin = function (type) {
        var state = $state.current.name;
        $scope.open(type, state);
    };
    /**
     * Function used to open the auth modal for registration and login.
     *
     * Called from the template when users click the login/sign up button
     *
     * @param type
     * @param state
     * @param selectedTier
     */
    $scope.open = function (type, state, selectedTier, context) {
        var modalInstance = $uibModal.open({
            animation: $scope.animationEnabled,
            templateUrl: 'partials/modals/auth-modal.html',
            controller: 'AuthCtrl',
            resolve: {
                modalType: function () {
                    return type;
                },
                state: function () {
                    return state;
                },
                tier: function () {
                    return selectedTier;
                },
                context: function () {
                    return context;
                }
            }
        });
    };
    /**
     * Takes the user to the claim business page, first checks to see if they
     * are authenticated. If they aren't we open the login modal, then take them to search
     *
     */
    $scope.goToClaim = function (tier, context) {
        if (!auth.isLoggedIn()) {
            $scope.open('login', 'join', tier, context);
        } else {
            $state.go('join');
        }
    };

  $scope.join = function () {
    if (auth.isLoggedIn()) {
      $state.go('apply_one');
    } else {
      $state.go('join');
    }
  };

    /**
     * Tell the database that the notifications have been viewed.
     */
    $scope.viewAllNotifications = function () {
        notificationFactory.notificationsViewed().then(
            function (data) {

            }, function (err) {
                console.log(err);
            });

        changeAllNotifViewed($rootScope.currentUser.notifications);
    };

    /**
     * Change the single notification to viewed=true, send to database.
     * @param index
     */
    $scope.viewNotification = function (index) {
        var id = $rootScope.currentUser.notifications[index]._id;
        notificationFactory.notificationViewed(id).then(
            function (data) {

            }, function (err) {
                console.log(err);
            });

        $rootScope.currentUser.notifications[index].viewed = true;
    };

    if (auth.isLoggedIn()) {
        notificationFactory.getNotifications().then(
            function (data) {
                $rootScope.currentUser.notifications = data;
            },
            function (err) {
                console.log(err);
            });
    }
    $scope.sent = false;
    $scope.contact = {};
    $scope.contactUs = function (contactObj) {
        businessFactory.contactUs(contactObj);
        $scope.sent = true;
    };

    /**
     * Change notifications.viewed to true when "Mark all as viewed" is clicked.
     * @param notifications
     */
    function changeAllNotifViewed(notifications) {
        for (var i = 0; i < notifications.length; i++) {
            if (notifications[i].viewed === false) {
                notifications[i].viewed = true;
            }
        }
    }
};

