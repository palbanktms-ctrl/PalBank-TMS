const { autoUpdater } = require('electron-updater');
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });

  mainWindow.loadFile('plateforme_base.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Décommenter pour le débogage :
  // mainWindow.webContents.openDevTools();

  // Vérifier les mises à jour
  autoUpdater.checkForUpdatesAndNotify();

  // Événements de mise à jour
  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
    autoUpdater.quitAndInstall();
  });
}

// Gestionnaire de sauvegarde
ipcMain.handle('sauvegarder-donnees', (event, donnees) => {
  try {
    const backupDir = path.join(__dirname, 'backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const backupFile = path.join(backupDir, `sauvegarde-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(donnees, null, 2));

    return { success: true, fichier: backupFile };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('charger-sauvegarde', (event) => {
  try {
    const backupDir = path.join(__dirname, 'backup');
    if (!fs.existsSync(backupDir)) {
      return { success: true, donnees: null };
    }
    
    const fichiers = fs.readdirSync(backupDir)
      .filter(fichier => fichier.endsWith('.json'))
      .sort()
      .reverse();
    
    if (fichiers.length === 0) {
      return { success: true, donnees: null };
    }
    
    const dernierFichier = path.join(backupDir, fichiers[0]);
    const donnees = JSON.parse(fs.readFileSync(dernierFichier, 'utf8'));
     
    return { success: true, donnees: donnees };
  } catch (error) {
    return { success: false, error: error.message }; 
  }
});  

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
