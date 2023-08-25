const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const url = require('url');
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '../node_modules', '.bin', 'electron')
    });
}

let win;
let newProductWindow;

//IPC

ipcMain.on('product:new', (e, newProduct) => {
    console.log(newProduct);
    win.webContents.send('product:new', newProduct);
    newProductWindow.close();
});

// MENU
const templateMenu = [
    {
        label: 'Productos',
        submenu: [
            {
                label: 'Ingresar Producto',
                accelerator: 'Ctrl+N',
                click() {
                    createNewProductWindow();
                }
            },
        ]
    },
    {
        label: 'Remover todos los productos',
        click() {
            win.webContents.send('products:remove-all');
        }
    },
    {
        label: 'Salir',
        accelerator: process.platform == 'darwin' ? 'command+Q' : 'Ctrl+Q',
        click() {
            app.quit();
        }
    }
];

// WINDOWS
const createNewProductWindow = () => {
    newProductWindow = new BrowserWindow({
        width: 700,
        height: 500,
        title: 'Agregar Nuevo Producto',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    newProductWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views', 'new-product.html'),
        protocol: 'file',
        slashes: true
    }));

    newProductWindow.on('closed', () => {
        newProductWindow = null;
    });
}

if (process.platform === 'darwin') {
    templateMenu.unshift({
        label: app.getName()
    });
}

if (process.env.NODE_ENV !== 'production') {
    templateMenu.push({
        label: 'DevTools',
        submenu: [{
            label: 'Show/Hide Dev Tools',
            accelerator: 'Ctrl+D',
            click(item, focusedWindow) {
                focusedWindow.toggleDevTools();
            }
        },
        {
            role: 'reload'
        }]
    });
}

app.on('ready', () => {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'views', 'index.html'),
        protocol: 'file',
        slashes: true
    }));

    const mainMenu = Menu.buildFromTemplate(templateMenu);

    Menu.setApplicationMenu(mainMenu);

    win.on('closed', () => {
        app.quit();
    });
});