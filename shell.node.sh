source ~/.bashrc
tablename=t_spider_$1
mysql -hyq01-ge01.epc.baidu.com -P8306 -uroot -proot -e "

select author_id, min(from_base64(author_name)), max(fans) from xifan_spider_v1.${tablename} group by author_id" > tmp_fans

rm new_authors.txt
node -e '
   let lines = fs.readFileSync("tmp_fans").toString().trim().split("\n");
   lines.forEach((line,idx)=>{
       if(idx==0) return;
       line = line.split("\t");
       line[0] = "https://www.xiaohongshu.com/user/profile/" + line[0];
       fs.appendFileSync("new_authors.txt", line.join() + "\n");
   })
'
rm tmp_fans
