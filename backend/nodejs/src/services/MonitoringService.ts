import { Device } from '../models/device.model';
import { networkUtils } from '../utils/networkUtils';
import { logger } from '../utils/logger';
import cron from 'node-cron';

export class MonitoringService {
  private static instance: MonitoringService;
  private monitoringJobs: Map<string, cron.ScheduledTask>;
  private wakeJobs: Map<string, cron.ScheduledTask>;

  private constructor() {
    this.monitoringJobs = new Map();
    this.wakeJobs = new Map();
    this.initializeMonitoring();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private async initializeMonitoring() {
    try {
      // Get all devices with monitoring enabled
      const devices = await Device.find({ 'monitoring.enabled': true });
      
      // Set up monitoring for each device
      devices.forEach(device => {
        this.startMonitoring(device);
        if (device.powerSettings.wakeCronEnabled && device.powerSettings.wakeCron) {
          this.setupWakeCron(device);
        }
      });

      logger.info(`Initialized monitoring for ${devices.length} devices`);
    } catch (error) {
      logger.error('Failed to initialize monitoring:', error);
    }
  }

  public async startMonitoring(device: any) {
    const jobId = device._id.toString();
    
    // Cancel existing job if any
    this.stopMonitoring(jobId);

    // Create new monitoring job
    const job = cron.schedule(`*/${device.monitoring.interval} * * * *`, async () => {
      try {
        const isOnline = await networkUtils.pingDevice(device.ipAddress);
        const previousStatus = device.isOnline;

        // Update device status
        await Device.findByIdAndUpdate(device._id, {
          isOnline,
          lastSeen: isOnline ? new Date() : device.lastSeen,
          'monitoring.lastStatus': isOnline ? 'online' : 'offline',
          ...(previousStatus !== isOnline && {
            'monitoring.lastStatusChange': new Date()
          })
        });

        // Log status change
        if (previousStatus !== isOnline) {
          logger.info(`Device ${device.name} (${device.ipAddress}) is now ${isOnline ? 'online' : 'offline'}`);
        }
      } catch (error) {
        logger.error(`Monitoring error for device ${device.name}:`, error);
      }
    });

    this.monitoringJobs.set(jobId, job);
  }

  public stopMonitoring(deviceId: string) {
    const job = this.monitoringJobs.get(deviceId);
    if (job) {
      job.stop();
      this.monitoringJobs.delete(deviceId);
    }
  }

  public setupWakeCron(device: any) {
    const jobId = `wake_${device._id.toString()}`;
    
    // Cancel existing wake job if any
    this.stopWakeCron(jobId);

    if (device.powerSettings.wakeCronEnabled && device.powerSettings.wakeCron) {
      try {
        const job = cron.schedule(device.powerSettings.wakeCron, async () => {
          try {
            await networkUtils.wakeDevice(device.macAddress);
            logger.info(`Scheduled wake executed for device ${device.name}`);
          } catch (error) {
            logger.error(`Failed to execute scheduled wake for device ${device.name}:`, error);
          }
        });
        
        this.wakeJobs.set(jobId, job);
      } catch (error) {
        logger.error(`Invalid wake cron expression for device ${device.name}:`, error);
      }
    }
  }

  public stopWakeCron(jobId: string) {
    const job = this.wakeJobs.get(jobId);
    if (job) {
      job.stop();
      this.wakeJobs.delete(jobId);
    }
  }

  public async updateDeviceMonitoring(device: any) {
    if (device.monitoring.enabled) {
      await this.startMonitoring(device);
    } else {
      this.stopMonitoring(device._id.toString());
    }

    if (device.powerSettings.wakeCronEnabled && device.powerSettings.wakeCron) {
      this.setupWakeCron(device);
    } else {
      this.stopWakeCron(`wake_${device._id.toString()}`);
    }
  }
}

export const monitoringService = MonitoringService.getInstance();