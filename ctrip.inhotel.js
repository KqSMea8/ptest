'use strict';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const fs = require('fs');
const vm = require('vm');
const Crawler = require('crawler');
const moment = require('moment');
const logger = require('bda-util/winston-rotate-local-timezone').getLogger('../../log/ctrip.inhotel.log');
const RETRIES = 5;

const mode = process.argv[2], searchDate = process.argv[3];
if (['list','detail'].indexOf(mode) === -1 || !/^\d{4}-\d{2}-\d{2}$/.test(searchDate)) {
    logger.warn('Usage: node ctrip.inhotel.js <list|detail> <YYYY-MM-DD>');
    return process.exit(1);
}
let checkInDate = searchDate;
let checkOutDate = moment(searchDate, 'YYYY-MM-DD').add(1, 'd').format('YYYY-MM-DD');

const ProxyManager = {
    index: 0,
    proxies: require('../../appdata/proxies_dd.json'),
    setProxy: function(options) {
        /*let proxy = this.proxies[this.index];
        this.index = (++this.index) % this.proxies.length;
        options.proxy = proxy;
        options.limiter = proxy;*/
        options.proxy = 'http://s5.proxy.mayidaili.com:8123';
        options.limiter = Math.floor(Math.random() * 20);
    }
}

class Hotel {
    constructor() {
        this.resultDir = '../../result/ota/';
        this.listResultFile = `ctrip.inhotel.list.${moment().format('YYYY-MM-DD')}.csv`;
        this.detailResultFile = `ctrip.inhotel.detail.${moment().format('YYYY-MM-DD')}.csv`;
        this.crawler = new Crawler({
            jQuery: false,
            rateLimit: 1800,
            userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36'
        });
        this.crawler.on('schedule', (options) => {
            ProxyManager.setProxy(options);
        });
        this.crawler.on('request', (options) => {
            if (options.uri === 'http://hotels.ctrip.com/international/tool/AjaxHotelList.aspx') {
                options.form.eleven = this.cityElevenMap[options.city.name];
            }
        });
        this.crawler.on('drain', () => {
            if (this.intervalObj) {
                clearInterval(this.intervalObj);
            }
            logger.info('Job done');
        });
        this.listHeaders = ['city','hotelId','hotelName','hotelScore','hotelStar','address'];
        this.detailHeaders = ['city','hotelId','hotelName','hotelScore','hotelStar','address','roomId','roomName','area','offerId','maxPerson','bedType','breakfast','cancel','exclusivePrice','extraCharge','inclusivePrice','roomsLeft','isBooking'];
        this.crawlerForEleven = new Crawler({
            jQuery: false,
            rateLimit: 2500,
            userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36'
        });
        this.crawlerForEleven.on('schedule', (options) => {
            ProxyManager.setProxy(options);
        });
        this.cityElevenMap = {};
    }
    run() {
        let self = this;
        if (mode === 'list') {
            self.getEleven();
            self.intervalObj = setInterval(self.getEleven.bind(self), 10*1000);
            setTimeout(function() {
                self.cities.forEach(city => {
                    self.getList(city, 1);
                });
            }, 5000);
        } else {
            self.hotels.forEach(hotel => {
                self.getDetail(hotel);
            });
        }
    }
    getList(city, page, retry) {
        if (retry === undefined) retry = RETRIES;
        if (--retry < 0) {
            return logger.error(`<${city.name} page ${page}> out of retries`);
        }
        let self = this;
        self.crawler.queue({
            uri: 'http://hotels.ctrip.com/international/tool/AjaxHotelList.aspx',
            method: 'POST',
            city: city,
            headers: {
                Referer: `http://hotels.ctrip.com/international/${city.code}`
            },
            form: {
                checkIn: checkInDate,
                checkOut: checkOutDate,
                destinationType: 1,
                IsSuperiorCity: '',
                cityId: city.cityId,
                cityPY: city.cityPinyin,
                rooms: 2,
                childNum: 2,
                roomQuantity: 1,
                pageIndex: page,
                keyword: '',
                keywordType: '',
                LandmarkId: '',
                districtId: '',
                zone: '',
                metrostation: '',
                metroline: '',
                price: '',
                star: '',
                equip: '',
                brand: '',
                group: '',
                fea: '',
                htype: '',
                coupon: '',
                a: '',
                orderby: '',
                ordertype: 1,
                isAirport: 0,
                hotelID: '',
                priceSwitch: '',
                lat: '',
                lon: '',
                clearHotelName: '',
                promotionid: '',
            },
            callback: (err, res, done) => {
                const logPrefix = `<${city.name} page ${page}>`;
                if (err) {
                    logger.error(`${logPrefix} failed, ${err}`);
                    self.getList(city, page, retry);
                    return done();
                }

                let json = null;
                try {
                    json = JSON.parse(res.body);
                } catch(e) {
                    logger.error(`${logPrefix} json parse failed, ${e}`);
                    console.log(res.body);
                    self.getList(city, page, retry);
                    return done();
                }

                if (page === 1) {
                    if (isNaN(json.totalPage)) {
                        logger.error(`${logPrefix} invalid total page, ${json.totalPage}`);
                        self.getList(city, page, retry);
                        return done();
                    }
                    for (let p = 2; p <= json.totalPage; p++) {
                        self.getList(city, p);
                    }
                    logger.info(`${logPrefix} total page: ${json.totalPage}, total hotels: ${json.totalHotelNum}`);
                }

                let hotels = [];
                json.HotelPositionJSON = json.HotelPositionJSON || [];
                json.HotelPositionJSON.forEach(h => {
                    hotels.push({
                        hotelId: h.id,
                        hotelName: h.name,
                        hotelScore: h.score,
                        hotelStar: h.star,
                        address: h.address
                    });
                });
                
                if (hotels.length === 0) {
                    logger.warn(`${logPrefix} got 0 hotels, retry`);
                    self.getList(city, page, retry);
                } else {
                    let records = [];
                    hotels.forEach(hotel => {
                        records.push([
                                city.name,
                                hotel.hotelId,
                                hotel.hotelName,
                                hotel.hotelScore,
                                hotel.hotelStar,
                                hotel.address
                            ].map(v => (v === undefined ? 'n/a' : v+'').replace(/[\r\n\t,]/g, '')).join());
                    });
                    fs.appendFileSync(self.resultDir+self.listResultFile, records.join('\n')+'\n');
                    logger.info(`${logPrefix} got ${hotels.length} hotels`);
                }
                done();
            }
        });
    }
    getDetail(hotel) {
        let self = this;
        self.crawler.queue({
            uri: 'http://hotels.ctrip.com/international/Tool/AjaxHotelRoomInfoDetailPart.aspx',
            headers: {
                Referer: `http://hotels.ctrip.com/international/${hotel.hotelId}.html`,
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            qs: {
                City: hotel.cityId,
                Hotel: hotel.hotelId,
                EDM: 'F',
                Pkg: 'F',
                ep: '',
                StartDate: checkInDate,
                DepDate: checkOutDate,
                RoomNum: '2',
                RoomQuantity: '1',
                UserUnicode: '',
                requestTravelMoney: 'F',
                promotionid: '',
                Coupons: '',
                CCoupons: '',
                PageLoad: 'true',
                childNum: '2',
                FixSubHotel: 'F',
                allianceid: '',
                sid: '',
                timestamp: '0',
                guid: '',
                pid: '',
                sd: ''
            },
            callback: (err, res, done) => {
                const logPrefix = `<${hotel.city} hotelId ${hotel.hotelId}>`;
                if (err) {
                    logger.error(`${logPrefix} failed, ${err}`);
                    return done();
                }

                let json = null;
                try {
                    json = JSON.parse(res.body);
                } catch(e) {
                    logger.error(`${logPrefix} json parse failed, ${e}`);
                    return done();
                }

                self.ensureHasKey(json, 'HotelRoomData');
                json.HotelRoomData.roomList = json.HotelRoomData.roomList || [];
                json.HotelRoomData.subRoomList = json.HotelRoomData.subRoomList || [];

                let records = [];
                let roomMap = json.HotelRoomData.roomList.reduce((map, r) => {
                    self.ensureHasKey(r, 'roomInfoDetails.roomDetails');
                    map[r.id] = {
                        roomId: r.id,
                        roomName: r.name,
                        area: 'roomArea' in r.roomInfoDetails.roomDetails ? r.roomInfoDetails.roomDetails.roomArea : 'n/a'
                    };
                    return map;
                }, {});
                json.HotelRoomData.subRoomList.forEach(r => {
                    if (!(r.baseRoomId in roomMap)) return;
                    self.ensureHasKey(r, 'policyInfo');
                    self.ensureHasKey(r, 'price');
                    records.push([
                            hotel.city,
                            hotel.hotelId,
                            hotel.hotelName,
                            hotel.hotelScore,
                            hotel.hotelStar,
                            hotel.address,
                            roomMap[r.baseRoomId].roomId,
                            roomMap[r.baseRoomId].roomName,
                            roomMap[r.baseRoomId].area,
                            r.id,
                            r.maxPerson,
                            r.bed,
                            r.breakfast,
                            r.policyInfo.title,
                            r.price.AvgPriceBeforeTaxAfterDiscount,
                            r.price.AvgFeeAmount,
                            r.price.AvgPriceWithTaxAfterDiscount,
                            r.last === 0 ? '充足' : r.last,
                            r.roomVendorID === 32 ? 'Y' : 'N'
                        ].map(v => (v === undefined ? 'n/a' : v+'').replace(/[\r\n\t,]/g, '')).join());
                });
                if (records.length) {
                    fs.appendFileSync(self.resultDir+self.detailResultFile, records.join('\n')+'\n');
                }
                logger.info(`${logPrefix} got ${records.length} rooms`);
                done();
            }
        });
    }
    getEleven() {
        this.cities.forEach(city => {
            this.getElevenForCity(city);
        });
    }
    getElevenForCity(city) {
        let self = this;
        self.crawlerForEleven.queue({
            uri: `http://hotels.ctrip.com/international/Tool/cas-ocanball.aspx?callback=NwvUQOHXclJmKQdKw&_=${Date.now()}`,
            headers: {
                Referer: `http://hotels.ctrip.com/international/${city.code}`
            },
            callback: (err, res, done) => {
                const logPrefix = `<${city.name} getEleven>`;
                if (err) {
                    logger.error(`${logPrefix} failed, ${err}`);
                    self.getElevenForCity(city);
                    return done();
                }

                let match = res.body.trim().match(/^eval\((function\(.*?\){.*?})(\(.*?\)\.join\(''\))\)$/);
                if (!match) {
                    logger.error(`${logPrefix} sandbox step1 no match, ${res.body}`);
                    self.getElevenForCity(city);
                    return done();
                }

                let script = null;
                try {
                    script = new vm.Script(`(${match[1]})${match[2]}`).runInNewContext({}).trim();
                } catch(e) {
                    logger.error(`${logPrefix} sandbox step1 failed, ${e}`);
                    self.getElevenForCity(city);
                    return done();
                }
                
                match = script.match(/^;!(function\(\)\{.*\})\(\);$/);
                if (!match) {
                    logger.error(`${logPrefix} sandbox step2 no match, ${script}`);
                    self.getElevenForCity(city);
                    return done();
                }

                script = `(${match[1]})();`;
                try {
                    const sandbox = {
                        encodeURIComponent: encodeURIComponent,
                        decodeURIComponent: decodeURIComponent,
                        console: console,
                        require: function() {
                            return function() {};
                        },
                        Image: function() {},
                        window: {
                            indexedDB: {},
                            location: {
                                href: `http://hotels.ctrip.com/international/${city.code}`,
                                ancestorOrigins: {},
                                origin: 'http: //hotels.ctrip.com',
                                protocol: 'http: ',
                                host: 'hotels.ctrip.com',
                                hostname: 'hotels.ctrip.com',
                                port: '',
                                pathname: `/international/${city.code}`,
                                search: '',
                                hash: ''
                            },
                            document: {
                                createElement: function() {
                                    function Element() {
                                        this.innerHTML = ''
                                    }
                                    Element.prototype.innerHTML = function(str) {this.innerHTML = str};
                                    return new Element();
                                },
                                all: function() {
                                    return []
                                },
                                body: {
                                    innerHTML: '老板给小三买了包， 却没有给你钱买房'
                                },
                                documentElement: {
                                    attributes: function() {}
                                }
                            },
                        },
                        document: {
                            createElement: function() {
                                function Element() {
                                    this.innerHTML = ''
                                }
                                Element.prototype.innerHTML = function(str) {this.innerHTML = str};
                                return new Element();
                            },
                            all: function() {
                                return []
                            },
                            body: {
                                innerHTML: '老板给小三买了包， 却没有给你钱买房'
                            },
                            documentElement: {
                                attributes: function() {}
                            }
                        },
                        navigator: {
                            userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36',
                            geolocation: {}
                        },
                        location: {
                            href: `http://hotels.ctrip.com/international/${city.code}`,
                            ancestorOrigins: {},
                            origin: 'http: //hotels.ctrip.com',
                            protocol: 'http: ',
                            host: 'hotels.ctrip.com',
                            hostname: 'hotels.ctrip.com',
                            port: '',
                            pathname: `/international/${city.code}`,
                            search: '',
                            hash: ''
                        }
                    };

                    let ctx = vm.createContext(sandbox);
                    sandbox.eval = function(script) {
                        return new vm.Script(script).runInContext(ctx);
                    }
                    sandbox.eval.toString = function() {return 'function eval() { [native code] }'};
                    sandbox.NwvUQOHXclJmKQdKw = function(eleven) {sandbox.eleven = eleven();};
                    
                    script = new vm.Script(script);
                    script.runInContext(ctx);
                    if (typeof sandbox.eleven !== 'string' || sandbox.eleven.length <= 0) {
                        logger.error(`${logPrefix} sandbox step2 failed, invalid eleven ${sandbox.eleven}`);
                        self.getElevenForCity(city);
                        return done();
                    }
                    self.cityElevenMap[city.name] = sandbox.eleven;
                    logger.info(`${logPrefix} eleven = ${sandbox.eleven}`);
                } catch(e) {
                    logger.error(`${logPrefix} sandbox step2 failed, ${e}`);
                    self.getElevenForCity(city);
                    return done();
                }
                done();
            }
        });
    }
    ensureHasKey(obj, keys) {
        keys = keys.split('.');
        while (keys.length > 0) {
            let key = keys.shift();
            obj[key] = obj[key] || {};
            obj = obj[key];
        }
    }
    initCities() {
        let cities = [
            ['奥克兰','auckland678'],
            ['墨尔本','melbourne358'],
            ['悉尼','sydney501'],
            ['巴厘岛','bali723'],
            ['芭提雅','pattaya622'],
            ['胡志明','hochi301'],
            ['吉隆坡','kualalumpur315'],
            ['金边','phnompenh303'],
            ['曼谷','bangkok359'],
            ['普吉岛','phuket725'],
            ['清迈','chiangmai623'],
            ['暹粒','siemreap1369'],
            ['新加坡','singapore73'],
            ['长滩岛','boracay1391'],
            ['济州岛','jeju737'],
            ['首尔','seoul274'],
            ['釜山','busan253'],
            ['洛杉矶','losangeles347'],
            ['马尔代夫','maldives3880'],
            ['纽约','newyork633'],
            ['塞班岛','saipan4081'],
            ['西雅图','seattle511'],
            ['巴黎','paris192'],
            ['巴塞罗那','barcelona40795'],
            ['柏林','berlin193'],
            ['伦敦','london338'],
            ['罗马','rome343'],
            ['威尼斯','venice688'],
            ['维也纳','vienna651'],
            ['雅典','athens710'],
            ['大阪','osaka219'],
            ['东京','tokyo228'],
            ['札幌','sapporo641'],
            ['京都','kyoto734'],
            ['冲绳','okinawa207'],
            ['奈良','nara1175'],
            ['迪拜','dubai220']
        ];
        return cities.map(c => {
            return {
                name: c[0],
                code: c[1],
                cityId: c[1].match(/\d+/)[0],
                cityPinyin: c[1].match(/[A-z]+/)[0]
            }
        });
    }
    init() {
        if (!fs.existsSync('../../log/')) {
            fs.mkdirSync('../../log/');
        }
        if (!fs.existsSync(this.resultDir)) {
            fs.mkdirSync(this.resultDir);
        }
        if (!fs.existsSync(this.resultDir+this.listResultFile))
            fs.writeFileSync(this.resultDir+this.listResultFile, `\ufeff${this.listHeaders.join()}\n`);
        if (!fs.existsSync(this.resultDir+this.detailResultFile))
            fs.writeFileSync(this.resultDir+this.detailResultFile, `\ufeff${this.detailHeaders.join()}\n`);
        if (mode === 'list') {
            this.cities = this.initCities();
            logger.info('mode: list, Total # of cities: %s', this.cities.length);
        } else {
            let map = {};
            let cities = this.initCities().reduce((cityMap, cityObj) => {
                cityMap[cityObj.name] = cityObj.cityId;
                return cityMap;
            }, {});
            this.hotels = fs.readFileSync(this.resultDir+this.listResultFile).toString().trim().split('\n').reduce((hotels, line, index) => {
                if (index === 0) return hotels;
                let vals = line.trim().split(',');
                if (vals.length !== 6) return hotels;
                if (vals[1] in map) return hotels;
                map[vals[1]] = null;
                let hotelName = vals[2].trim();
                if (hotelName.match(/^.*?\(([^\u4E00-\u9FA5]*?)\)$/)) {
                    hotelName = hotelName.match(/^.*?\(([^\u4E00-\u9FA5]*?)\)$/)[1];
                }
                if (/[\u4E00-\u9FA5]/.test(hotelName)) {
                    logger.warn(hotelName);
                    return hotels;
                }
                hotels.push({
                    city: vals[0],
                    cityId: cities[vals[0]],
                    hotelId: vals[1],
                    hotelName: vals[2],
                    hotelScore: vals[3],
                    hotelStar: vals[4],
                    address: vals[5]
                });
                return hotels;
            }, []);
            logger.info('mode: detail, Total # of hotels: %s', this.hotels.length);
        }
        logger.info('init completes...');
    }
    start() {
        this.init();
        this.run();
    }
}

let instance = new Hotel();
instance.start();
