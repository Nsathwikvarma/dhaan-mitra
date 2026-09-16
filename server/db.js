import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'dhaan_mitra.db.json');

class DatabaseEngine {
  constructor() {
    this.data = {
      farmers: [],
      crops: [],
      procurementCenters: [],
      slots: [],
      bookings: [],
      sensorReadings: [],
      qualityChecks: [],
      payments: [],
      notifications: []
    };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(fileContent);
        this.data = { ...this.data, ...parsed };
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Error initializing database file, recreating:', err.message);
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to persist database to disk:', err.message);
    }
  }

  getCollection(table) {
    if (!this.data[table]) {
      this.data[table] = [];
    }
    return this.data[table];
  }

  find(table, filterFn = () => true) {
    const list = this.getCollection(table);
    return list.filter(filterFn);
  }

  findOne(table, filterFn) {
    const list = this.getCollection(table);
    return list.find(filterFn) || null;
  }

  insert(table, item) {
    const list = this.getCollection(table);
    const newItem = {
      id: item.id || `${table.slice(0, 3)}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      ...item
    };
    list.push(newItem);
    this.save();
    return newItem;
  }

  update(table, filterFn, updateData) {
    const list = this.getCollection(table);
    let updatedCount = 0;
    const updatedRecords = [];

    list.forEach((item, index) => {
      if (filterFn(item)) {
        const changes = typeof updateData === 'function' ? updateData(item) : updateData;
        list[index] = { ...item, ...changes, updatedAt: new Date().toISOString() };
        updatedRecords.push(list[index]);
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      this.save();
    }
    return updatedRecords;
  }

  delete(table, filterFn) {
    const list = this.getCollection(table);
    const initialLen = list.length;
    this.data[table] = list.filter(item => !filterFn(item));
    if (this.data[table].length !== initialLen) {
      this.save();
    }
    return initialLen - this.data[table].length;
  }

  reset() {
    this.data = {
      farmers: [],
      crops: [],
      procurementCenters: [],
      slots: [],
      bookings: [],
      sensorReadings: [],
      qualityChecks: [],
      payments: [],
      notifications: []
    };
    this.save();
  }
}

export const db = new DatabaseEngine();
