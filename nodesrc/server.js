const express = require('express');
const { createKeyPair } = require('./keyGen');
const sqlite3 = require('sqlite3').verbose();
const { verifyToken } = require('./verifyMethods');
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLOT_TIME_REGEX = /^\d{2}:\d{2}$/;
const app = express();


const db = new sqlite3.Database(process.env.PATHTODATABASE,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        if (err) {
            console.error(' DB‑Verbindungsfehler:', err.message);
        } else {
            console.log(' SQLite‑Datenbank verbunden');
        }
    }
);

app.use(express.json());
app.use(verifyToken);


app.get('/test', (req, res) => {
    process.env
    res.json(process.env.PATHTODATABASE);
});


app.get('/sap/generate-keys', async (req, res) => {
    try {
        const keys = await createKeyPair();
        res.json(keys);
    } catch (err) {
        console.error('Key-Generation Error:', err);
        res.status(500).json({ error: 'Fehler bei der Schlüsselerzeugung' });
    }
});


app.get('/sap/slots', (req, res) => {

    const sql = `SELECT id, slot_date, start_time, end_time
               FROM   appointment
               WHERE  email IS NULL
               ORDER  BY slot_date, start_time`;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/sap/book', (req, res) => {
    const { id, email } = req.body || {};

    if (typeof id !== 'number' || !EMAIL_REGEX.test(email || '')) {
        return res.status(400).json({ error: 'id (Number) und gültige email erforderlich' });
    }

    const sql = `UPDATE appointment SET email = ?
               WHERE id = ? AND email IS NULL`;

    db.run(sql, [email, id], function (err) {
        if (err)   return res.status(500).json({ error: err.message });
        if (this.changes === 0) {
            // prüfen, warum nichts geändert wurde
            db.get('SELECT email FROM appointment WHERE id = ?', [id], (e2, row) => {
                if (e2) return res.status(500).json({ error: e2.message });
                if (!row)   return res.status(404).json({ error: 'Termin nicht gefunden' });
                return res.status(409).json({ error: 'Termin ist bereits gebucht' });
            });
        } else {
            res.json({ message: 'Termin erfolgreich gebucht', id });
        }
    });
});


app.post('/sap/cancel', (req, res) => {
    const { start_time, email, slot_date } = req.body || {};


    if (!SLOT_TIME_REGEX.test(start_time || '') || !EMAIL_REGEX.test(email || '')) {
        return res.status(400).json({ error: 'start_time (HH:MM) oder gültige email erforderlich' });
    }

    const sql = `UPDATE appointment
               SET    email = NULL
               WHERE  start_time = ? AND email = ? AND slot_date = ?`;

    db.run(sql, [start_time, email, slot_date], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Kein passender Termin für Stornierung gefunden' });
        }
        res.json({ message: 'Termin erfolgreich storniert', start_time });
    });
});

app.use((req, res) => res.status(404).json({ error: 'Endpoint nicht gefunden' }));


app.listen(process.env.PORT, () => console.log(`Server läuft auf http://localhost:${process.env.PORT}`));