(function () {
    "use strict";

    angular.module('climateControl')
        .factory('HttpInterceptor', ['CacheFactory', HttpInterceptor]);

    function HttpInterceptor(CacheFactory) {

        return {
            'response': function (response) {
                // called if HTTP CODE = 2xx 
                if (response.config.method === 'PUT' || response.config.method === 'POST' || response.config.method === 'DELETE') {

                    var url = response.config.url;
                    url = url.slice(0, url.lastIndexOf('/'));
                    var params = '?';
                    for (var param in response.config.params) {
                        params = [params, param, '=', response.config.params[param], '&'].join('');
                    }
                    params = params.slice(0, -1);

                    while (url.lastIndexOf('/') != -1) {
                        CacheFactory.get('defaultCache').remove([url, params].join('/'));
                        url = url.slice(0, url.lastIndexOf('/'));
                    }

                    url = response.config.url;
                    var keys = CacheFactory.get('defaultCache').keys();
                    for (var i = 0; i < keys.length; i++) {
                        if (keys[i].indexOf(url) > -1)
                            CacheFactory.get('defaultCache').remove(keys[i]);
                    }

                }

                return response;
            }
        }
    }

})();