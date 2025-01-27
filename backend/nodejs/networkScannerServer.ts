import express from 'express';
import { networkUtils } from './src/utils/networkUtils';

const app = express();
const port = 5001;

app.use(express.json());

app.post('/api/network/scan', async (req, res) => {
    const { ipRanges } = req.body;
    try {
        const devices = await networkUtils.scanNetwork(ipRanges);
        res.json(devices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Network scanner server running on http://localhost:${port}`);
});
