const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

// Node's default resolver can hit a stale IPv6 link-local DNS first and SERVFAIL
// before falling back. Pin to Google + Cloudflare DNS so Atlas SRV lookups are reliable.
try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
    dns.setDefaultResultOrder?.('ipv4first');
} catch (e) {
    // ignore — best-effort
}


exports.connectDB = () => {
    mongoose.connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(() => {
            console.log('Database connected succcessfully');
        })
        .catch(error => {
            console.log(`Error while connecting server with Database`);
            console.log(error);
            process.exit(1);
        })
};

