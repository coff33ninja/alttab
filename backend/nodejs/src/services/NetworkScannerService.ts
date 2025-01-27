import { networkUtils } from '../utils/networkUtils';
import { logger } from '../utils/logger';

class NetworkScannerService {
  async scanNetwork(ipRange: string = '192.168.1.0/24') {
    try {
      const devices = await networkUtils.scanNetwork([ipRange]);
      return devices;
    } catch (error) {
      logger.error('Network scan failed:', error);
      throw new Error('Failed to scan network');
    }
  }
}

export default new NetworkScannerService();
