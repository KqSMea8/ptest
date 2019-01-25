fs = require('fs')
request = require('request')

url1 = ''
url2 = '/xifan_topic/topic/'
lines = fs.readFileSync('datafile').toString().trim().split('\n');
tasks = lines.map(line=>{
    info = line.split(',');
    console.log(info[2], info[2] * 1000)
    return {
        nid: info[1],
        topic_id: info[0],
        status: info[3],
        heat: "0",
        publish_time: info[2] * 1000,
        ts: parseInt(+new Date())
    }
})
idx = 0;

//send2OnEs();
send2OffEs();

function send2OnEs(){
    if(idx >= tasks.length){
        console.log('all done')
        return;    
    }
    data = tasks[idx];
    url = url1 +  data.topic_id + '_' + data.nid;
    request.post({url: url, body: JSON.stringify(data)}, function(err,res){
        send2OnEs(); 
    })
}


function send2OffEs(){
    if(idx >= tasks.length){
        console.log('all done')
        return;    
    }
    data = tasks[idx];
    url = url2 +  data.topic_id + '_' + data.nid;
    console.log(data, url)
    request.post({url: url, body: JSON.stringify(data)}, function(err,res){
        console.log(res.body)
        //process.exit()
        idx++; 
        send2OffEs();
    })
}
