# CODESNAP - ESPECIFICACIÓN TÉCNICA COMPLETA

## DESCRIPCIÓN
Web app que convierte código en imágenes estilizadas shareables. Usuario pega código, elige tema/lenguaje, genera PNG + URL compartible.

---

## STACK COMPLETO

### BACKEND
- **Runtime:** Node.js 18+
- **Framework:** Express 4.18+
- **Base de datos:** MongoDB Atlas (free tier)
- **ORM:** Mongoose 8.0+
- **Validación:** express-validator 7.0+
- **Logger:** Winston 3.11+
- **CORS:** cors 2.8+
- **Environment:** dotenv 16.3+
- **Generación de imágenes:** node-canvas 2.11+ (renderiza HTML a imagen)
- **Syntax highlighting:** Prism.js (CDN en frontend, pero necesitas prismjs 1.29+ en backend para preview)
- **UUID:** uuid 9.0+ (IDs únicos para snippets)
- **Rate limiting:** express-rate-limit 7.1+
- **Compression:** compression 1.7+

### FRONTEND
- **Framework:** React 18.2+ (Vite 5.0+ como bundler)
- **HTTP Client:** Axios 1.6+
- **Syntax highlighting:** Prism.js 1.29+ (CDN)
- **Temas Prism:** prism-themes (vía CDN)
- **Iconos:** Lucide React 0.294+ (gratis, moderno)
- **Animaciones:** Framer Motion 10.16+ (smooth, gratis)
- **Clipboard:** clipboard-copy 4.0+ (copiar URLs)
- **Toast notifications:** react-hot-toast 2.4+
- **Color picker:** react-colorful 5.6+ (para fondo custom)
- **Font selector:** Google Fonts API

### TESTING
- **Backend:** Jest 29.7+ + Supertest 6.3+
- **Frontend:** Vitest 1.0+ + React Testing Library 14.1+
- **E2E:** (opcional pero recomendado) Playwright 1.40+

### HERRAMIENTAS
- **Linter:** ESLint 8.55+
- **Formatter:** Prettier 3.1+
- **Git hooks:** Husky 8.0+
- **Pre-commit:** lint-staged 15.2+

---

## COMANDOS INICIALIZACIÓN

### Backend
```bash
mkdir codesnap-backend && cd codesnap-backend
npm init -y
npm install express mongoose cors dotenv express-validator winston node-canvas uuid express-rate-limit compression prismjs
npm install -D jest supertest eslint prettier husky lint-staged nodemon
```

### Frontend
```bash
npm create vite@latest codesnap-frontend -- --template react
cd codesnap-frontend
npm install axios react-hot-toast framer-motion lucide-react react-colorful clipboard-copy
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

---

## ESTRUCTURA DE CARPETAS

```
codesnap/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # Conexión MongoDB
│   │   │   └── logger.js            # Configuración Winston
│   │   ├── controllers/
│   │   │   └── snippetController.js # Lógica de negocio
│   │   ├── models/
│   │   │   └── Snippet.js           # Schema Mongoose
│   │   ├── routes/
│   │   │   └── snippetRoutes.js     # Rutas Express
│   │   ├── middleware/
│   │   │   ├── errorHandler.js      # Manejo global de errores
│   │   │   └── rateLimiter.js       # Rate limiting
│   │   ├── utils/
│   │   │   ├── imageGenerator.js    # Genera PNG con node-canvas
│   │   │   └── validator.js         # Validaciones custom
│   │   └── app.js                   # Setup Express
│   ├── tests/
│   │   ├── unit/
│   │   │   └── imageGenerator.test.js
│   │   └── integration/
│   │       └── snippet.test.js
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── jest.config.js
│   ├── package.json
│   └── server.js                    # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── CodeEditor.jsx       # Textarea con Prism
    │   │   ├── StyleCustomizer.jsx  # Selectores tema/font/bg
    │   │   ├── ImagePreview.jsx     # Preview antes de generar
    │   │   └── ShareModal.jsx       # Modal con URL shareable
    │   ├── services/
    │   │   └── api.js               # Axios config + endpoints
    │   ├── utils/
    │   │   └── constants.js         # Lenguajes, temas disponibles
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── tests/
    │   └── CodeEditor.test.jsx
    ├── .env.example
    ├── vite.config.js
    └── package.json
```

---

## ENDPOINTS DEL BACKEND (ROUTERS)

### Router: `/api/snippets`

#### POST /api/snippets/generate
**Qué hace:** Recibe código + estilos, genera imagen PNG, guarda en MongoDB, devuelve snippetId + URL.

**Request Body:**
```json
{
  "code": "const hello = 'world';",
  "language": "javascript",
  "theme": "dracula",
  "font": "JetBrains Mono",
  "padding": 40,
  "background": "#1a1a2e",
  "shadow": true
}
```

**Response (201):**
```json
{
  "success": true,
  "snippetId": "abc123-def456",
  "shareUrl": "https://codesnap.app/snippet/abc123-def456",
  "imageUrl": "https://codesnap.app/api/snippets/abc123-def456/image"
}
```

**Lógica interna:**
1. Valida body (express-validator)
2. Genera UUID para snippetId
3. Llama a `imageGenerator.generateImage(data)` → devuelve Buffer PNG
4. Convierte Buffer a base64
5. Guarda en MongoDB: código + estilos + imageBase64 + timestamps
6. Devuelve snippetId + URLs

---

#### GET /api/snippets/:id
**Qué hace:** Obtiene datos completos del snippet (sin imagen, solo metadata).

**Response (200):**
```json
{
  "snippetId": "abc123-def456",
  "code": "const hello = 'world';",
  "language": "javascript",
  "theme": "dracula",
  "font": "JetBrains Mono",
  "padding": 40,
  "background": "#1a1a2e",
  "shadow": true,
  "createdAt": "2025-01-15T10:30:00Z"
}
```

**Lógica interna:**
1. Busca en MongoDB por snippetId
2. Si no existe → 404
3. Si existe → devuelve datos (excluye imageBase64 para ahorrar bandwidth)

---

#### GET /api/snippets/:id/image
**Qué hace:** Devuelve la imagen PNG del snippet.

**Response (200):**
- Content-Type: `image/png`
- Body: Buffer PNG

**Lógica interna:**
1. Busca snippet en MongoDB
2. Si no existe → 404
3. Convierte imageBase64 a Buffer
4. Devuelve Buffer con headers correctos

---

### Router: `/api/health`

#### GET /api/health
**Qué hace:** Health check del backend (para monitoreo).

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00Z",
  "database": "connected"
}
```

---

## VISTAS/COMPONENTES DEL FRONTEND

### Vista Principal: `App.jsx`
**Qué muestra:**
- Layout completo con header, editor y sidebar
- Header: Logo "CodeSnap" + botón "How it works"
- Sección izquierda: CodeEditor + StyleCustomizer
- Sección central: ImagePreview (live preview)
- Sección derecha (opcional): Historial de snippets (localStorage)

**Flujo:**
1. Usuario pega código en CodeEditor
2. Elige estilos en StyleCustomizer
3. Preview actualiza en tiempo real
4. Click "Generate" → llama API → muestra ShareModal con URL

---

### Componente: `CodeEditor.jsx`
**Qué muestra:**
- Textarea para pegar código (max 5000 chars)
- Dropdown para seleccionar lenguaje
- Contador de caracteres: "1250/5000"
- Botón "Generate Image"

**Props recibidas:**
```javascript
{
  code: String,
  language: String,
  onCodeChange: Function,
  onLanguageChange: Function,
  onGenerate: Function,
  isGenerating: Boolean
}
```

**Lógica interna:**
- onChange en textarea → actualiza code en parent (App.jsx)
- Valida límite de 5000 chars
- Deshabilita botón si code vacío o >5000 chars
- onGenerate → llama API POST /api/snippets/generate

---

### Componente: `StyleCustomizer.jsx`
**Qué muestra:**
- Dropdown tema: Dark, Light, Monokai, Dracula
- Dropdown fuente: JetBrains Mono, Fira Code, Source Code Pro
- Slider padding: 20-60px
- Color picker para fondo (react-colorful)
- Toggle shadow: ON/OFF

**Props recibidas:**
```javascript
{
  theme: String,
  font: String,
  padding: Number,
  background: String,
  shadow: Boolean,
  onThemeChange: Function,
  onFontChange: Function,
  onPaddingChange: Function,
  onBackgroundChange: Function,
  onShadowToggle: Function
}
```

**Lógica interna:**
- Cada control actualiza estado en parent (App.jsx)
- Parent pasa estilos a ImagePreview para live preview

---

### Componente: `ImagePreview.jsx`
**Qué muestra:**
- Div que simula cómo se verá la imagen final
- Código con syntax highlighting (Prism.js)
- Aplica estilos seleccionados en tiempo real

**Props recibidas:**
```javascript
{
  code: String,
  language: String,
  theme: String,
  font: String,
  padding: Number,
  background: String,
  shadow: Boolean
}
```

**Lógica interna:**
- useEffect que ejecuta Prism.highlightAll() cuando code/language cambian
- Aplica estilos inline según props
- Debounce 300ms para no re-renderizar cada keystroke

---

### Componente: `ShareModal.jsx`
**Qué muestra:**
- Modal que aparece después de generar imagen
- Imagen generada (preview)
- URL shareable: `https://codesnap.app/snippet/abc123`
- Botón "Copy Link" (clipboard-copy)
- Botón "Download PNG"
- Botón "Create Another"

**Props recibidas:**
```javascript
{
  isOpen: Boolean,
  onClose: Function,
  snippetId: String,
  shareUrl: String,
  imageUrl: String
}
```

**Lógica interna:**
- Usa Framer Motion para animación de entrada
- Copy Link → usa clipboard-copy + muestra toast "Copied!"
- Download PNG → fetch imageUrl → crea <a> temporal → trigger download
- Create Another → cierra modal + limpia editor

---

### Vista Pública: `/snippet/:id` (React Router)
**Qué muestra:**
- Página standalone que muestra snippet compartido
- Imagen generada (full width)
- Botón "Copy Link"
- Botón "Create your own"
- Footer: "Powered by CodeSnap"

**Flujo:**
1. Usuario accede a URL compartida
2. Fetch GET /api/snippets/:id/image
3. Muestra imagen
4. "Create your own" → redirect a home

---

## REQUERIMIENTOS FUNCIONALES

### RF-01: Pegar código
- Usuario pega código en textarea
- Límite: 5000 caracteres (evitar abuse)
- Auto-detect lenguaje (opcional, puede forzar manual)

### RF-02: Seleccionar lenguaje
- Dropdown con lenguajes soportados: JavaScript, Python, Java, Go, Rust, HTML, CSS, JSON, Bash, SQL
- Prism.js aplica syntax highlighting en preview real-time

**CONCEPTO:** Syntax highlighting = colorear código según reglas del lenguaje. `const` en morado, strings en verde, etc. Prism.js parsea el código y aplica clases CSS.

### RF-03: Personalización de estilo
- **Tema:** Dark/Light/Monokai/Dracula (Prism themes)
- **Fuente:** JetBrains Mono, Fira Code, Source Code Pro (Google Fonts)
- **Padding:** Slider 20-60px
- **Fondo:** Color sólido (picker) o gradiente predefinido
- **Sombras:** Toggle on/off

### RF-04: Preview en tiempo real
- Mientras usuario edita, preview actualiza
- Debounce 300ms para no re-renderizar cada tecla

**CONCEPTO DIFÍCIL:** node-canvas renderiza HTML como imagen en backend. Frontend envía código + estilos → backend genera PNG → devuelve base64 o URL.

**IMPLEMENTACIÓN:** 
1. Frontend construye HTML con código + estilos inline
2. POST a `/api/generate` con HTML
3. Backend usa node-canvas para renderizar HTML a PNG
4. Guarda PNG en MongoDB (GridFS si >16MB, o como base64 en documento si <16MB)
5. Devuelve URL: `/api/snippet/:id/image`

### RF-05: Generar imagen
- Click "Generate" → POST a backend
- Backend crea PNG con node-canvas
- Guarda snippet en MongoDB: código, lenguaje, estilos, imagen (base64 o GridFS)
- Devuelve `snippetId` + URL shareable

### RF-06: URL shareable
- Ruta: `/snippet/:id`
- Muestra imagen generada + botón "Copy Link"
- Sin autenticación, público

### RF-07: Historial local (localStorage)
- Guarda últimos 10 snippets en localStorage
- Muestra lista en sidebar
- Click snippet → carga código + estilos

### RF-08: Export PNG
- Botón "Download PNG" descarga imagen
- Filename: `codesnap-{timestamp}.png`

### RF-09: Rate limiting
- Max 10 generaciones por IP cada 15 min (evitar spam)

---

## BASE DE DATOS (MongoDB)

### Collection: `snippets`

```javascript
{
  _id: ObjectId,
  snippetId: String,        // UUID único para URL
  code: String,             // Código original (max 5000 chars)
  language: String,         // js, python, etc.
  theme: String,            // dark, light, monokai, dracula
  font: String,             // JetBrains Mono, Fira Code, etc.
  padding: Number,          // 20-60
  background: String,       // hex color o gradient name
  shadow: Boolean,
  imageBase64: String,      // PNG en base64 (si <1MB)
  createdAt: Date,
  expiresAt: Date           // TTL index: borra después de 30 días
}
```

**Índices:**
- `snippetId`: unique
- `expiresAt`: TTL para auto-delete después de 30 días

---

## LIBRERÍAS EXTERNAS GRATUITAS

### Animaciones
- **Framer Motion:** Animaciones smooth para modals, previews
  ```jsx
  <motion.div initial={{opacity: 0}} animate={{opacity: 1}}>
  ```

### Iconos
- **Lucide React:** Iconos modernos, tree-shakeable
  ```jsx
  import { Copy, Download, Settings } from 'lucide-react'
  ```

### Temas Prism
- **CDN:** `https://cdnjs.cloudflare.com/ajax/libs/prism-themes/1.9.0/prism-dracula.min.css`

---

## CONCEPTOS A COMPRENDER

### FLUJOS DE DATOS (Cómo interactúan Frontend y Backend)

#### FLUJO 1: Generar Snippet
```
USUARIO → FRONTEND → BACKEND → DATABASE → BACKEND → FRONTEND → USUARIO

Paso a paso:
1. Usuario pega código en CodeEditor.jsx
2. Usuario configura estilos en StyleCustomizer.jsx
3. Usuario click "Generate Image"
4. App.jsx llama api.generateSnippet({ code, language, theme, font, padding, background, shadow })
5. Axios hace POST http://localhost:5000/api/snippets/generate con data en body
6. Backend recibe request en snippetRoutes.js
7. Pasa por rateLimiter (verifica no exceda 10 requests)
8. Pasa por validator (valida campos requeridos)
9. Llega a snippetController.generateSnippet()
10. Controller llama imageGenerator.generateImage(data)
11. imageGenerator usa node-canvas para crear PNG
12. Controller convierte PNG a base64
13. Controller guarda en MongoDB: código + estilos + imageBase64
14. MongoDB devuelve documento guardado
15. Controller responde con { snippetId, shareUrl, imageUrl }
16. Axios recibe respuesta en frontend
17. App.jsx guarda en state: generatedSnippet
18. App.jsx abre ShareModal con datos
19. Usuario ve modal con imagen y URL
```

#### FLUJO 2: Ver Snippet Compartido
```
USUARIO → FRONTEND → BACKEND → DATABASE → BACKEND → FRONTEND → USUARIO

Paso a paso:
1. Usuario accede a URL: https://codesnap.app/snippet/abc123-def456
2. React Router detecta ruta /snippet/:id
3. Componente SnippetView.jsx se monta
4. useEffect ejecuta: api.getSnippetImage('abc123-def456')
5. Construye URL: http://localhost:5000/api/snippets/abc123-def456/image
6. <img src="..." /> hace GET request automáticamente
7. Backend recibe en snippetRoutes.js
8. Llega a snippetController.getSnippetImage()
9. Controller busca en MongoDB por snippetId
10. Si existe → convierte imageBase64 a Buffer
11. Responde con Content-Type: image/png y Buffer
12. Browser recibe PNG y renderiza en <img>
13. Usuario ve imagen
```

#### FLUJO 3: Historial Local (localStorage)
```
FRONTEND → LOCALSTORAGE → FRONTEND

Paso a paso:
1. Usuario genera snippet exitosamente
2. App.jsx ejecuta después de recibir respuesta:
   - localStorage.getItem('snippets') → obtiene array JSON
   - Parsea JSON a array
   - Agrega nuevo snippet al inicio del array
   - Limita a 10 últimos (slice(0, 10))
   - localStorage.setItem('snippets', JSON.stringify(array))
3. History.jsx (sidebar) lee localStorage en useEffect:
   - localStorage.getItem('snippets')
   - Renderiza lista de snippets
4. Usuario click en snippet del historial:
   - History.jsx llama onSelectSnippet(snippet)
   - App.jsx actualiza states: code, language, theme, etc.
   - Editor y preview se actualizan con datos
```

#### FLUJO 4: Preview en Tiempo Real
```
USUARIO → FRONTEND (solo, no toca backend)

Paso a paso:
1. Usuario escribe en textarea de CodeEditor
2. onChange ejecuta → handleCodeChange(e)
3. handleCodeChange actualiza state: setCode(e.target.value)
4. React re-renderiza componentes que usan code
5. ImagePreview recibe nuevo code via props
6. useEffect en ImagePreview detecta cambio en code
7. setTimeout 300ms (debounce) → si usuario deja de escribir
8. Ejecuta Prism.highlightAll()
9. Prism encuentra <code> tags y aplica highlighting
10. Usuario ve preview actualizado con colores
```

---

### 1. node-canvas
Librería que simula Canvas API de navegador en Node.js. Permite renderizar gráficos, texto, imágenes como si estuvieras en el browser.

**Uso aquí:** Creas un canvas, escribes código con syntax highlighting como HTML, lo renderizas a PNG.

```javascript
const { createCanvas } = require('canvas');
const canvas = createCanvas(800, 600);
const ctx = canvas.getContext('2d');
// Dibujar código estilizado
const buffer = canvas.toBuffer('image/png');
```

### 2. GridFS (si imagen >16MB)
MongoDB tiene límite de 16MB por documento. GridFS divide archivos grandes en chunks.

**Decisión:** Si imagen <1MB → guarda base64 directo. Si >1MB → GridFS (raro en screenshots de código).

### 3. Rate Limiting
Limita requests por IP para evitar abuse. express-rate-limit hace esto automático.

**Ejemplo:**
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10 // max 10 requests
});
app.use('/api/generate', limiter);
```

### 4. TTL Index (Time To Live)
MongoDB borra documentos automáticamente después de X tiempo.

**Uso:** snippets se borran después de 30 días para no acumular basura.

```javascript
snippetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

---

## PROMPTS PARA TESTING (LO HARÉ YO)

### Archivo: tests/integration/snippet.test.js
**PROMPT:**
```
Genera tests de integración con Jest + Supertest para las siguientes rutas de snippetRoutes.js:

1. POST /api/snippets
   - Body: { code, language, theme, font, padding, background, shadow }
   - Debe retornar 201 + snippetId + imageUrl
   - Validar que se guarda en MongoDB
   - Validar rate limiting (11vo request debe fallar con 429)

2. GET /api/snippets/:id
   - Debe retornar 200 + snippet data
   - Debe retornar 404 si no existe

3. GET /api/snippets/:id/image
   - Debe retornar 200 + Content-Type: image/png
   - Debe retornar 404 si no existe

Usa supertest para hacer requests y MongoDB memory server para tests sin tocar DB real.
```

---

### Archivo: tests/unit/imageGenerator.test.js
**PROMPT:**
```
Genera tests unitarios con Jest para imageGenerator.js:

1. generateImage({ code, language, theme, font, padding, background, shadow })
   - Debe retornar Buffer válido de PNG
   - Debe aplicar syntax highlighting correctamente
   - Debe aplicar padding y shadow según parámetros
   - Debe manejar código vacío (retornar error)

Usa node-canvas mock si es necesario para acelerar tests.
```

---

### Archivo: frontend/tests/CodeEditor.test.jsx
**PROMPT:**
```
Genera tests con Vitest + React Testing Library para CodeEditor.jsx:

1. Debe renderizar textarea
2. Debe actualizar preview cuando usuario escribe (con debounce)
3. Debe cambiar lenguaje en dropdown
4. Debe mostrar error si código excede 5000 chars
5. Debe llamar a API cuando click "Generate"

Mock axios con vi.mock() para no hacer requests reales.
```

---

## VARIABLES DE ENTORNO

### Backend (.env.example)
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/codesnap
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW_MS=900000
```

### Frontend (.env.example)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## SCRIPTS PACKAGE.JSON

### Backend (package.json - scripts)
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint src/",
    "format": "prettier --write \"src/**/*.js\"",
    "prepare": "husky install"
  }
}
```

### Frontend (package.json - scripts)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint src/",
    "format": "prettier --write \"src/**/*.{js,jsx}\""
  }
}
```

---

## DEPLOYMENT (Opcional)

### Backend
- **Render.com** (free tier, auto-deploy desde GitHub)
- **Railway.app** (free $5 credit/mes)

### Frontend
- **Vercel** (free, auto-deploy)
- **Netlify** (free)

### Base de datos
- **MongoDB Atlas** (free tier 512MB)

---

## ROADMAP DE DESARROLLO DETALLADO

### FASE 1: SETUP INICIAL (30-45 min)

#### Actividad 1.1: Crear estructura de carpetas
```bash
mkdir codesnap
cd codesnap
mkdir backend frontend
```

#### Actividad 1.2: Inicializar backend
```bash
cd backend
npm init -y
npm install express mongoose cors dotenv express-validator winston node-canvas uuid express-rate-limit compression prismjs
npm install -D jest supertest eslint prettier husky lint-staged nodemon
```

**Crear estructura:**
```bash
mkdir -p src/{config,controllers,models,routes,middleware,utils} tests/{unit,integration}
touch src/config/{database.js,logger.js}
touch src/controllers/snippetController.js
touch src/models/Snippet.js
touch src/routes/snippetRoutes.js
touch src/middleware/{errorHandler.js,rateLimiter.js}
touch src/utils/{imageGenerator.js,validator.js}
touch src/app.js server.js
touch .env.example .eslintrc.json .prettierrc jest.config.js
```

#### Actividad 1.3: Configurar MongoDB Atlas
1. Ve a mongodb.com/cloud/atlas
2. Crear cuenta gratuita
3. Crear cluster (M0 free tier)
4. Database Access → Add User (username + password)
5. Network Access → Add IP (0.0.0.0/0 para desarrollo)
6. Conectar → Drivers → Copiar connection string
7. Pegar en backend/.env:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/codesnap
   ```

#### Actividad 1.4: Inicializar frontend
```bash
cd ../frontend
npm create vite@latest . -- --template react
npm install axios react-hot-toast framer-motion lucide-react react-colorful clipboard-copy
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Crear estructura:**
```bash
mkdir -p src/{components,services,utils} tests
touch src/components/{CodeEditor.jsx,StyleCustomizer.jsx,ImagePreview.jsx,ShareModal.jsx}
touch src/services/api.js
touch src/utils/constants.js
touch .env.example
```

---

### FASE 2: BACKEND - CONFIGURACIÓN BASE (1-2 horas)

#### Actividad 2.1: Configurar conexión MongoDB (src/config/database.js)
**Qué hacer:**
- Importar mongoose
- Crear función connectDB() que conecta a MongoDB usando MONGODB_URI
- Manejar errores de conexión
- Exportar función

#### Actividad 2.2: Configurar logger Winston (src/config/logger.js)
**Qué hacer:**
- Importar winston
- Configurar formato: timestamp + nivel + mensaje
- Crear transportes: console (dev) + file (production)
- Exportar logger

#### Actividad 2.3: Crear modelo Snippet (src/models/Snippet.js)
**Qué hacer:**
- Importar mongoose
- Definir schema con campos: snippetId, code, language, theme, font, padding, background, shadow, imageBase64, createdAt, expiresAt
- Agregar validaciones (required, maxLength, enum para theme/language)
- Crear índices: snippetId (unique), expiresAt (TTL)
- Exportar modelo

#### Actividad 2.4: Setup Express (src/app.js)
**Qué hacer:**
- Importar express, cors, compression
- Crear app = express()
- Middleware: express.json(), cors(), compression()
- Importar routes y montar en /api
- Importar errorHandler y usar al final
- Exportar app

#### Actividad 2.5: Entry point (server.js)
**Qué hacer:**
- Importar dotenv (config)
- Importar app desde app.js
- Importar connectDB desde config/database
- Conectar a DB
- Iniciar servidor en PORT
- Loggear "Server running on port X"

**En este punto deberías poder correr:**
```bash
npm run dev
# Ver: Server running on port 5000
# Ver: MongoDB connected
```

---

### FASE 3: BACKEND - GENERACIÓN DE IMÁGENES (2-3 horas)

#### Actividad 3.1: Implementar imageGenerator.js (src/utils/imageGenerator.js)
**Qué hacer:**
- Importar node-canvas y prismjs
- Crear función generateImage({ code, language, theme, font, padding, background, shadow })
- Calcular dimensiones del canvas (width según longitud de línea más larga, height según número de líneas)
- Crear canvas con createCanvas(width, height)
- Obtener context 2d
- Dibujar fondo (color o gradiente)
- Aplicar syntax highlighting a code usando Prism.highlight()
- Dibujar código con fuente seleccionada
- Aplicar padding
- Si shadow=true → agregar box-shadow effect
- Retornar canvas.toBuffer('image/png')

**NOTA DIFÍCIL:** node-canvas no renderiza HTML directamente. Tienes que dibujar texto línea por línea usando ctx.fillText(). Prism.highlight() te da HTML, debes parsearlo y extraer solo el texto + colores.

**SOLUCIÓN SIMPLE:** Usa una librería que convierta HTML a canvas, O genera SVG y conviértelo a PNG con node-canvas, O simplifica y dibuja código sin highlighting (agregar highlighting después).

**RECOMENDACIÓN:** Empieza sin highlighting, solo texto plano. Después agregas colores manualmente según language tokens.

#### Actividad 3.2: Crear validaciones (src/utils/validator.js)
**Qué hacer:**
- Exportar array de validaciones con express-validator
- Validar: code (required, max 5000), language (required, isIn array), theme (required, isIn array), font (required, isIn array), padding (isInt, min 20, max 60), background (isString), shadow (isBoolean)

---

### FASE 4: BACKEND - CONTROLLERS Y ROUTES (1-2 horas)

#### Actividad 4.1: Implementar snippetController.js
**Qué hacer:**
- Importar Snippet model, uuid, imageGenerator, logger
- Crear función `generateSnippet(req, res, next)`
  1. Validar errores (validationResult)
  2. Extraer data de req.body
  3. Generar snippetId con uuid.v4()
  4. Llamar imageGenerator.generateImage(data) → imageBuffer
  5. Convertir imageBuffer a base64
  6. Crear snippet en MongoDB con todos los datos + imageBase64
  7. Calcular expiresAt (now + 30 días)
  8. Guardar en DB
  9. Devolver res.status(201).json({ snippetId, shareUrl, imageUrl })
  10. Catch errors → next(error)

- Crear función `getSnippet(req, res, next)`
  1. Extraer id de req.params
  2. Buscar en DB por snippetId
  3. Si no existe → res.status(404).json({ error: 'Snippet not found' })
  4. Si existe → res.status(200).json(snippet sin imageBase64)

- Crear función `getSnippetImage(req, res, next)`
  1. Extraer id de req.params
  2. Buscar en DB
  3. Si no existe → 404
  4. Convertir imageBase64 a Buffer
  5. res.set('Content-Type', 'image/png')
  6. res.send(buffer)

#### Actividad 4.2: Crear routes (src/routes/snippetRoutes.js)
**Qué hacer:**
- Importar express.Router()
- Importar snippetController y validator
- Definir rutas:
  - POST /generate → [validator, rateLimiter, snippetController.generateSnippet]
  - GET /:id → snippetController.getSnippet
  - GET /:id/image → snippetController.getSnippetImage
- Exportar router

#### Actividad 4.3: Crear middleware rateLimiter (src/middleware/rateLimiter.js)
**Qué hacer:**
- Importar express-rate-limit
- Crear limiter con windowMs (15 min), max (10 requests)
- Exportar limiter

#### Actividad 4.4: Crear middleware errorHandler (src/middleware/errorHandler.js)
**Qué hacer:**
- Crear función errorHandler(err, req, res, next)
- Loggear error con winston
- Determinar statusCode (err.statusCode || 500)
- res.status(statusCode).json({ error: err.message })

#### Actividad 4.5: Conectar routes en app.js
**Qué hacer:**
- Importar snippetRoutes
- app.use('/api/snippets', snippetRoutes)
- app.use(errorHandler) al final

**En este punto deberías poder:**
```bash
# POST http://localhost:5000/api/snippets/generate
# Body: { code: "test", language: "javascript", theme: "dark", ... }
# Recibir: { snippetId, shareUrl, imageUrl }
```

---

### FASE 5: FRONTEND - COMPONENTES BASE (2-3 horas)

#### Actividad 5.1: Configurar constantes (src/utils/constants.js)
**Qué hacer:**
- Exportar LANGUAGES = ['javascript', 'python', 'java', 'go', 'rust', 'html', 'css', 'json', 'bash', 'sql']
- Exportar THEMES = ['dark', 'light', 'monokai', 'dracula']
- Exportar FONTS = ['JetBrains Mono', 'Fira Code', 'Source Code Pro']

#### Actividad 5.2: Configurar API client (src/services/api.js)
**Qué hacer:**
- Importar axios
- Crear instancia axios con baseURL = import.meta.env.VITE_API_URL
- Exportar funciones:
  - generateSnippet(data) → axios.post('/snippets/generate', data)
  - getSnippet(id) → axios.get(`/snippets/${id}`)
  - getSnippetImage(id) → retorna URL directamente (no fetch, solo construye URL)

#### Actividad 5.3: Crear CodeEditor.jsx
**Qué hacer:**
- Props: { code, language, onCodeChange, onLanguageChange, onGenerate, isGenerating }
- Render:
  - Textarea con value={code}, onChange={onCodeChange}, placeholder="Paste your code here..."
  - Select con options de LANGUAGES, value={language}, onChange={onLanguageChange}
  - Div con contador "X/5000 characters"
  - Button "Generate Image" onClick={onGenerate}, disabled={isGenerating || code.length > 5000 || !code}
- Estado local: ninguno (todo via props)

#### Actividad 5.4: Crear StyleCustomizer.jsx
**Qué hacer:**
- Props: { theme, font, padding, background, shadow, on...Change functions }
- Render:
  - Select tema (THEMES)
  - Select fuente (FONTS)
  - Input range para padding (20-60, mostrar valor actual)
  - Color picker (react-colorful) para background
  - Checkbox para shadow
- Cada control llama su respectivo onChange con nuevo valor

#### Actividad 5.5: Crear ImagePreview.jsx
**Qué hacer:**
- Props: { code, language, theme, font, padding, background, shadow }
- Render:
  - Div contenedor con background color, padding, shadow (según props)
  - Pre > Code con className={`language-${language}`}
  - Aplicar estilos inline para font family
- useEffect:
  - Cuando code o language cambian → Prism.highlightAll()
  - Importar Prism CSS desde CDN en index.html
- Debounce: usar setTimeout para actualizar preview solo si usuario deja de escribir por 300ms

#### Actividad 5.6: Crear ShareModal.jsx
**Qué hacer:**
- Props: { isOpen, onClose, snippetId, shareUrl, imageUrl }
- Render (solo si isOpen):
  - Overlay oscuro
  - Modal centrado (Framer Motion para animación)
  - Img src={imageUrl}
  - Input readonly con shareUrl
  - Button "Copy Link" → usa clipboard-copy → toast success
  - Button "Download PNG" → fetch imageUrl → download
  - Button "Create Another" → onClose
- Importar Toaster de react-hot-toast en App.jsx

---

### FASE 6: FRONTEND - APP PRINCIPAL (1-2 horas)

#### Actividad 6.1: Implementar App.jsx
**Qué hacer:**
- Estado:
  - code (string, default '')
  - language (string, default 'javascript')
  - theme, font, padding, background, shadow (defaults según diseño)
  - isGenerating (boolean, default false)
  - generatedSnippet (object o null)
  - modalOpen (boolean, default false)

- Funciones:
  - handleCodeChange(e) → setCode(e.target.value)
  - handleLanguageChange(e) → setLanguage(e.target.value)
  - handle...Change para cada estilo
  - handleGenerate() →
    1. setIsGenerating(true)
    2. Llamar api.generateSnippet({ code, language, theme, ... })
    3. Guardar respuesta en generatedSnippet
    4. setModalOpen(true)
    5. Guardar en localStorage (historial)
    6. setIsGenerating(false)
    7. Catch errors → toast.error()

- Render:
  - Header con logo
  - Grid layout: izquierda (CodeEditor + StyleCustomizer), derecha (ImagePreview)
  - ShareModal condicional

#### Actividad 6.2: Agregar Google Fonts en index.html
**Qué hacer:**
- En <head> agregar:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono&family=Fira+Code&family=Source+Code+Pro&display=swap" rel="stylesheet">
  ```

#### Actividad 6.3: Agregar Prism CSS en index.html
**Qué hacer:**
- En <head> agregar:
  ```html
  <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
  <!-- Agregar más lenguajes según LANGUAGES -->
  ```

**En este punto deberías poder:**
1. Pegar código en editor
2. Ver preview con highlighting
3. Click Generate → crear snippet
4. Ver modal con URL compartida
5. Copiar link y descargar PNG

---

### FASE 7: INTEGRACIÓN Y PULIDO (1-2 horas)

#### Actividad 7.1: Configurar CORS en backend
**Qué hacer:**
- En app.js, configurar cors:
  ```javascript
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  }))
  ```

#### Actividad 7.2: Implementar historial localStorage
**Qué hacer:**
- En App.jsx, después de generar snippet exitoso:
  - Obtener historial actual: `JSON.parse(localStorage.getItem('snippets') || '[]')`
  - Agregar nuevo snippet al inicio
  - Limitar a 10 últimos
  - Guardar: `localStorage.setItem('snippets', JSON.stringify(historial))`
- Crear componente History.jsx (opcional) que muestre lista
- Click en snippet → carga código + estilos en editor

#### Actividad 7.3: Agregar loading states
**Qué hacer:**
- En CodeEditor, mientras isGenerating → deshabilitar textarea y botón
- Mostrar spinner en botón "Generate Image"
- Usar Lucide React: `<Loader2 className="animate-spin" />`

#### Actividad 7.4: Manejo de errores
**Qué hacer:**
- Wrap cada llamada API en try-catch
- Mostrar toast.error() con mensaje descriptivo
- En backend, mejorar errorHandler para devolver mensajes claros

---

### FASE 8: TESTING (2-3 horas)

#### Actividad 8.1: Tests backend - imageGenerator.test.js
**Qué hacer:**
- Usar prompt proporcionado en documento
- Ejecutar: `npm test`

#### Actividad 8.2: Tests backend - snippet.test.js
**Qué hacer:**
- Usar prompt proporcionado
- Mockear MongoDB con mongodb-memory-server
- Ejecutar: `npm test`

#### Actividad 8.3: Tests frontend - CodeEditor.test.jsx
**Qué hacer:**
- Usar prompt proporcionado
- Ejecutar: `npm test`

---

### FASE 9: DEPLOYMENT (1-2 horas)

#### Actividad 9.1: Deploy MongoDB
**Qué hacer:**
- Ya está en Atlas (hecho en Fase 1)
- Asegurar que IP whitelist incluye IPs de Render/Vercel

#### Actividad 9.2: Deploy backend a Render
**Qué hacer:**
1. Push código a GitHub
2. Ir a render.com
3. New Web Service → Connect repo
4. Settings:
   - Build: `npm install`
   - Start: `npm start`
   - Environment: Node 18
5. Variables de entorno: copiar desde .env
6. Deploy
7. Copiar URL (ej: https://codesnap-api.onrender.com)

#### Actividad 9.3: Deploy frontend a Vercel
**Qué hacer:**
1. Push código a GitHub
2. Ir a vercel.com
3. Import Project → Connect repo (carpeta frontend)
4. Settings:
   - Framework: Vite
   - Build: `npm run build`
   - Output: `dist`
5. Variables de entorno:
   - VITE_API_URL=https://codesnap-api.onrender.com/api
6. Deploy
7. Obtener URL (ej: https://codesnap.vercel.app)

#### Actividad 9.4: Actualizar CORS en backend
**Qué hacer:**
- En .env de Render: FRONTEND_URL=https://codesnap.vercel.app
- Redeploy backend

**En este punto deberías tener app funcionando en producción.**

---

## CHECKLIST DE VALIDACIÓN

### Backend funcionando:
- [ ] Server arranca sin errores
- [ ] MongoDB conecta correctamente
- [ ] POST /api/snippets/generate crea snippet
- [ ] GET /api/snippets/:id devuelve data
- [ ] GET /api/snippets/:id/image devuelve PNG
- [ ] Rate limiting funciona (bloquea después de 10 requests)
- [ ] Logger escribe en consola/archivo

### Frontend funcionando:
- [ ] Textarea permite pegar código
- [ ] Dropdown lenguaje funciona
- [ ] Preview actualiza con highlighting
- [ ] StyleCustomizer cambia estilos en preview
- [ ] Botón Generate llama API
- [ ] Modal muestra URL + imagen
- [ ] Copy Link copia al clipboard
- [ ] Download PNG descarga archivo
- [ ] Historial guarda en localStorage

### Integración:
- [ ] Frontend conecta con backend
- [ ] CORS configurado correctamente
- [ ] Errores muestran toast
- [ ] Loading states funcionan

### Testing:
- [ ] Tests backend pasan
- [ ] Tests frontend pasan
- [ ] Coverage >70%

### Deployment:
- [ ] Backend deployed en Render
- [ ] Frontend deployed en Vercel
- [ ] MongoDB en Atlas funcionando
- [ ] URLs actualizadas en .env
- [ ] App accesible públicamente

---

## LISTA DE ACTIVIDADES (ROADMAP DETALLADO)

### FASE 1: SETUP INICIAL

#### Actividad 1.1: Crear cuenta MongoDB Atlas
- Ir a mongodb.com/cloud/atlas
- Crear cuenta gratuita
- Crear cluster (free tier M0)
- Crear database user (username + password)
- Whitelist IP (0.0.0.0/0 para desarrollo)
- Obtener connection string (formato: mongodb+srv://...)

#### Actividad 1.2: Inicializar backend
- Crear carpeta `codesnap-backend`
- Ejecutar `npm init -y`
- Instalar dependencias con comandos de sección "COMANDOS INICIALIZACIÓN"
- Crear estructura de carpetas según "ESTRUCTURA DE CARPETAS"
- Crear archivo `.env` con variables de "VARIABLES DE ENTORNO"
- Crear `.gitignore` (incluir node_modules, .env)

#### Actividad 1.3: Inicializar frontend
- Crear carpeta `codesnap-frontend` con Vite
- Instalar dependencias con comandos de sección "COMANDOS INICIALIZACIÓN"
- Crear estructura de carpetas según "ESTRUCTURA DE CARPETAS"
- Crear archivo `.env` con VITE_API_URL
- Limpiar archivos boilerplate de Vite (App.css, etc)

---

### FASE 2: BACKEND - CONFIGURACIÓN BASE

#### Actividad 2.1: Configurar conexión a MongoDB
**Archivo:** `src/config/database.js`
- Importar mongoose
- Crear función `connectDB()` que:
  - Lee MONGODB_URI desde process.env
  - Conecta a MongoDB con mongoose.connect()
  - Maneja errores de conexión
  - Exporta la función

#### Actividad 2.2: Configurar logger Winston
**Archivo:** `src/config/logger.js`
- Importar winston
- Crear logger que:
  - Log a consola en desarrollo
  - Log a archivo (error.log, combined.log) en producción
  - Formato: timestamp + level + message
  - Exportar logger

#### Actividad 2.3: Crear modelo Mongoose
**Archivo:** `src/models/Snippet.js`
- Crear schema con campos de sección "BASE DE DATOS"
- Definir validaciones:
  - code: required, max 5000 chars
  - language: required, enum con lenguajes soportados
  - snippetId: unique, required
- Agregar índices (snippetId unique, expiresAt TTL)
- Exportar modelo

#### Actividad 2.4: Setup Express app
**Archivo:** `src/app.js`
- Importar express, cors, compression
- Crear app Express
- Configurar middleware:
  - express.json() para parsear body
  - cors() con origin desde FRONTEND_URL
  - compression() para comprimir responses
- Importar y usar routes (snippetRoutes)
- Importar y usar errorHandler middleware
- Exportar app

#### Actividad 2.5: Crear entry point
**Archivo:** `server.js`
- Importar app de src/app.js
- Importar connectDB de src/config/database.js
- Importar logger de src/config/logger.js
- Conectar a DB
- Iniciar servidor en PORT desde .env
- Log confirmación de servidor corriendo

---

### FASE 3: BACKEND - LÓGICA DE NEGOCIO

#### Actividad 3.1: Crear middleware de rate limiting
**Archivo:** `src/middleware/rateLimiter.js`
- Importar express-rate-limit
- Crear limiter con:
  - windowMs: 15 min
  - max: 10 requests
  - message: "Demasiados requests, intenta en 15 min"
- Exportar limiter

#### Actividad 3.2: Crear middleware de error handling
**Archivo:** `src/middleware/errorHandler.js`
- Crear función errorHandler(err, req, res, next)
- Capturar errores de:
  - Mongoose validation errors
  - Mongoose duplicate key errors
  - Errores genéricos
- Responder con formato consistente:
  - { success: false, error: "mensaje" }
- Loggear errores con Winston
- Exportar errorHandler

#### Actividad 3.3: Crear utilidad de generación de imágenes
**Archivo:** `src/utils/imageGenerator.js`
- Importar node-canvas, prismjs
- Crear función `generateImage(options)` que:
  - Recibe: { code, language, theme, font, padding, background, shadow }
  - Crea canvas con dimensiones calculadas según código y padding
  - Aplica syntax highlighting con Prism.js
  - Dibuja fondo (color o gradiente)
  - Dibuja código con estilo aplicado
  - Aplica sombra si shadow = true
  - Retorna buffer PNG
- Exportar función

#### Actividad 3.4: Crear validaciones custom
**Archivo:** `src/utils/validator.js`
- Importar express-validator
- Crear validación para createSnippet:
  - code: string, not empty, max 5000 chars
  - language: string, enum (js, python, etc)
  - theme: string, enum (dark, light, etc)
  - font: string, enum (JetBrains Mono, etc)
  - padding: number, min 20, max 60
  - background: string, not empty
  - shadow: boolean
- Exportar array de validaciones

#### Actividad 3.5: Crear controller de snippets
**Archivo:** `src/controllers/snippetController.js`
- Importar Snippet model, imageGenerator, uuid, logger
- Crear función `createSnippet(req, res, next)`:
  - Extraer datos del body
  - Validar con express-validator
  - Generar snippetId con uuid
  - Generar imagen con imageGenerator
  - Convertir buffer a base64
  - Crear documento en MongoDB
  - Guardar con expiresAt (30 días desde ahora)
  - Responder con { success: true, snippetId, imageUrl }
  - Manejar errores con try/catch → next(error)
- Crear función `getSnippet(req, res, next)`:
  - Extraer snippetId de params
  - Buscar en MongoDB
  - Si no existe → 404
  - Si existe → responder con snippet data
- Crear función `getSnippetImage(req, res, next)`:
  - Extraer snippetId de params
  - Buscar snippet en MongoDB
  - Si no existe → 404
  - Convertir base64 a buffer
  - Responder con Content-Type: image/png y buffer
- Exportar funciones

#### Actividad 3.6: Crear routes de snippets
**Archivo:** `src/routes/snippetRoutes.js`
- Importar express.Router()
- Importar controller functions
- Importar rateLimiter
- Importar validators
- Crear rutas:
  - POST /snippets (con rateLimiter, validators, createSnippet)
  - GET /snippets/:id (getSnippet)
  - GET /snippets/:id/image (getSnippetImage)
- Exportar router

---

### FASE 4: FRONTEND - CONFIGURACIÓN BASE

#### Actividad 4.1: Configurar Axios
**Archivo:** `src/services/api.js`
- Importar axios
- Crear instancia con baseURL desde import.meta.env.VITE_API_URL
- Configurar interceptor de errores:
  - Capturar errores de red
  - Capturar 429 (rate limit) y mostrar mensaje específico
  - Capturar 404, 500, etc
- Exportar instancia

#### Actividad 4.2: Crear constantes
**Archivo:** `src/utils/constants.js`
- Exportar array LANGUAGES con: JavaScript, Python, Java, Go, Rust, HTML, CSS, JSON, Bash, SQL
- Exportar array THEMES con: dark, light, monokai, dracula
- Exportar array FONTS con: JetBrains Mono, Fira Code, Source Code Pro
- Exportar array GRADIENTS con nombres y valores CSS

---

### FASE 5: FRONTEND - COMPONENTES

#### Actividad 5.1: Crear componente CodeEditor
**Archivo:** `src/components/CodeEditor.jsx`
- Crear estado para code (string)
- Crear textarea que:
  - Muestra placeholder "Pega tu código aquí..."
  - Limita a 5000 chars
  - Muestra contador de caracteres
  - onChange actualiza estado
- Aplicar estilos básicos
- Exportar componente

#### Actividad 5.2: Crear componente StyleCustomizer
**Archivo:** `src/components/StyleCustomizer.jsx`
- Recibe props: onStyleChange (callback)
- Crear estados locales:
  - language (default: 'javascript')
  - theme (default: 'dark')
  - font (default: 'JetBrains Mono')
  - padding (default: 40)
  - background (default: '#1e1e1e')
  - shadow (default: true)
- Crear UI con:
  - Dropdown para language (usa LANGUAGES de constants)
  - Dropdown para theme (usa THEMES)
  - Dropdown para font (usa FONTS)
  - Slider para padding (20-60)
  - Color picker para background (react-colorful)
  - Toggle para shadow
- Cada cambio llama onStyleChange con todos los valores
- Exportar componente

#### Actividad 5.3: Crear componente ImagePreview
**Archivo:** `src/components/ImagePreview.jsx`
- Recibe props: code, language, theme, font, padding, background, shadow
- Importar Prism.js via CDN en index.html
- Crear div que:
  - Aplica estilos según props (padding, background, shadow)
  - Renderiza <pre><code> con código
  - Aplica syntax highlighting con Prism.js
  - Actualiza cuando props cambian (useEffect con debounce 300ms)
- Agregar Framer Motion para animación de entrada
- Exportar componente

#### Actividad 5.4: Crear componente ShareModal
**Archivo:** `src/components/ShareModal.jsx`
- Recibe props: isOpen, onClose, snippetId
- Genera URL: `${window.location.origin}/snippet/${snippetId}`
- Crear modal con:
  - Overlay oscuro (click para cerrar)
  - Card central con:
    - Título "Snippet guardado!"
    - URL readonly input
    - Botón "Copy Link" (usa clipboard-copy)
    - Botón "Close"
- Usa react-hot-toast para notificación "Link copiado!"
- Usa Framer Motion para animación modal
- Exportar componente

#### Actividad 5.5: Crear vista principal (App.jsx)
**Archivo:** `src/App.jsx`
- Crear estados:
  - code (string vacío)
  - styles (objeto con language, theme, font, padding, background, shadow)
  - isGenerating (boolean para loading)
  - snippetId (string o null)
  - showModal (boolean)
  - localHistory (array de snippets del localStorage)
- Crear función handleGenerate():
  - Validar que code no esté vacío
  - Validar que code no exceda 5000 chars
  - Setear isGenerating = true
  - POST a /api/snippets con code + styles
  - Guardar snippetId de respuesta
  - Agregar snippet a localHistory (localStorage)
  - Mostrar ShareModal
  - Setear isGenerating = false
  - Manejar errores con react-hot-toast
- Crear función handleDownload():
  - GET a /api/snippets/:id/image
  - Crear Blob con response
  - Trigger download con filename codesnap-{timestamp}.png
- Layout:
  - Header con logo "CodeSnap"
  - Sidebar con StyleCustomizer
  - Main con:
    - CodeEditor arriba
    - ImagePreview abajo
  - Footer con botón "Generate" y "Download"
  - ShareModal (cuando showModal = true)
- Cargar localHistory desde localStorage al montar (useEffect)
- Exportar componente

---

### FASE 6: FRONTEND - VISTA DE SNIPPET COMPARTIDO

#### Actividad 6.1: Crear vista de snippet compartido
**Archivo:** `src/pages/SnippetView.jsx`
- Usar react-router-dom (instalar si falta)
- Extraer snippetId de URL params
- Crear estado snippet (objeto o null)
- Crear estado loading (boolean)
- useEffect al montar:
  - GET a /api/snippets/:id
  - Guardar snippet en estado
  - Setear loading = false
  - Manejar 404 → mostrar mensaje "Snippet no encontrado"
- Mostrar:
  - Imagen del snippet
  - Botón "Copy Link"
  - Botón "Create Your Own"
- Exportar componente

#### Actividad 6.2: Configurar routing
**Archivo:** `src/main.jsx`
- Importar BrowserRouter, Routes, Route de react-router-dom
- Wrap <App /> con <BrowserRouter>
- Crear Routes:
  - / → App (editor)
  - /snippet/:id → SnippetView

---

### FASE 7: FUNCIONALIDAD DE HISTORIAL LOCAL

#### Actividad 7.1: Agregar sidebar de historial
**En:** `src/App.jsx`
- Agregar estado showHistory (boolean)
- Crear botón "History" que toggle showHistory
- Cuando showHistory = true:
  - Mostrar lista de snippets desde localHistory (últimos 10)
  - Cada item muestra: timestamp, lenguaje, preview código (primeras 2 líneas)
  - Click item → carga código y estilos en editor
- Guardar en localStorage después de cada generación:
  - Key: 'codesnap_history'
  - Value: array de max 10 objetos { code, language, theme, etc, timestamp }
  - Si array.length > 10 → remover el más viejo

---

### FASE 8: TESTING

#### Actividad 8.1: Configurar Jest para backend
**Archivo:** `jest.config.js`
- Configurar testEnvironment: 'node'
- Configurar coverageDirectory: 'coverage'
- Configurar testMatch para archivos .test.js en tests/

#### Actividad 8.2: Testing backend - imageGenerator
**Archivo:** `tests/unit/imageGenerator.test.js`
- Usar prompt de sección "PROMPTS PARA TESTING"
- Ejecutar tests con `npm test`

#### Actividad 8.3: Testing backend - integration
**Archivo:** `tests/integration/snippet.test.js`
- Usar prompt de sección "PROMPTS PARA TESTING"
- Instalar mongodb-memory-server
- Ejecutar tests con `npm test`

#### Actividad 8.4: Configurar Vitest para frontend
**Archivo:** `vite.config.js`
- Agregar configuración de Vitest
- Configurar test environment: 'jsdom'

#### Actividad 8.5: Testing frontend - CodeEditor
**Archivo:** `tests/CodeEditor.test.jsx`
- Usar prompt de sección "PROMPTS PARA TESTING"
- Ejecutar tests con `npm test`

---

### FASE 9: POLISH Y OPTIMIZACIÓN

#### Actividad 9.1: Mejorar UX con loading states
- Agregar spinner/skeleton cuando isGenerating = true
- Deshabilitar botón "Generate" mientras genera
- Mostrar progress bar (opcional)

#### Actividad 9.2: Agregar validaciones visuales
- Mostrar error si code está vacío al hacer Generate
- Mostrar error si code excede 5000 chars
- Mostrar toast de éxito al generar

#### Actividad 9.3: Mejorar responsive design
- Media queries para mobile (sidebar collapse en hamburger menu)
- Preview ajustable en mobile
- Touch-friendly controls

#### Actividad 9.4: Optimizar performance
- Lazy load Prism.js themes
- Debounce en preview (ya incluido)
- Memoizar ImagePreview con React.memo

---

### FASE 10: DEPLOYMENT

#### Actividad 10.1: Preparar backend para producción
- Crear cuenta en Render.com o Railway.app
- Conectar repo GitHub
- Configurar variables de entorno en dashboard
- Configurar start command: `node server.js`
- Deploy

#### Actividad 10.2: Preparar frontend para producción
- Crear cuenta en Vercel o Netlify
- Conectar repo GitHub
- Configurar VITE_API_URL con URL del backend deployado
- Configurar build command: `npm run build`
- Deploy

#### Actividad 10.3: Testing en producción
- Generar snippet de prueba
- Verificar que imagen se genera correctamente
- Verificar que URL shareable funciona
- Verificar rate limiting
- Verificar responsive en mobile

---

## ESTIMACIÓN DE TIEMPO POR FASE

- **FASE 1:** Setup inicial → 2-3 horas
- **FASE 2:** Backend configuración → 3-4 horas
- **FASE 3:** Backend lógica → 1-2 días (lo más complejo: imageGenerator)
- **FASE 4:** Frontend configuración → 1-2 horas
- **FASE 5:** Frontend componentes → 1-2 días
- **FASE 6:** Vista compartida + routing → 2-3 horas
- **FASE 7:** Historial local → 1-2 horas
- **FASE 8:** Testing → 1 día
- **FASE 9:** Polish → 3-4 horas
- **FASE 10:** Deployment → 1-2 horas

**Total estimado:** 6-8 días de desarrollo full-time

---

## NOTAS ADICIONALES

- node-canvas requiere dependencias del sistema (Cairo, Pango). En local instalar con: `brew install pkg-config cairo pango libpng jpeg giflib librsvg` (Mac) o `apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev` (Linux)
- En Render/Railway, node-canvas se instala automáticamente con buildpack correcto
- Prism.js tiene 200+ lenguajes. Empezar con los 10 más comunes, agregar más después
- GridFS solo si imagen >1MB (raro). Empezar con base64 en documento

---

## DUDAS COMUNES

### 1. "¿Cómo sé qué routers/endpoints crear?"
**Respuesta:** Piensa en las acciones que el usuario hace en frontend:
- Usuario genera snippet → necesitas POST endpoint
- Usuario ve snippet compartido → necesitas GET endpoint
- Usuario descarga imagen → necesitas GET endpoint que devuelva PNG

Cada acción del usuario = 1 endpoint.

---

### 2. "¿Cómo organizo los archivos en backend?"
**Respuesta:**
- **models/**: Define estructura de datos (qué guardas en DB)
- **controllers/**: Lógica de negocio (qué hacer cuando llega un request)
- **routes/**: Mapea URLs a controllers (POST /generate → snippetController.generate)
- **middleware/**: Código que se ejecuta ANTES de llegar a controller (validar, rate limit)
- **utils/**: Funciones auxiliares que usas en varios lados (generateImage, logger)
- **config/**: Configuración (database, logger setup)

---

### 3. "¿Qué componentes crear en frontend?"
**Respuesta:** Divide la UI en piezas reutilizables:
- Si una parte tiene su propia lógica (state) → componente separado
- Si se repite en varios lados → componente separado
- Si es grande y complejo → divide en subcomponentes

Para CodeSnap:
- Editor de código = CodeEditor
- Panel de estilos = StyleCustomizer
- Preview = ImagePreview
- Modal de compartir = ShareModal

---

### 4. "¿Cómo conectar frontend con backend?"
**Respuesta:**
1. Backend expone endpoints (ej: POST /api/snippets/generate)
2. Frontend usa axios para hacer HTTP requests
3. Configura baseURL en axios = URL de backend
4. Llama endpoints con axios.post(endpoint, data)
5. Backend responde con JSON
6. Frontend recibe respuesta y actualiza UI

---

### 5. "¿Qué es node-canvas y por qué no puedo usar HTML directamente?"
**Respuesta:** 
- Backend no tiene navegador, no puede renderizar HTML visualmente
- node-canvas simula Canvas API para dibujar gráficos/texto
- Debes "pintar" manualmente texto línea por línea en canvas
- No puedes hacer canvas.innerHTML = '<div>code</div>'
- Debes hacer ctx.fillText(linea, x, y) para cada línea

**Alternativa más simple:** Genera HTML en frontend, conviértelo a imagen con html2canvas (librería frontend), envía imagen al backend como base64. Pero esto requiere que la generación sea 100% en frontend.

---

### 6. "¿Por qué usar MongoDB y no SQL?"
**Respuesta:** 
- Snippets no tienen relaciones complejas (no necesitas JOINs)
- Schema flexible (fácil agregar campos nuevos)
- Guardar base64 es más simple en MongoDB (BLOB en SQL es más complejo)
- Free tier generoso en Atlas

---

### 7. "¿Qué es rate limiting y por qué lo necesito?"
**Respuesta:**
- Sin rate limit: alguien puede hacer 1000 requests por segundo y tumbar tu server
- Rate limit: máximo X requests por IP cada Y minutos
- express-rate-limit lo hace automático: después de 10 requests en 15 min → devuelve error 429
- Protege contra abuse y ataques

---

### 8. "¿Cómo funciona el TTL index en MongoDB?"
**Respuesta:**
- TTL = Time To Live
- Le dices a MongoDB: "borra este documento después de X tiempo"
- Creas índice en campo expiresAt con expireAfterSeconds: 0
- Cuando guardas documento, pones expiresAt = now + 30 días
- MongoDB revisa cada 60 segundos y borra documentos expirados
- No tienes que hacer cron jobs manualmente

---

### 9. "¿Por qué usar .env para variables de entorno?"
**Respuesta:**
- Seguridad: API keys, passwords, etc. NO deben estar en código
- Flexibilidad: misma app funciona en dev/staging/prod con diferentes valores
- .env es local, .env.example va a Git (sin valores sensibles)
- dotenv lee .env y pone valores en process.env.X

---

### 10. "¿Qué es CORS y por qué me da errores?"
**Respuesta:**
- Navegador bloquea requests de un origen (http://localhost:5173) a otro (http://localhost:5000) por seguridad
- Backend debe decir "acepto requests de X origen"
- cors() middleware hace esto
- Configuras: `cors({ origin: 'http://localhost:5173' })`
- En producción: `cors({ origin: 'https://codesnap.vercel.app' })`

---

### 11. "¿Cómo debuggeo errores?"
**Respuesta:**
**Backend:**
- console.log() en controllers/utils
- Usa logger.error() con winston (se guarda en archivo)
- Chequea terminal donde corre `npm run dev`
- Usa Postman/Thunder Client para probar endpoints directamente

**Frontend:**
- console.log() en componentes
- React DevTools (extensión Chrome) para ver state/props
- Network tab en DevTools para ver requests HTTP
- Chequea consola del navegador para errores

---

### 12. "¿Qué hago si node-canvas no instala?"
**Respuesta:**
**Mac:**
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
npm install node-canvas
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
npm install node-canvas
```

**Windows:**
- Descargar GTK+ desde: https://github.com/Automattic/node-canvas/wiki/Installation:-Windows
- O usar WSL2 y seguir pasos de Linux

**En Render/Railway:** Se instala automáticamente.

---

### 13. "¿Qué es Prism.js y cómo funciona syntax highlighting?"
**Respuesta:**
- Prism.js es librería que colorea código
- Parsea código y detecta: keywords, strings, comments, functions, etc.
- Envuelve cada token en <span> con clase CSS
- CSS tiene reglas de color por clase
- Resultado: código con colores

**Uso:**
```javascript
import Prism from 'prismjs';
const html = Prism.highlight(code, Prism.languages.javascript, 'javascript');
// html = '<span class="token keyword">const</span> x = <span class="token number">5</span>'
```

---

### 14. "¿Cómo funcionan los tests?"
**Respuesta:**
**Backend (Jest + Supertest):**
- Jest ejecuta archivos .test.js
- Supertest simula HTTP requests sin levantar servidor real
- Llamas endpoint → verificas respuesta
```javascript
const response = await request(app).post('/api/snippets/generate').send(data);
expect(response.status).toBe(201);
```

**Frontend (Vitest + React Testing Library):**
- Vitest = Jest pero para Vite
- Testing Library renderiza componentes en test
- Simulas interacciones: clicks, typing
- Verificas que UI responde correctamente
```javascript
render(<CodeEditor />);
const textarea = screen.getByPlaceholderText('Paste your code');
fireEvent.change(textarea, { target: { value: 'test' } });
expect(textarea.value).toBe('test');
```

---

### 15. "¿En qué orden implemento todo?"
**Respuesta:** Sigue el ROADMAP paso a paso. No saltes fases. Cada fase te prepara para la siguiente.

Si te atascas en algo:
1. Lee la actividad completa
2. Busca ejemplos similares en documentación oficial
3. Divide en pasos más pequeños
4. Implementa paso a paso
5. Testea cada paso antes de continuar

---

### 16. "¿Qué hago si algo no funciona?"
**Respuesta:**
1. Lee el mensaje de error completo
2. Identifica dónde ocurre (backend o frontend)
3. Chequea logs/consola
4. Verifica que todas las dependencias están instaladas
5. Verifica que .env tiene valores correctos
6. Simplifica: comenta código hasta encontrar qué línea falla
7. Busca error en Google/Stack Overflow
8. Si persiste: dame el error exacto y contexto

---
