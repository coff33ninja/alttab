import { Request, Response } from 'express';
import { Device } from '@/models/device.model';
import { networkUtils } from '@/utils/networkUtils';
import { monitoringService } from '@/services/MonitoringService';
import { logger } from '@/utils/logger';

export class NetworkController {
  // Network scanning
  async scanNetwork(req: Request, res: Response) {
    try {
      const devices = await networkUtils.scanNetwork();
      res.json({ devices });
    } catch (error) {
      logger.error('Network scan failed:', error);
      res.status(500).json({ error: 'Failed to scan network' });
    }
  }

  // Wake-on-LAN
  async wakeDevice(req: Request, res: Response) {
    try {
      const { macAddress } = req.body;
      if (!macAddress) {
        return res.status(400).json({ error: 'MAC address is required' });
      }
      
      await networkUtils.wakeDevice(macAddress);
      logger.info(`Wake-on-LAN packet sent to ${macAddress}`);
      res.json({ success: true, message: 'Wake-on-LAN packet sent' });
    } catch (error) {
      logger.error('Wake-on-LAN failed:', error);
      res.status(500).json({ error: 'Failed to send Wake-on-LAN packet' });
    }
  }

  // Device management
  async getDevices(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const devices = await Device.find({ userId });
      res.json({ devices });
    } catch (error) {
      logger.error('Failed to fetch devices:', error);
      res.status(500).json({ error: 'Failed to fetch devices' });
    }
  }

  async addDevice(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const deviceData = {
        ...req.body,
        userId,
        monitoring: {
          enabled: true,
          interval: 5,
          alertOnOffline: true
        },
        powerSettings: {
          wolEnabled: true,
          wolPort: 9,
          requireConfirmation: true
        }
      };
      
      const device = new Device(deviceData);
      await device.save();

      // Start monitoring for the new device
      await monitoringService.updateDeviceMonitoring(device);

      res.status(201).json({ device });
    } catch (error) {
      logger.error('Failed to add device:', error);
      res.status(500).json({ error: 'Failed to add device' });
    }
  }

  async updateDevice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const update = req.body;
      
      const device = await Device.findOneAndUpdate(
        { _id: id, userId },
        update,
        { new: true }
      );
      
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      // Update monitoring settings if they changed
      await monitoringService.updateDeviceMonitoring(device);
      
      res.json({ device });
    } catch (error) {
      logger.error('Failed to update device:', error);
      res.status(500).json({ error: 'Failed to update device' });
    }
  }

  async deleteDevice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      const device = await Device.findOneAndDelete({ _id: id, userId });
      
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      // Stop monitoring for the deleted device
      monitoringService.stopMonitoring(id);
      monitoringService.stopWakeCron(`wake_${id}`);
      
      res.json({ success: true });
    } catch (error) {
      logger.error('Failed to delete device:', error);
      res.status(500).json({ error: 'Failed to delete device' });
    }
  }

  // Device monitoring
  async getDeviceStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const device = await Device.findOne({ _id: id, userId });
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      const isOnline = await networkUtils.pingDevice(device.ipAddress);
      
      await Device.findByIdAndUpdate(id, {
        isOnline,
        lastSeen: isOnline ? new Date() : device.lastSeen
      });

      res.json({
        isOnline,
        lastSeen: isOnline ? new Date() : device.lastSeen,
        monitoring: device.monitoring
      });
    } catch (error) {
      logger.error('Failed to get device status:', error);
      res.status(500).json({ error: 'Failed to get device status' });
    }
  }
}