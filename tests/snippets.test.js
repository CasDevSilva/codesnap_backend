import request from 'supertest';
import app from '../src/app.js';
import { SnippetModel } from '../src/models/Snippet.js';

describe('POST /api/snippets/generate', () => {
  const validSnippetData = {
    code: 'console.log("Hello World");',
    language: 'javascript',
    theme: 'dracula',
    font: 'JetBrains Mono',
    padding: 16,
    background: '#282a36',
    shadow: true,
    imageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  };

  test('debe crear un snippet con datos válidos', async () => {
    const response = await request(app)
      .post('/api/snippets/generate')
      .send(validSnippetData)
      .expect(201);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('snippetId');
    expect(response.body).toHaveProperty('shareUrl');
    expect(response.body).toHaveProperty('imageUrl');
    expect(response.body.code).toBe(validSnippetData.code);
    expect(response.body.language).toBe(validSnippetData.language);
    expect(response.body.theme).toBe(validSnippetData.theme);
    expect(response.body.font).toBe(validSnippetData.font);
    expect(response.body.padding).toBe(validSnippetData.padding);
    expect(response.body.background).toBe(validSnippetData.background);
    expect(response.body.shadow).toBe(validSnippetData.shadow);

    // Verificar que el snippet fue guardado en la base de datos
    const savedSnippet = await SnippetModel.findOne({ snippetId: response.body.snippetId });
    expect(savedSnippet).not.toBeNull();
    expect(savedSnippet.code).toBe(validSnippetData.code);
  });

  test('debe fallar cuando falta el campo code', async () => {
    const invalidData = { ...validSnippetData };
    delete invalidData.code;

    const response = await request(app)
      .post('/api/snippets/generate')
      .send(invalidData)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Validation Error');
    expect(response.body).toHaveProperty('message', 'code e imageBase64 son requeridos');
  });

  test('debe fallar cuando falta el campo imageBase64', async () => {
    const invalidData = { ...validSnippetData };
    delete invalidData.imageBase64;

    const response = await request(app)
      .post('/api/snippets/generate')
      .send(invalidData)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Validation Error');
    expect(response.body).toHaveProperty('message', 'code e imageBase64 son requeridos');
  });

  test('debe fallar cuando code excede 7500 caracteres', async () => {
    const invalidData = {
      ...validSnippetData,
      code: 'x'.repeat(7501)
    };

    const response = await request(app)
      .post('/api/snippets/generate')
      .send(invalidData)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Validation Error');
    expect(response.body).toHaveProperty('message', 'code excede 7500 caracteres');
  });

  test('debe crear snippet con campos opcionales vacíos', async () => {
    const minimalData = {
      code: 'console.log("Test");',
      imageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    };

    const response = await request(app)
      .post('/api/snippets/generate')
      .send(minimalData)
      .expect(201);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('snippetId');
  });
});

describe('GET /api/snippets/:id', () => {
  test('debe retornar un snippet existente', async () => {
    // Crear un snippet primero
    const snippet = await SnippetModel.create({
      snippetId: 'test-snippet-123',
      code: 'console.log("Test");',
      language: 'javascript',
      theme: 'dracula',
      font: 'Fira Code',
      padding: 16,
      background: '#282a36',
      shadow: false,
      imageBase64: 'data:image/png;base64,test',
      shareUrl: 'http://localhost:5173/snippet/test-snippet-123',
      imageUrl: 'http://localhost:3000/api/snippets/test-snippet-123/image'
    });

    const response = await request(app)
      .get(`/api/snippets/${snippet.snippetId}`)
      .expect(200);

    expect(response.body).toHaveProperty('snippetId', snippet.snippetId);
    expect(response.body).toHaveProperty('code', snippet.code);
    expect(response.body).toHaveProperty('language', snippet.language);
  });

  test('debe retornar 404 cuando el snippet no existe', async () => {
    const response = await request(app)
      .get('/api/snippets/non-existent-id')
      .expect(404);

    expect(response.body).toHaveProperty('error', 'Not Found');
    expect(response.body).toHaveProperty('message', 'Snippet no encontrado');
  });
});

describe('GET /api/snippets/:id/image', () => {
  test('debe retornar la imagen de un snippet existente', async () => {
    // Crear un snippet con imagen
    const snippet = await SnippetModel.create({
      snippetId: 'test-snippet-image-123',
      code: 'console.log("Image Test");',
      language: 'javascript',
      imageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      shareUrl: 'http://localhost:5173/snippet/test-snippet-image-123',
      imageUrl: 'http://localhost:3000/api/snippets/test-snippet-image-123/image'
    });

    const response = await request(app)
      .get(`/api/snippets/${snippet.snippetId}/image`)
      .expect(200);

    expect(response.headers['content-type']).toBe('image/png');
    expect(response.headers['cache-control']).toBe('public, max-age=31536000');
    expect(Buffer.isBuffer(response.body)).toBe(true);
  });

  test('debe retornar 404 cuando el snippet no existe', async () => {
    const response = await request(app)
      .get('/api/snippets/non-existent-image-id/image')
      .expect(404);

    expect(response.body).toHaveProperty('error', 'Not Found');
    expect(response.body).toHaveProperty('message', 'Snippet no encontrado');
  });
});
