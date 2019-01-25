fs = require('fs')
request = require('request')

lines = fs.readFileSync('datafile').toString().trim().split('\n')
tasks = lines.map(line=>line.split(','))

map={}
newsUrl = '/xifan_strategy_online_v1/t_article/_search?pretty'
idx = 0
req()

function req(){
    item = {}
    item.query = {'terms':{'_id':tasks.map(task=>task[1])}}
    item._source = { "include": ["publish_at", "status", "video_nid"]}
    item.size = tasks.length;
    console.log(JSON.stringify(item))
    request.get({ url: newsUrl, body: JSON.stringify(item) }, function (err, res) {
        ret = JSON.parse(res.body)
        infos = ret.hits.hits;
        for(info of infos){
            
            map[info._id] = {pa:info._source.publish_at, st:info._source.status};    
        }
        str = tasks.map(task=>{
            if(!map[task[1]]){
                console.log('not found nid', task);
                return;
            }
            task.push(map[task[1]].pa)
            task.push(map[task[1]].st)
            return task.join()
        }).join('\n');
        fs.writeFileSync('2_tid_nid_at', str);
    })
}

