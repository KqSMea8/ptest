import sys
import json
import ctypes
import requests

token
cluster
queue_name
host

def callback(data, datatype):
    if datatype == -1:
        return -1
    try:
        data = data.strip().decode('gbk').encode("utf8")
        news = json.loads(data)
        news_id = news["m_url_sign"]
    except Exception as e:
        return -1
    send_to_es(data, news_id)
    return 0

bigpipe_so = ctypes.CDLL("./libname.so")
BIGPIPE_FUNC = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.c_char_p, ctypes.c_int)
bigpipe_callback = BIGPIPE_FUNC(callback)

def setup():
    receive_bigpipe_ret = -1
    while receive_bigpipe_ret == -1:
        try:
            receive_bigpipe_ret = bigpipe_so.receive_bigpipe(host, cluster, queue_name, token, bigpipe_callback)
        except Exception as e:
            time.sleep(2)

def send_to_es(data, nid):
    url = ""
    headers = {}
    res = requests.post(url,headers=headers,data=data)
    print(res.content)

setup()
