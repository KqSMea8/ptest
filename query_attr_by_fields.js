fs = require('fs')
request = require('request')

lines = fs.readFileSync('datafile').toString().trim().split('\n');
newsUrl = '/xifan_strategy_online_v1/t_article/_search?pretty'

idx = 0
req()
function req(){
    if(idx >= lines.length) return;
    info = lines[idx].split('\t');
    data = info[2].split(' -d ')[1]
    data = data.substring(1,data.length-1)
    item = JSON.parse(data)
    item._source = {"include":["article_id"]}
    item.size = 9999
    console.log(data)
    request.get({ url: newsUrl, body: JSON.stringify(item) }, function (err, res) {
       cnt = parse(err,res)
       str = cnt.map(id=>info[0] + "," + id).join('\n')
       
       fs.appendFileSync('ret.cmd.nids', str + '\n')
       idx++;
       setTimeout(req,4000)
    })
}

function parse(err,res){
    data = JSON.parse(res.body)
    total = data.hits.total
    if(total == 0){
        return []    
    }
    nids = data.hits.hits
    return nids.map(nid=>nid._id)
}

//{"query":{"match":{"content":"网红 酒吧"}}}

//{"query":{"bool":{"must":[{"publish_at": {"gte": 1545926400}}, {"term":{"attention":"新年"}}, {"term":{"attention":"时尚"}}]}}}