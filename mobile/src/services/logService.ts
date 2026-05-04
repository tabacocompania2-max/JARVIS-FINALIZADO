class LogService {
  private logs: string[] = [];
  private listeners: ((logs: string[]) => void)[] = [];

  add(message: string) {
    const time = new Date().toLocaleTimeString();
    const log = `[${time}] ${message}`;
    console.log(log);
    this.logs = [log, ...this.logs].slice(0, 10); // Aumentamos a 10 logs visibles
    this.notify();
  }

  clear() {
    this.logs = [];
    this.notify();
  }

  private notify() {
    this.listeners.forEach(l => l(this.logs));
  }

  subscribe(listener: (logs: string[]) => void) {
    this.listeners.push(listener);
    listener(this.logs);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

export const logService = new LogService();
