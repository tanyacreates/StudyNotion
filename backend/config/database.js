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

// Cache the connection across serverless invocations (Vercel reuses the module
// between warm invocations, so we avoid opening a new connection every time).
let connection = null;

exports.connectDB = () => {
    if (connection) return connection;

    connection = mongoose
        .connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log('Database connected succcessfully');
            return mongoose.connection;
        })
        .catch((error) => {
            console.log('Error while connecting server with Database');
            console.log(error);
            connection = null; // allow a retry on the next invocation
            // NOTE: do NOT process.exit() or rethrow here — process.exit is fatal in
            // serverless, and rethrowing on this fire-and-forget call would create an
            // unhandled rejection. Per-request queries surface their own errors instead.
        });

    return connection;
};
