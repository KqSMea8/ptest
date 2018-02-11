var fs = require('fs')
var _ = require("lodash")
var moment = require('moment')

function FilterMerge(isApp) {
    this.isApp = isApp;
    this.resultDir = "../result/ota/";
    this.dataDir = "../appdata/";
    this.elonghFile = "elonghotels.txt";
    this.ctriphFile = "ctriphotels.txt";
    this.qunarhFile = "qunarhotels.txt";
    this.meituanhFile = "meituanhotels.txt";

    this.elongrFile = "pc_elong_room_2017-12-20.txt";
    this.ctriprFile = "pc_ctrip_room_2017-12-20.csv";
    this.qunarrFile = "pc_qunar_room_2017-12-21.txt";
    this.meituanrFile = "meituan.booking.hotels.2017-12-19.txt";
    
    if (isApp) {
        this.ctriphFile = "app_ctrip_done_hotels.txt";
        this.qunarhFile = "app_qunar_hotel_done.txt";

        this.elongrFile = "app_elong_hotel.txt";
        this.ctriprFile = "app_ctrip_hotel.txt";
        this.qunarrFile = "app_qunar_hotel.txt";
    }
    
    this.elongHotels = [];
    this.ctripHotels = [];
    this.qunarHotels = [];
    this.elongRecords = [];
    this.ctripRecords = [];
    this.qunarRecords = [];
    this.dictCtHotel = {};
    this.dictQuHotel = {};
    this.dictElHotel = {};
    this.dictMtHotel = {};
    this.hotels = {};
}

FilterMerge.prototype.init = function() {
    if (!fs.existsSync(this.dataDir + this.elonghFile) || !fs.existsSync(this.dataDir + this.ctriphFile) || !fs.existsSync(this.dataDir + this.qunarhFile))
        throw "Data file not found.";
}

FilterMerge.prototype.load = function() {
    this.elongHotels = fs.readFileSync(this.dataDir + this.elonghFile).toString().split('\n');
    this.ctripHotels = fs.readFileSync(this.dataDir + this.ctriphFile).toString().split('\n');
    this.qunarHotels = fs.readFileSync(this.dataDir + this.qunarhFile).toString().split('\n');
    this.meituanHotels = fs.readFileSync(this.dataDir + this.meituanhFile).toString().split('\n');
    
    console.log("Before preprocessing, elong: %d, ctrip: %d, qunar: %d, meituan: %d", this.elongHotels.length, this.ctripHotels.length, this.qunarHotels.length, this.meituanHotels.length);
}

FilterMerge.prototype.merge = function() {
    var result = [];
    var c = 0;
    for (var k in this.dictElHotel) {
        var h = this.dictElHotel[k];
        if (!h.crooms || !h.qrooms || !h.erooms)// || !h.mrooms)
            continue;
        //console.log(h);
	
        for(var i=0;i<h.erooms.length;i++){
            for (var j = 0; j < h.crooms.length; j++) {
		for (var k = 0; k < h.qrooms.length; k++) {
//		    for(var m = 0; m< h.mrooms.length;m++){
			if (h.crooms[j].type == h.qrooms[k].type
			    && h.qrooms[k].type==h.erooms[i].type
//			    && h.mrooms[m].type == h.qrooms[k].type
			   ) {
			    var str = [
				h.city,
				h.ename,
				h.cname,
				h.qname,
				// h.mname,
				// h.mid,
				h.crooms[j].type,
				h.erooms[i].originalPrice,
				h.erooms[i].price,
				h.erooms[i].fan,
				h.erooms[i].mobile,
				h.crooms[j].originalPrice,
				h.crooms[j].price,
				h.crooms[j].fan,
				h.qrooms[k].originalPrice,
				h.qrooms[k].price,
				h.qrooms[k].fan,
				h.qrooms[k].book,
				
				// h.mrooms[m].originalPrice,
				// h.mrooms[m].price,
				// h.mrooms[m].fan,
				// h.mrooms[m].isBooking,
				
				// (h.qrooms[k].originalPrice / h.crooms[j].originalPrice).toFixed(2),
				// (h.crooms[j].fan / h.crooms[j].originalPrice).toFixed(2),
				// (h.qrooms[k].fan / h.qrooms[k].originalPrice).toFixed(2),
				// (h.qrooms[k].price / h.crooms[j].price).toFixed(2),
				h.erooms[i].prePay,
				h.crooms[j].prePay,
				h.qrooms[k].prePay
			    ].join();
			    
			    fs.appendFileSync("../result/ota/merged_"+moment().format("YYYY-MM-DD")+".txt", str + "\n");
			}
			/*
			  if(h.crooms[j].type==h.erooms[i].type && h.qrooms[k].type==h.erooms[i].type){
			  c++;
			  if(this.ItsFactor(h.crooms[j].tags,h.erooms[i].tags)>=0.5){
			  var str = h.city+","+h.ename+','+h.cname+','+h.qname+','+h.crooms[j].type+','+h.star+','+h.crooms[j].price+','+h.crooms[j].fan+','+h.erooms[i].price+','+h.erooms[i].fan+','+h.qrooms[k].price+','+h.qrooms[k].fan+','+h.qrooms[k].book;
			  console.log(str);
			  }
			  }*/
		   }
//	    }
            }
        }
    }

    console.log(c);
}


FilterMerge.prototype.ItsFactor = function(a, b) {
    var len = a.length > b.length ? a.length : b.length;
    if (len == 0)
        return 1;
    var equalTag = 0;
    for (var i = 0; i < a.length; i++) {
        for (var j = 0; j < b.length; j++) {
            if (a[i] == b[j])
                equalTag++;
        }
    }
    return equalTag / len;
}

FilterMerge.prototype.prepareHotel = function() {
    var dictHotel = {},
    i, j, k, m;
    var total = 0,
    elongCount = 0,
    ctripCount = 0,
    qunarCount = 0,
    meituanCount = 0;
    
    for (i = 0; i < this.elongHotels.length; i++) {
        if (!this.elongHotels[i]) continue;
        var vals = this.elongHotels[i].replace('\r', '').split(',');
        this.dictElHotel[vals[1]] = {
            city: vals[0],
            eid: vals[1],
            ename: vals[2]
        };
        elongCount++;
    }

    for (j = 0; j < this.ctripHotels.length; j++) {
        if (!this.ctripHotels[j]) continue;
        var vals = this.ctripHotels[j].replace('\r', '').split(',');
        var ctripId = vals[4];
        if (!this.dictCtHotel[ctripId]) {
            var obj = this.dictElHotel[vals[1]];
            if (!obj) continue;
            obj.cid = vals[4];
            obj.cname = vals[5];
            obj.star = vals[6];
            this.dictCtHotel[ctripId] = obj;
            ctripCount++;
        }
    }

    for (k = 0; k < this.qunarHotels.length; k++) {
        if (!this.qunarHotels[k]) continue;
        var vals = this.qunarHotels[k].replace('\r', '').split(',');
        var obj = this.dictElHotel[vals[1]];
        if (!obj) continue;
        obj.qid = vals[3];
        obj.qname = vals[4];
        this.dictQuHotel[vals[3]] = obj;
        qunarCount++;
    }

    for(m=0; m<this.meituanHotels.length; m++){
	if(!this.meituanHotels[m]) continue;
	var vals = this.meituanHotels[m].replace('\r', '').split(',');
        var obj = this.dictElHotel[vals[1]];
        if (!obj) continue;

        obj.mid = vals[4];
        obj.mname = vals[5];
        this.dictMtHotel[vals[4]] = obj;
        meituanCount++;
    }
    
    
    console.log("After preProcessing, elong: %d, ctrip: %d, qunar: %d, meituan: %d" , elongCount , ctripCount ,qunarCount,meituanCount);
    var self= this;
    var validkeys = Object.keys(this.dictElHotel).filter(function(key){
	var hotel = this[key];
	return hotel.cid && hotel.eid && hotel.qid// && hotel.mid
    },this.dictElHotel);
    
    validkeys.forEach(function(key){
    	self.dictElHotel[key].hit = true;
    	//self.dictMtHotel[h.mid].hit = true;
    	// self.dictCtHotel[h.cid].hit = true;
    	// self.dictElHotel[h.eid].hit = true;
    	// self.dictQuHotel[h.qid].hit = true;
    });
    
    // var h = this.dictElHotel['10201147'];
    
    // self.dictMtHotel[h.mid].hit = true;
    // self.dictCtHotel[h.cid].hit = true;
    // self.dictElHotel[h.eid].hit = true;
    // self.dictQuHotel[h.qid].hit = true;

    // console.log(h.eid);
    // console.log(h.cid);
    // console.log(h.qid);
    // console.log(h.mid);
    // console.log(self.dictQuHotel[h.qid]);
    console.log("intersection of web sites: %d",validkeys.length);
    //console.log(validkeys);
}

FilterMerge.prototype.preProcessApp = function() {
    fs.readFileSync(this.resultDir + this.elongrFile).toString().split('\n').forEach(function(line) {
        if (!line) return;
        var vals = line.replace('\r', '').split(',');

	if(vals[4].search("钟点房") > -1)
	    return;
	
        var room = {};
        room.tags = [];
        room.tags.push(vals[14]);
	
        room.type = vals[3].replace(/[\(\（\[].*/g, '').replace(/[\.\s\-]/g, '').replace(/[房间]/, '');
        var pkg = vals[5].match(/[\【\[\(|\（]([^\)\）\]\】]*)[\]\)\）\】]/);
        if (pkg && pkg.length > 1)
            room.tags = room.tags.concat(pkg[1].split(';').map(function(p) {
                return p.replace(/\./g, '');
            }));
        room.price = vals[9];
        room.fan = vals[10];
        var obj = that.dictElHotel[vals[1]];

        if (obj) {
            if (obj.erooms == undefined)
                obj.erooms = [];
            obj.erooms.push(room);
            //	    console.log(obj.rooms.length+","+obj.eid);
        }
    });
    fs.readFileSync(this.resultDir + this.ctriprFile).toString().split('\n').forEach(function(line) {
        if (!line) return;
        var vals = line.replace('\r', '').split(',');
        var room = {};
        var pkg = vals[5].match(/[\(\（]([^\)\）]*)[\)|\）]/);
        room.type = vals[5].replace(/[房间]/g, '').replace(/[\(\（\[].*/g, '').replace("携程标准价", '');
        room.tags = [];
        room.tags.push(vals[14]);
        if (pkg && pkg.length > 1)
            room.tags = room.tags.concat(pkg[1].split(';').map(function(p) {
                return p.replace(/\./g, '');
            }));
        room.price = vals[6].trim() == "专享价" ? "¥100000" : vals[6].trim();
        room.fan = vals[17] ? vals[17] : "返0元";

        var obj = that.dictCtHotel[vals[1]];
        if (obj) {
            if (obj.crooms == undefined)
                obj.crooms = [];
            obj.crooms.push(room);
        }
    });
    
    fs.readFileSync(this.resultDir + this.qunarrFile).toString().split('\n').forEach(function(line) {
        if (!line) return;
        var vals = line.replace('\r', '').split(',');
        var room = {};
        room.tags = [];
        room.type = vals[4].replace(/\(.*/, '').replace(/[房间]/g, '');

        room.price = vals[6];
        try {
            room.finalPrice = eval(room.price.replace(/[^\d\-]/g, '').replace(/\-\-/g, '-'));
        } catch (e) {
            console.log("expression error.");
        }
        room.book = vals[5];
        var obj = that.dictQuHotel[vals[1]];
        if (obj) {
            if (obj.qrooms == undefined) {
                obj.qrooms = [];
                obj.qrooms.push(room);
            } else {
                var exists = false;
                for (var z = 0; z < obj.qrooms.length; z++) {
                    if (obj.qrooms[z].type == room.type) {
                        exists = true;
                        if (obj.qrooms[z].finalPrice > room.finalPrice) {
                            obj.qrooms[z] = room;
                        }
                    }
                }
                if (!exists)
                    obj.qrooms.push(room);
            }

        }
    });
}

FilterMerge.prototype.preProcess = function() {
    var elongRoomCount = 0,
    ctripRoomCount = 0,
    meituanRoomCount=0,
    qunarRoomCount = 0;
    
    fs.readFileSync(this.resultDir + this.elongrFile).toString().split('\n').forEach(function(line) {
        if (!line.trim()) return;
	if(line.search(/(钟点房|休息)/) >  -1) return;
	if(line.search(/\d间起订/) > -1) return;
	
        var vals = line.replace('\r', '').split(',');
	
	if(!this.dictElHotel[vals[1]] || !this.dictElHotel[vals[1]].hit || !vals[9] || vals[5].search(/(小时房|入住\d小时)/) > -1) return;
	
        var room = {};
        room.tags = [];
        //vals[5].match(/[\（|\(]([^\)\）])[\)|\）]/);
	if(vals[14])
	    room.tags.push(vals[14]);
	
        room.type  = vals[3].replace(/[\(\（\[].*/g,'').replace(/[\.\s\-]/g,'').replace(/[房间]/,'');
        room.type = room.type && room.type.replace(/[房间][A-Z]?$/,'').toUpperCase();

	if( vals[5].search("5折限量") > -1 ){
	    room.mobile = "Y"
	}else{
	    room.mobile = "N";
	}
	
        var pkg = vals[5].match(/[\【\[\(|\（]([^\)\）\]\】]*)[\]\)\）\】]/);
        if (pkg && pkg.length > 1)
	    room.tags = room.tags.concat(pkg[1].split(';').map(function(p) {
                return p.replace(/\./g, '');
	    }));
	
        room.price = vals[9];
        room.fan = vals[10];
	room.prePay = vals[12];
	
	var p = Number(room.price.replace(/¥/,''));
	if (_.isNaN(p)) return;
	room.price = p;
	
	var addon = '';
	if( addon = vals[5].split("到店另付")[1]){
	    addon = Number(addon);
	    if(_.isNaN(addon)) return;
	    room.price += addon;
	}
	
	if(room.fan){
	    room.fan = Number(room.fan.split("返")[1]);
	    if(_.isNaN(room.fan)) room.fan=0;
	}else{
	    room.fan = 0;
	}
	
	room.originalPrice = room.price + room.fan;
        //if(room.search("升级至")>-1){
        //    room = room.replace(/[^升级至]/,'').replace(/[升级至]/g,'');
        //}
        var obj = that.dictElHotel[vals[1]];
        if (obj) {
	    if (obj.erooms == undefined){
                obj.erooms = [room];
	    }else{
		var exists = false;
		for (var z = 0; z < obj.erooms.length; z++) {
		    if (obj.erooms[z].type == room.type) {
			exists = true;
			if (obj.erooms[z].price > room.price) {
			    obj.erooms[z] = room;
			}
		    }
		}
		
		if (!exists)
		    obj.erooms.push(room);

		elongRoomCount++;
	    }
	    //console.log(room);
        }
    },this);

    
    fs.readFileSync(this.resultDir + this.ctriprFile).toString().split('\n').forEach(function(line) {
        if (!line) return;
	if(line.search(/(钟点房|休息)/)  > -1) return;

        var vals = line.replace('\r', '').split(',');
	
	if(!this.dictCtHotel[vals[1]] || !this.dictCtHotel[vals[1]].hit || !vals[6] || vals[4].search(/(小时房|入住\d小时)/) > -1) return;
	
        var room = {};
        var pkg = vals[4].match(/[\(\（]([^\)\）]*)[\)|\）]/);
        room.type = vals[3].replace(/[房间]/g, '').replace(/[\(\（\[].*/g, '').replace("携程标准价", '').toUpperCase();
	
        room.tags = [];
	
        //room.tags.push(vals[9]);
        //if(pkg && pkg.length>1)
        //    room.tags = room.tags.concat(pkg[1].split(';').map(function(p){return p.replace(/\./g,'');}));

        var p = Number(vals[6].replace(/[\s¥]/g, ''));
        if (_.isNaN(p)) return;

        room.price = p;
	var addon = '';
	
	if(addon = vals[4].split("到店另付")[1]){
	    addon = Number(addon);
	    if(_.isNaN(addon)) return;
	    room.price+=addon;
	}
	
        if (vals[7]) {
	    if(_.isNaN(Number(vals[7]))){
		room.fan = Number(vals[7].split(/(?:立减|可返)/)[1]);
	    }else{
		room.fan = Number(vals[7]);
	    }
        }
	
	if(_.isNaN(room.fan))
	    room.fan = 0;
	
        room.prePay = vals[10].trim();
        room.originalPrice = room.price + room.fan;

        var obj = that.dictCtHotel[vals[1]];

        if (obj) {
            if (obj.crooms == undefined) {
                obj.crooms = [];
                obj.crooms.push(room);
            }else{
		var exists = false;
		for (var z = 0; z < obj.crooms.length; z++) {
                    if (obj.crooms[z].type == room.type) {
			exists = true;
			if (obj.crooms[z].price > room.price) {
                            obj.crooms[z] = room;
			}
                    }
		}
		if (!exists)
                    obj.crooms.push(room);

		ctripRoomCount++;
	    }
	    //console.log(room);
        }
    },this);
    
    fs.readFileSync(this.resultDir + this.meituanrFile).toString().split('\n').forEach(function(line){
	if(!line.trim()) return;
	if(line.search(/(钟点房|休息)/) > -1) return;
	
	var vals = line.trim().split(',');
	
	if(!this.dictMtHotel[vals[3]] || !this.dictMtHotel[vals[3]].hit ||
	   //!vals[15] || !vals[16] || vals[15]=='0' ||
	   vals[6]=='0' || vals[5].search(/(小时房|入住\d小时)/) > -1
	  )
	    return;
	
	vals[5].replace(/\d选\d/,'').split(/[,\/，]/).forEach(function(type){
	    var room = {};
	    room.tags = [];
	    
	    var id = vals[3];
	    var name = vals[4];
	    
	    if(!type) return;
	    
	    room.originalPrice = "N/A"//Number(vals[15] || 0);
	    room.price = Number(vals[6].replace(/元/g,'') || 0);
	    room.type = type.split('-')[0].replace(/[【\[\(]+[^】\]\)]*[】\]\)]+/g,'').replace(/[房间]/g, '').toUpperCase();
	    room.fan = 0;
            room.isBooking = vals[7] || "N";
	    var obj = that.dictMtHotel[id];
	    
	    //console.log([obj.eid,obj.ename,obj.mid,obj.mname,room.type].join());
	    
            if (obj) {
		if (obj.mrooms == undefined) {
                    obj.mrooms = [room];
		}else{
		    var exists = false;
		    for (var z = 0; z < obj.mrooms.length; z++) {
			if (obj.mrooms[z].type == room.type) {
			    exists = true;
			    if (obj.mrooms[z].price > room.price) {
				obj.mrooms[z] = room;
			    }
			}
		    }
		    
		    if (!exists)
			obj.mrooms.push(room);
		}
		meituanRoomCount++;
            }
	    //console.log(room);
	},this);
    },this);

    fs.readFileSync(this.resultDir + this.qunarrFile).toString().split('\n').forEach(function(line) {
        if (!line) return;
	if(line.search(/(钟点房|休息)/)  > -1) return;
        var vals = line.replace('\r', '').split(',');
	
	if(!this.dictQuHotel[vals[1].replace(/\.html/,'')] || !this.dictQuHotel[vals[1].replace(/\.html/,'')].hit || vals[6].search(/(小时房|入住\d小时)/) > -1) return;
	
        var room = { tags:[]}
	, type = vals[3].replace(/\s/g,'');
	
	if((type.length & 1) == 0 && type.slice(0,type.length/2)==type.slice(type.length/2)){
	    type = type.slice(0,type.length/2);
	}
	
	room.type = type.replace(/[【\[\(]+[^】\]\)]*[】\]\)]+/g,'').replace(/[\-].*/,'').replace(/[\.·]*$/,'').replace(/[房间]/g, '').replace(/标准价/,'').replace(/\(.*$/,'').replace(/\)*$/,'').toUpperCase();
	room.price = Number(vals[9].replace(/¥/, ''));
	
        if (vals[10].trim()) {
	    if(vals[10].search('税费')>-1){
		room.fan=0;
	    }else{
		room.fan = Number(vals[10].trim().split(/(?:返|减)¥/)[1]);
	    }
        } else {
            room.fan = 0;
        }
	
        if (vals[7]=="1") {
            room.prePay = "Y";
        } else {
            room.prePay = "N";
        }
	
	room.originalPrice = room.price+room.fan;
	//console.log("%s, %s #### original price: %s, fan: %s, finalPrice: %s",vals[9],vals[10],room.originalPrice,room.fan,room.price);
        //room.price = room.originalPrice - room.fan;
        //room.finalPrice = eval(room.price.replace(/¥/g,'')-room.fan.replace(/[返¥]/g,''));
        room.book = vals[5];
	
        var obj = that.dictQuHotel[vals[1].replace(/\.html/, '')];
	
        if (obj) {
            if (obj.qrooms == undefined) {
                obj.qrooms = [];
                obj.qrooms.push(room);
            } else {
                var exists = false;
                for (var z = 0; z < obj.qrooms.length; z++) {
                    if (obj.qrooms[z].type == room.type) {
                        exists = true;
                        if (obj.qrooms[z].price > room.price) {
                            obj.qrooms[z] = room;
                       }
                    }
                }
                if (!exists)
                    obj.qrooms.push(room);
            }
            qunarRoomCount++;
        }
	//console.log(room);
    },this);
    
    console.log("rooms elong: %d, ctrip: %d, qunar: %d, meituan: %d",elongRoomCount,ctripRoomCount ,qunarRoomCount,meituanRoomCount);
    //    console.log(this.qunarRecords[234]);
    //    console.log("Total records, elong: "+this.elongRecords.length+", ctrip: "+this.ctripRecords.length+", qunar: "+this.qunarRecords.length);
}

FilterMerge.prototype.start = function() {
    this.init();
    this.load();
    this.prepareHotel();
    
    console.log(this.isApp ? "merge app start" : "merge pc start");
    if (this.isApp) {
        this.preProcessApp();
    } else {
        this.preProcess();
    }
    
    this.merge();
}

var fm = new FilterMerge();
var that = fm;
fm.start();
