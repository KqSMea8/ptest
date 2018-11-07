import socket
import threading
def tcplink(sock,addr):
    print('Accept new connection from %s:%s...' % addr)
    sock.send('welcome!')
    while True:
        data=sock.recv(1024)
        if data=='exit' or not data:
            break;
        sock.send('hello %s' % data)
    sock.close()
    print('Connection from %s:%s closed' % addr)

s=socket.socket()
s.bind(('127.0.0.1',8527))
s.listen(5)
print('serve is waiting connect.....')
while True:
    sock,addr=s.accept()
    t=threading.Thread(target=tcplink,args=(sock,addr))
    t.start()
