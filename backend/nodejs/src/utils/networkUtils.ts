import { exec } from 'child_process';
import wol from 'wake-on-lan';
import util from 'util';
import os from 'os';
import { networkInterfaces } from 'os';
import NetworkScannerService from '../services/NetworkScannerService';

const execAsync = util.promisify(exec);

const wolSend = (macAddress: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        wol(macAddress, {}, (error: Error | null) => {
            if (error) reject(error);
            else resolve();
        });
    });
};

interface NetworkDevice {
    ipAddress: string;
    macAddress: string;
    vendor?: string;
}

interface NetworkInterfaceInfo {
    name: string;
    ip: string;
    netmask: string;
    mac: string;
    internal: boolean;
}

class NetworkUtils {
    async scanNetwork(ipRanges: string[]): Promise<NetworkDevice[]> {
        const allDevices: NetworkDevice[] = [];
        for (const ipRange of ipRanges) {
            console.log(`Scanning network with IP range: ${ipRange}`);
            const devices = await NetworkScannerService.scanNetwork(ipRange);
            console.log(`Devices found: ${JSON.stringify(devices)}`);
            allDevices.push(...devices);
        }
        return allDevices;
    }

    async wakeDevice(macAddress: string): Promise<void> {
        try {
            if (!this.isValidMacAddress(macAddress)) {
                throw new Error('Invalid MAC address format');
            }
            await wolSend(macAddress);
        } catch (error) {
            console.error('Wake-on-LAN error:', error);
            throw new Error('Failed to send Wake-on-LAN packet');
        }
    }

    private getDefaultInterface(): { interfaceName: string | null; interfaceInfo: NetworkInterfaceInfo | null } {
        try {
            const interfaces = networkInterfaces();
            for (const [name, addrs] of Object.entries(interfaces)) {
                for (const addr of addrs as os.NetworkInterfaceInfo[]) {
                    if (addr.family === 'IPv4' && !addr.internal) {
                        return {
                            interfaceName: name,
                            interfaceInfo: {
                                name,
                                ip: addr.address,
                                netmask: addr.netmask,
                                mac: addr.mac || '',
                                internal: addr.internal
                            }
                        };
                    }
                }
            }
            return { interfaceName: null, interfaceInfo: null };
        } catch (error) {
            console.error('Error getting network interface:', error);
            return { interfaceName: null, interfaceInfo: null };
        }
    }

    private parseArpOutput(output: string, platform: string): NetworkDevice[] {
        const devices: NetworkDevice[] = [];
        const lines = output.split('\n');

        if (platform === 'win32') {
            const regex = /\s+(\d+\.\d+\.\d+\.\d+)\s+([0-9a-fA-F-]{17})/;
            for (const line of lines) {
                const match = line.match(regex);
                if (match) {
                    devices.push({
                        ipAddress: match[1],
                        macAddress: this.standardizeMacAddress(match[2])
                    });
                }
            }
        } else {
            const regex = /(\d+\.\d+\.\d+\.\d+)\s+([0-9a-fA-F:]{17})/;
            for (const line of lines) {
                const match = line.match(regex);
                if (match) {
                    devices.push({
                        ipAddress: match[1],
                        macAddress: this.standardizeMacAddress(match[2])
                    });
                }
            }
        }

        return devices;
    }

    private isValidMacAddress(mac: string): boolean {
        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        return macRegex.test(mac);
    }

    private standardizeMacAddress(mac: string): string {
        return mac.toUpperCase().replace(/-/g, ':');
    }

    async pingDevice(ipAddress: string): Promise<boolean> {
        try {
            const command = process.platform === 'win32'
                ? `ping -n 1 -w 1000 ${ipAddress}`
                : `ping -c 1 -W 1 ${ipAddress}`;

            await execAsync(command);
            return true;
        } catch {
            return false;
        }
    }
}

export const networkUtils = new NetworkUtils();
