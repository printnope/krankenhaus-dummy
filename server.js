const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'booking.db');
const db = new sqlite3.Database(
    dbPath,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        if (err) {
            console.error('Verbindungsfehler:', err.message);
        } else {
            console.log('SQLite‑Datenbank verbunden');
        }
    }
);

const app = express();
app.use(express.json());

/**
 * GET /sap/slots
 * Liefert alle freien Termine (email IS NULL)
 */
app.get('/sap/slots', (req, res) => {
    const sql =
        'SELECT id, slot_date, start_time, end_time \n' +
        'FROM appointment \n' +
        'WHERE email IS NULL \n' +
        'ORDER BY slot_date, start_time';

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

/**
 * POST /sap/book
 * Body: { id: number, email: string }
 * Bucht einen Termin, sofern er noch frei ist.
 */
app.post('/sap/book', (req, res) => {
    const { id, email } = req.body;

    // Validierung
    if (id == null || email == null || email.trim() === '') {
        return res.status(400).json({ error: 'id und email dürfen nicht leer sein' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Ungültiges E‑Mail‑Format' });
    }

    // Ein Schritt: nur updaten, wenn Termin existiert UND noch frei ist
    const updateSql =
        'UPDATE appointment SET email = ? \n' +
        'WHERE id = ? AND email IS NULL';

    db.run(updateSql, [email, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        if (this.changes === 0) {
            // Prüfen, ob der Termin überhaupt existiert
            db.get('SELECT id FROM appointment WHERE id = ?', [id], (err2, row) => {
                if (err2) return res.status(500).json({ error: err2.message });
                if (!row) {
                    return res.status(404).json({ error: 'Termin nicht gefunden' });
                }
                return res.status(409).json({ error: 'Termin ist bereits gebucht' });
            });
        } else {
            return res.json({ message: 'Termin erfolgreich gebucht', id });
        }
    });
});

// 404‑Fallback
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint nicht gefunden' });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});