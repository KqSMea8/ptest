var location = {
    href: '',
    ancestorOrigins: {},
    origin: '',
    protocol: '',
    host: '',
    hostname: '',
    port: '',
    pathname: '',
    search: '',
    hash: ''
}

var document = {

}

var history = {

}

var navigator = {

}

var window = {

}

const sandbox = {
    require: function () {
        return function () { };
    },
    Image: function () { },
    window: {
        indexedDB: {},
        location: location,
        document: {
            createElement: function () {

            },
            body: {
                innerHTML: ''
            },
            documentElement: {
                attributes: function () { }
            }
        },
    },
    document: {
        createElement: function () {

        },
        body: {
            innerHTML: ''
        },
        documentElement: {
            attributes: function () { }
        }
    },
    navigator: {
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36',
        geolocation: {}
    },
    location: location
};