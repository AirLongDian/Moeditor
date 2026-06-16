import { app, BrowserWindow } from 'electron';
import { Application } from './app';

let moeApp: Application | null = null;

app.whenReady().then(async () => {
  moeApp = new Application();
  await moeApp.run();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0 && moeApp) {
    moeApp.open();
  }
});
