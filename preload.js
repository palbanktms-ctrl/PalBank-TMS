const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sauvegarderDonnees: (donnees) => ipcRenderer.invoke('sauvegarder-donnees', donnees),
  chargerSauvegarde: () => ipcRenderer.invoke('charger-sauvegarde')
});