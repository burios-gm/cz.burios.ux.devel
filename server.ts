import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

const app = express();
const PORT = 3000;

// Setup directories
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});
const upload = multer({ storage });

// Configure View Engine (EJS)
app.set('views', path.join(process.cwd(), 'views'));
app.set('view engine', 'ejs');

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper to generate timeNo (yyyyMMdd.HHmmssSSS)
function getTimeNo(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const HH = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  const SSS = String(d.getMilliseconds()).padStart(3, '0');
  return `${yyyy}${MM}${dd}.${HH}${mm}${ss}${SSS}`;
}

// In-memory file registry
interface StoredFile {
  id: string;
  fileName: string;
  filePath: string;
  size: number;
  uploadTime: string;
}

const fileRegistry: StoredFile[] = [
  {
    id: 'FS02_00000001',
    fileName: 'sample_doc.pdf',
    filePath: '',
    size: 102400,
    uploadTime: new Date().toISOString()
  },
  {
    id: 'FS02_00000002',
    fileName: 'qpx_logo.svg',
    filePath: '',
    size: 4096,
    uploadTime: new Date().toISOString()
  }
];

// Static asset routes
const webappDir = path.join(process.cwd(), 'src/main/webapp');
const iconsDir = path.join(process.cwd(), 'src/main/resources/icons');

// CSS aliases
app.get(['/css/qpx-test.css', '/devel/css/qpx-test.css'], (_req: Request, res: Response) => {
  res.sendFile(path.join(webappDir, 'api/qpx-test.css'));
});

// Serve icons
if (fs.existsSync(iconsDir)) {
  app.use('/darwin/icons', express.static(iconsDir));
  app.use('/devel/icons', express.static(iconsDir));
  app.use('/icons', express.static(iconsDir));
}

// Serve static assets for both root, /devel, and /darwin prefixes
app.use('/devel', express.static(webappDir));
app.use('/darwin', express.static(webappDir));
app.use(express.static(webappDir));

// --- API Endpoints ---

// Contact & Countries list
app.get(['/data/contacts', '/devel/data/contacts'], (_req: Request, res: Response) => {
  const contacts = [
    { NUMBER: '004', CODE3: 'AFG', CODE2: 'AF', NAME: 'Afghanistan' },
    { NUMBER: '008', CODE3: 'ALB', CODE2: 'AL', NAME: 'Albania' },
    { NUMBER: '012', CODE3: 'DZA', CODE2: 'DZ', NAME: 'Algeria' },
    { NUMBER: '036', CODE3: 'AUS', CODE2: 'AU', NAME: 'Australia' },
    { NUMBER: '040', CODE3: 'AUT', CODE2: 'AT', NAME: 'Austria' },
    { NUMBER: '056', CODE3: 'BEL', CODE2: 'BE', NAME: 'Belgium' },
    { NUMBER: '124', CODE3: 'CAN', CODE2: 'CA', NAME: 'Canada' },
    { NUMBER: '203', CODE3: 'CZE', CODE2: 'CZ', NAME: 'Czech Republic' },
    { NUMBER: '208', CODE3: 'DNK', CODE2: 'DK', NAME: 'Denmark' },
    { NUMBER: '246', CODE3: 'FIN', CODE2: 'FI', NAME: 'Finland' },
    { NUMBER: '250', CODE3: 'FRA', CODE2: 'FR', NAME: 'France' },
    { NUMBER: '276', CODE3: 'DEU', CODE2: 'DE', NAME: 'Germany' },
    { NUMBER: '380', CODE3: 'ITA', CODE2: 'IT', NAME: 'Italy' },
    { NUMBER: '392', CODE3: 'JPN', CODE2: 'JP', NAME: 'Japan' },
    { NUMBER: '528', CODE3: 'NLD', CODE2: 'NL', NAME: 'Netherlands' },
    { NUMBER: '578', CODE3: 'NOR', CODE2: 'NO', NAME: 'Norway' },
    { NUMBER: '616', CODE3: 'POL', CODE2: 'PL', NAME: 'Poland' },
    { NUMBER: '703', CODE3: 'SVK', CODE2: 'SK', NAME: 'Slovakia' },
    { NUMBER: '724', CODE3: 'ESP', CODE2: 'ES', NAME: 'Spain' },
    { NUMBER: '752', CODE3: 'SWE', CODE2: 'SE', NAME: 'Sweden' },
    { NUMBER: '756', CODE3: 'CHE', CODE2: 'CH', NAME: 'Switzerland' },
    { NUMBER: '826', CODE3: 'GBR', CODE2: 'GB', NAME: 'United Kingdom' },
    { NUMBER: '840', CODE3: 'USA', CODE2: 'US', NAME: 'United States' }
  ];
  res.json(contacts);
});

// File upload endpoints
app.post('/api/upload', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const id = `FS02_${String(Date.now()).slice(-8)}`;
  const record: StoredFile = {
    id,
    fileName: req.file.originalname,
    filePath: req.file.path,
    size: req.file.size,
    uploadTime: new Date().toISOString()
  };
  fileRegistry.push(record);
  res.json({
    filename: req.file.originalname,
    size: req.file.size,
    path: req.file.path,
    id
  });
});

app.post(['/upload', '/devel/upload'], upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Soubor nebyl vybrán.' });
  }
  const id = `FS02_${String(Date.now()).slice(-8)}`;
  const record: StoredFile = {
    id,
    fileName: req.file.originalname,
    filePath: req.file.path,
    size: req.file.size,
    uploadTime: new Date().toISOString()
  };
  fileRegistry.push(record);
  res.json({ message: `Soubor ${req.file.originalname} byl nahrán.` });
});

app.post('/darwin/files/ajax/upload', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nebyl nahrán žádný soubor.' });
  }
  const id = `FS02_${String(Date.now()).slice(-8)}`;
  const record: StoredFile = {
    id,
    fileName: req.file.originalname,
    filePath: req.file.path,
    size: req.file.size,
    uploadTime: new Date().toISOString()
  };
  fileRegistry.push(record);
  res.json(record);
});

// File download endpoints
function handleDownload(fileNameOrId: string, res: Response) {
  const file = fileRegistry.find(
    f => f.fileName.toLowerCase() === fileNameOrId.toLowerCase() || f.id === fileNameOrId
  );
  if (file && file.filePath && fs.existsSync(file.filePath)) {
    return res.download(file.filePath, file.fileName);
  }

  // Fallback demo content if file was mock or removed
  const displayName = file ? file.fileName : fileNameOrId;
  const content = `Demo content for file: ${displayName}\nGenerated by Buriosca QPX Devel\nTimestamp: ${new Date().toISOString()}`;
  res.setHeader('Content-Disposition', `attachment; filename="${displayName}"`);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.send(Buffer.from(content));
}

app.get('/api/download/:filename', (req: Request, res: Response) => {
  handleDownload(req.params.filename, res);
});

app.get(['/downloadFile', '/devel/downloadFile'], (req: Request, res: Response) => {
  const filename = (req.query.filename as string) || 'download.txt';
  handleDownload(filename, res);
});

app.get(['/darwin/files/ajax/download', '/darwin/files/download'], (req: Request, res: Response) => {
  const fileId = (req.query.fileId as string) || '';
  handleDownload(fileId, res);
});

// --- Page Routes ---

// Main Index / Devel root
app.get(['/', '/devel', '/devel/'], (_req: Request, res: Response) => {
  res.render('index', {
    timeNo: getTimeNo(),
    appTitle: 'Buriosca.cz - Devel QPX'
  });
});

// Test widget routes
app.get(['/test/:name', '/devel/test/:name'], (req: Request, res: Response) => {
  const widgetName = req.params.name.toLowerCase();
  const customTemplatePath = path.join(process.cwd(), 'views/test', `${widgetName}.ejs`);

  if (fs.existsSync(customTemplatePath)) {
    res.render(`test/${widgetName}`, {
      timeNo: getTimeNo(),
      appTitle: 'Buriosca.cz - QPX Devel',
      widgetName
    });
  } else {
    // Dynamic widget test template
    res.render('test/widget', {
      timeNo: getTimeNo(),
      appTitle: 'Buriosca.cz - QPX Devel',
      widgetName,
      isRegistered: ['button', 'buttongroup', 'layout', 'template', 'textbox', 'toolbar', 'tabview'].includes(widgetName)
    });
  }
});

// Download test page
app.get(['/download', '/devel/download'], (_req: Request, res: Response) => {
  res.render('download', {
    timeNo: getTimeNo(),
    appTitle: 'Buriosca.cz - Darwin QPX'
  });
});

// Upload test page
app.get(['/upload', '/devel/upload'], (_req: Request, res: Response) => {
  res.render('upload', {
    timeNo: getTimeNo(),
    appTitle: 'Buriosca.cz - Darwin QPX'
  });
});

// File manager page
app.get(['/darwin', '/darwin/', '/darwin/file_manager', '/file_manager', '/devel/file_manager'], (_req: Request, res: Response) => {
  res.render('p/file_manager', {
    timeNo: getTimeNo(),
    appTitle: 'Buriosca.cz - Darwin QPX - FileManager',
    files: fileRegistry
  });
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Start listening
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
