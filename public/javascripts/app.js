window.jQuery = require('jquery');
window.$ = global.jQuery;
window._ = require('lodash');
window.io = require('socket.io-client');
window.moment = require('moment');
require('moment-range');
window.humanizeDuration = require('humanize-duration');
// var env = require('env');
try {
    // try to use localStorage
    localStorage.test = 2;
} catch (e) {
    // there was an error so...
    alert('Whoops, looks like you are in Privacy Mode\nSome of our features won\'t work in this mode\nPlease deactivate Privacy Mode and then reload the page.');
}
var angular = require('angular');
require('angular-file-upload');
require('angular-stripe-checkout');
require('angular-timer');
require('angular-ui-notification');
require('angular-ui-router');
require('bootstrap');
require('ngmap');
require('angular-ui-bootstrap');
require('angular-ui-validate');
require('fullcalendar');
require('oauthio-web');
require('angular-socket-io');
require('angular-loading-bar');
require('angularjs-dropdown-multiselect');
require('angular-ui-mask');
angular.module('ngEnvVars.config', []);

// Constants
require('./config.js');
var app = angular.module('cc', [
    require('angular-animate'),
    require('angular-touch'),
    'angularjs-dropdown-multiselect',
    'angularFileUpload',
    'google.places',
    'ngGeolocation',
    'ngMap',
    'timer',
    'stripe.checkout',
    'ui.bootstrap',
    'ui.calendar',
    'ui-notification',
    'ui.router',
    'ui.validate',
    'btford.socket-io',
    'angular-loading-bar',
    'ngEnvVars.config',
    'ui.mask'
]);
require('./services');
require('./controllers');
require('./directives');
require('./filters');

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    '$locationProvider',
    'NotificationProvider',
    function ($stateProvider, $urlRouterProvider, $locationProvider, NotificationProvider) {
        NotificationProvider.setOptions({
            delay: 5000,
            startTop: 200,
            startRight: 20,
            verticalSpacing: 10,
            horizontalSpacing: 10,
            positionX: 'center',
            positionY: 'top'
        });
        $locationProvider.html5Mode(true);
        $stateProvider
            .state('landing', {
                url: '/',
                views: {
                    'nav': {
                        templateUrl: '/partials/landingNav.html',
                        controller: 'NavCtrl'
                    },
                    'content': {
                        templateUrl: '/partials/landing.html',
                        controller: 'LandingCtrl'
                    }
                }
            })
            .state('search', {
                url: '/search',
                controller: 'SearchCtrl',
                views: {
                    'nav': {
                        templateUrl: '/partials/bookdNav.html',
                        controller: 'NavCtrl'
                    },
                    'content': {
                        templateUrl: '/partials/search.html',
                        controller: 'SearchCtrl'
                    }
                }
            })
            .state('business', {
                url: '/business/{businessid}',
                views: {
                    'nav': {
                        templateUrl: '/partials/bookdNav.html',
                        controller: 'NavCtrl'
                    },
                    'content': {
                        templateUrl: '/partials/business.html',
                        controller: 'businessCtrl'
                    }
                },
                resolve: {
                    business: ['$stateParams', 'businessFactory', function ($stateParams, businessFactory) {
                        if (businessFactory.business.place_id !== $stateParams.businessid) {
                            return businessFactory.getBusiness($stateParams.businessid);
                        } else {
                            return businessFactory.business;
                        }

                    }]
                }
            })
            .state('user', {
                url: '/user/:id/profile',
                views: {
                    'nav': {
                        templateUrl: '/partials/bookdNav.html',
                        controller: 'NavCtrl'
                    },
                    'content': {
                        templateUrl: '/partials/profile.html',
                        controller: 'ProfileCtrl'
                    }
                },
                resolve: {
                    isAuthenticated: function ($state, $q, auth) {
                        var redirect = false;
                        if (!auth.isLoggedIn()) {
                            redirect = true;
                            return $q.reject({
                                state: 'error'
                            });
                        }
                        return redirect;
                    }
                }
            })
            .state('account', {
                url: '/user/:id/account',
                views: {
                    'nav': {
                        templateUrl: '/partials/bookdNav.html',
                        controller: 'NavCtrl'
                    },
                    'content': {
                        templateUrl: '/partials/account.html',
                        controller: 'AccountCtrl'
                    }
                },
                resolve: {
                    isAuthenticated: function ($state, $q, auth) {
                        var redirect = false;
                        if (!auth.isLoggedIn()) {
                            redirect = true;
                            return $q.reject({
                                state: 'error'
                            });
                        }
                        return redirect;
                    }
                }
            })
            .state('partner', {
                url: '/partner',
                controller: 'NavCtrl as NavCtrl',
                views: {
                    'nav': {
                        templateUrl: '/partials/landingNav.html',
                        controller: 'NavCtrl'
                    },
                    'content': {
                      templateUrl: '/partials/partner.html'
                    }
                }
            })
            .state('dashboard', {
                url: '/dashboard',
                views: {
                    'nav': {
                        templateUrl: '/partials/bookdNav.html',
                        controller: 'NavCtrl'
                    },
                    'content': {
                        templateUrl: '/partials/dashboard.html',
                        controller: 'dashboardCtrl'
                    }
                },
                resolve: {
                    businesses: ['businessFactory', function (businessFactory) {
                        return businessFactory.getDashboard();
                    }],
                    isAuthenticated: function ($state, $q, auth) {
                        var redirect = false;
                        if (!auth.isLoggedIn()) {
                            redirect = true;
                            return $q.reject({
                                state: 'error'
                            });
                        }
                        return redirect;
                    }
                }
            })
            .state('favorites', {
                url: '/favorites',
                views: {
                    'nav': {
                        templateUrl: '/partials/bookdNav.html',
                        controller: 'NavCtrl'
                    },
                    'content': {
                        templateUrl: '/partials/favorites.html'
                    }
                }
            })
            .state('calendar', {
                url: '/calendar',
                views: {
                    'nav': {
                        templateUrl: '/partials/bookdNav.html',
                        controller: 'NavCtrl'
                    },
                    'content': {
                        templateUrl: '/partials/calendar.html',
                        controller: 'calendarCtrl'
                    }
                },
                resolve: {
                    isAuthenticated: function ($state, $q, auth) {
                        var redirect = false;
                        if (!auth.isLoggedIn()) {
                            redirect = true;
                            return $q.reject({
                                state: 'error'
                            });
                        }
                        return redirect;
                    }
                }
            })
            .state('join', {
                url: '/join',
                views: {
                    'nav': {
                        templateUrl: '/partials/bookdNav.html',
                        controller: 'NavCtrl'
                    },
                    'content': {
                        templateUrl: '/partials/join.html',
                        controller: 'joinCtrl'
                    }
                }
            })
          .state('business_register', {
            url: '/business/register',
            views: {
              'nav': {
                templateUrl: '/partials/bookdNav.html',
                controller: 'NavCtrl'
              },
              'content': {
                templateUrl: '/partials/businessRegister.html',
                controller: 'businessRegisterCtrl'
              }
            }
          })
            .state('terms', {
                url: '/terms',
                views: {
                    'nav': {
                        templateUrl: '/partials/landingNav.html',
                        controller: 'NavCtrl'
                    },
                    'content': {
                        templateUrl: 'partials/terms.html'
                    }
                },
                onEnter: function ($rootScope) {
                    $rootScope.gotoTop('top-legal');
                }
            })
            .state('privacy', {
                url: '/privacy',
                views: {
                    'nav': {
                        templateUrl: '/partials/landingNav.html',
                        controller: 'NavCtrl'
                    },
                    'content': {
                        templateUrl: 'partials/privacy.html'
                    }
                },
                onEnter: function ($rootScope) {
                    $rootScope.gotoTop('top-legal');
                }
            })
            .state('about', {
                url: '/about',
                templateUrl: 'partials/about.html'
            })
            .state('contact', {
                url: '/contactUs',
                views: {
                    'nav': {
                        templateUrl: '/partials/landingNav.html',
                        controller: 'NavCtrl'
                    },
                    'content': {
                        templateUrl: 'partials/contact.html',
                        controller: 'NavCtrl'
                    }
                }
            })
            .state('reset', {
                url: '/reset',
                views: {
                    'nav': {
                        templateUrl: '/partials/landingNav.html',
                        controller: 'NavCtrl'
                    },
                    'content': {
                        templateUrl: 'partials/reset.html',
                        controller: 'resetCtrl'
                    }
                }
            })
            .state('new', {
                url: '/reset/{token}',
                views: {
                    'nav': {
                        templateUrl: '/partials/landingNav.html',
                        controller: 'NavCtrl'
                    },
                    'content': {
                        templateUrl: 'partials/newPassword.html',
                        controller: 'newPasswordCtrl'
                    }
                }
            });
        $urlRouterProvider.otherwise('/');
    }]).run(function ($rootScope, auth, $templateCache, remoteHost, $geolocation, $http, $state, location, businessFactory,
                      $controller, $uibModal, notificationFactory, socketService, $anchorScroll, $location, ENV_VARS) {
    OAuth.initialize(ENV_VARS.oAuthKey);
    $rootScope.currentUser = auth.currentUser();
    $rootScope.facebookApi = ENV_VARS.facebookApi;
    $rootScope.cloudinaryBaseUrl = ENV_VARS.CLOUDINARY_BASE;
    $rootScope.cloudinaryDefaultPic = ENV_VARS.CLOUDINARY_Default;

    if (auth.isLoggedIn()) {
        notificationFactory.getNotifications().then(
            function (data) {
                $rootScope.currentUser.notifications = data;
            },
            function (err) {
                console.log(err);
            }
        );
        }
        /**
         *
         * Send the ID of the currently authorized user
         *
         */
        socketService.on('authorizationReq', function (data) {
            if ($rootScope.currentUser) {
                $rootScope.currentUser.socketId = data;
                socketService.emit('authorizationRes', $rootScope.currentUser._id);
            }
        });

    socketService.on('newNotif', function (data) {
        $rootScope.currentUser.notifications.unshift(data);
    });
    socketService.on('error', function (data) {
        console.log(data);
    });
    socketService.on('update-user', function (data) {
        auth.saveUser(null, data);
        $rootScope.currentUser = auth.currentUser();
        notificationFactory.getNotifications().then(
            function (data) {
                $rootScope.currentUser.notifications = data;
            },
            function (err) {
                console.log(err);
            });
    });
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        if (typeof(current) !== 'undefined') {
            $templateCache.remove(current.templateUrl);
        }
    });
    $rootScope.$on('$stateChangeError', function (event, toState, toStateParams, fromState, fromStateParams, error) {

        if (error) {
            $state.go('landing');
            var navViewModel = $rootScope.$new();
            $controller('NavCtrl', {$scope: navViewModel});
            navViewModel.open('md', 'landing');
        }
    });
    $rootScope.$on('$viewContentLoaded', function (event, toState, toStateParams, fromState, fromStateParams, error) {
        if ($location.$$path == '/privacy' || $location.$$path == '/terms') {
            $rootScope.gotoTop('top-legal');
        } else if (!error) {
            $rootScope.gotoTop();
        }
    });
    //TODO Move this to a service!
    $rootScope.query = {
        location: null,
        term: null
    };
    if (!location.currPosition) {
        $geolocation.getCurrentPosition({
            timeout: 60000,
            maximumAge: 250,
            enableHighAccuracy: true
        }).then(function (position) {
            $rootScope.myPosition = position;
            getLocationInfo(position);
        }).then(function (err) {
        })
    }
        /**
         *
         * Watch for when the users location changes, make a call to the google maps api to
         * get information about the users current location.
         *
         * Auto populate that information in the query location object, to be displayed in the navbar.
         *
         */
        var getLocationInfo = function (position) {
            $rootScope.loadingLocation = true;
            $http.get('https://maps.googleapis.com/maps/api/geocode/json?&key=AIzaSyAK1BOzJxHB8pOFmPFufYdcVdAuLr_6z2U&latlng='
                + position.coords.latitude + ','
                + position.coords.longitude)
                .then(function (data) {
                    $rootScope.loadingLocation = false;
                    if (data) {
                        location.setPosition(data.data.results);
                        $rootScope.currLocation = location.currPosition;
                        $rootScope.query.location = $rootScope.currLocation.city;

                    }
                }, function (error) {
                    //TODO Google wants us to access this API from a server, not a client.
                    console.log('If seeing this, probably CORS error with googleapis geocode');
                    console.log(error);
                });
        };

    /**
     *
     * Concatenates the query term and query location entered in the Navbar
     * to create the query string being sent to the Places API on the backend.
     *
     * If the typeOf the queryLocation is a string, (User typed it in) then concatenate
     * query.location with query.term
     *
     * If the typeOf the queryLocation is !string (an Object) then concatenate query.location.vicinity
     * with query.term
     *
     * @param query - Object with term and location properties. Location will either be a string or an object.
     */
    $rootScope.searched = false;
    $rootScope.search = function (query) {
        $rootScope.fetchingQuery = true;
        var formattedQuery;
        if (typeof query.location === 'string') {
            formattedQuery = query.term + ' ' + query.location;
        } else {
            formattedQuery = query.term + ' ' + query.location.vicinity;
        }

        businessFactory.search(formattedQuery)
            .then(function (data) {
                $rootScope.searched = true;
                $rootScope.fetchingQuery = false;
                if (!$state.is('search')) {
                    $state.go('search');
                }
            });
    };
    $rootScope.gotoTop = function (anchor) {
        // set the location.hash to the id of
        // the element you wish to scroll to.
        if (!anchor) {
            $location.hash('top');
        } else {
            $location.hash(anchor);
        }


        // call $anchorScroll()
        $anchorScroll();
    };
});
