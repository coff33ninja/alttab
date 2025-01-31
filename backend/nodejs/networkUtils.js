import dgram from 'dgram';
import net from 'net';
import { exec } from 'child_process';
import os from 'os';
import { spawn } from 'child_process';

export class NetworkScanner {
  constructor() {
    this.interface = this.getDefaultInterface();
  }

  getDefaultInterface() {
    const interfaces = os.networkInterfaces();
    for (const [name, addrs] of Object.entries(interfaces)) {
      const ipv4 = addrs.find(addr => addr.family === 'IPv4' && !addr.internal);
      if (ipv4) return name;
    }
    return null;
  }

  async getMacFromArp(ip) {
    return new Promise((resolve) => {
      const cmd = process.platform === 'win32' 
        ? `arp -a ${ip}` 
        : `arp -n ${ip}`;

      exec(cmd, (error, stdout) => {
        if (error) {
          console.error('Error getting MAC for %s:', ip, error);
          resolve(null);
          return;
        }

        const lines = stdout.split('\n');
        for (const line of lines) {
          // Match MAC address pattern
          const match = line.match(/([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/);
          if (match) {
            resolve(match[0]);
            return;
          }
        }
        resolve(null);
      });
    });
  }

  async scanNetwork(ipRange) {
    try {
      console.log('Attempting Node.js network scan...');
      const nodeResults = await this.scanWithNode(ipRange);
      if (nodeResults && nodeResults.length > 0) {
        return nodeResults;
      }
      console.log('Node.js scan failed or found no devices, falling back to Python scanner');
      return await this.scanWithPython(ipRange);
    } catch (error) {
      console.error('Network scan failed:', error);
      throw new Error('Network scan failed: ' + error.message);
    }
  }

  async scanWithNode(ipRange) {
    return new Promise(async (resolve) => {
      const devices = [];
      const [baseIp, subnet] = ipRange.split('/');
      const baseIpParts = baseIp.split('.');
      const hosts = Math.pow(2, 32 - parseInt(subnet));
      const scanPromises = [];

      // Ping sweep for faster initial discovery
      const pingPromises = [];
      for (let i = 1; i < hosts - 1; i++) {
        const ip = `${baseIpParts[0]}.${baseIpParts[1]}.${baseIpParts[2]}.${i}`;
        const cmd = process.platform === 'win32'
          ? `ping -n 1 -w 100 ${ip}`
          : `ping -c 1 -W 1 ${ip}`;

        pingPromises.push(
          new Promise((resolve) => {
            exec(cmd, (error, stdout) => {
              if (!error && stdout.includes('TTL=') || stdout.includes('ttl=')) {
                resolve(ip);
              } else {
                resolve(null);
              }
            });
          })
        );
      }

      // Wait for all pings to complete
      const activeIps = (await Promise.all(pingPromises)).filter(ip => ip !== null);

      // For each responding IP, do a more detailed scan
      for (const ip of activeIps) {
        scanPromises.push(
          new Promise(async (resolve) => {
            try {
              const socket = new net.Socket();
              socket.setTimeout(500);

              // Try to get MAC address
              const mac = await this.getMacFromArp(ip);
              
              // Try common ports
              const commonPorts = [80, 443, 22, 445, 139];
              const openPorts = [];
              const services = {
                80: 'HTTP',
                443: 'HTTPS',
                22: 'SSH',
                445: 'SMB',
                139: 'NetBIOS',
              };
              let isAnyPortOpen = false;

              for (const port of commonPorts) {
                try {
                  await new Promise((resolve, reject) => {
                    const portSocket = new net.Socket();
                    portSocket.setTimeout(500);
                    
                    portSocket.on('connect', () => {
                      isAnyPortOpen = true;
                      portSocket.destroy();
                      resolve(true);
                    });
                    
                    portSocket.on('error', () => {
                      portSocket.destroy();
                      resolve(false);
                    });
                    
                    portSocket.on('timeout', () => {
                      portSocket.destroy();
                      resolve(false);
                    });
                    
                    portSocket.connect(port, ip);
                  });
                  
                  if (isAnyPortOpen) break;
                } catch (err) {
                  console.error(`Error scanning port %d on %s:`, port, ip, err);
                }
              }

              if (isAnyPortOpen || mac) {
                devices.push({
                  ip,
                  mac: mac || 'Unknown',
                  status: 'online',
                  name: `Device (${ip})`,
                  lastSeen: new Date().toISOString(),
                });
              }
            } catch (err) {
              console.error('Error scanning %s:', ip, err);
            }
            resolve();
          })
        );
      }

      // Wait for all detailed scans to complete
      await Promise.all(scanPromises);
      resolve(devices);
    });
  }

  async scanWithPython(ipRange) {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', ['backend/python/network_utils.py', ipRange]);
      let outputData = '';
      let errorData = '';

      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python scanner failed: ${errorData}`));
          return;
        }
        try {
          const devices = JSON.parse(outputData);
          resolve(devices);
        } catch (error) {
          reject(new Error('Failed to parse Python scanner output'));
        }
      });
    });
  }

  wakeOnLan(macAddress) {
    return new Promise((resolve, reject) => {
      const MAC_REPEAT = 16;
      const MAC_LENGTH = 6;
      const BROADCAST_ADDR = '255.255.255.255';
      const WOL_PORT = 9;

      const macBuffer = Buffer.from(macAddress.replace(/[:\-]/g, ''), 'hex');
      const magicPacket = Buffer.alloc(6 + MAC_LENGTH * MAC_REPEAT);

      for (let i = 0; i < 6; i++) {
        magicPacket[i] = 0xFF;
      }

      for (let i = 0; i < MAC_REPEAT; i++) {
        macBuffer.copy(magicPacket, 6 + i * MAC_LENGTH);
      }

      const socket = dgram.createSocket('udp4');

      socket.send(magicPacket, 0, magicPacket.length, WOL_PORT, BROADCAST_ADDR, (err) => {
        socket.close();
        if (err) reject(err);
        else resolve(true);
      });
    });
  }

  async shutdownDevice(ip, username, password) {
    return new Promise((resolve, reject) => {
      let cmd;

      if (process.platform === 'win32') {
        cmd = `shutdown /s /m \\\\${ip} /t 0`;
      } else {
        cmd = `ssh ${username}@${ip} "sudo shutdown -h now"`;
      }

      exec(cmd, (error) => {
        if (error) {
          console.error(`Error: ${error}`);
          reject(error);
          return;
        }
        resolve(true);
      });
    });
  }
}
