var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};

socketApi.io = io;
io.path('/socket');

io.on('connection', function(socket){
    socket.on('join_room', function(room) {
        console.log('joinging room', room);
        socket.join(room);
    });
    socket.on('leave_room', function(room) {
        console.log('leaving room', room);
        socket.leave(room);
    });
});

socketApi.sendNotification = function(event, payload, recipients = null) {
    if(recipients && recipients.length) {
        recipients.forEach(recipient => {
            io.sockets.in(recipient).emit(event, payload);
        })
    } else {
        io.sockets.emit(event, payload);
    }
}

module.exports = socketApi;