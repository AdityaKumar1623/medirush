const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const initSocket = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user    = await User.findById(decoded.id).lean();
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const u = socket.user;
    console.log(`🔌 ${u.name} (${u.role}) connected [${socket.id}]`);

    // Role-based rooms
    socket.join(`user_${u._id}`);
    if (u.role === 'admin')    socket.join('admin');
    if (u.role === 'delivery') socket.join('delivery');

    socket.on('join_order',  (id) => socket.join(`order_${id}`));
    socket.on('leave_order', (id) => socket.leave(`order_${id}`));

    socket.on('location_update', (data) => {
      if (data?.orderId) {
        io.to(`order_${data.orderId}`).emit('delivery_location', {
          lat: data.lat, lng: data.lng, deliveryPartner: u.name,
        });
      }
    });

    socket.on('disconnect', () =>
      console.log(`❌ ${u.name} disconnected`)
    );
  });
};

module.exports = initSocket;
