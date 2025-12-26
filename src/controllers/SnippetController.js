import { SnippetModel } from "../models/Snippet.js";
import { v4 as uuidv4 } from 'uuid';

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

export const generateSnippet = async (request, response, next) => {
    try {
        const { code, language, theme, font, padding, background, shadow, imageBase64 } = request.body;

        // Validación básica
        if (!code || !imageBase64) {
            return response.status(400).json({
                error: "Validation Error",
                message: "code e imageBase64 son requeridos"
            });
        }

        if (code.length > 7500) {
            return response.status(400).json({
                error: "Validation Error",
                message: "code excede 7500 caracteres"
            });
        }

        const snippetId = uuidv4();

        const mNewEntity = await SnippetModel.create({
            snippetId,
            code,
            language,
            theme,
            font,
            padding,
            background,
            shadow,
            imageBase64,
            shareUrl: `${FRONTEND_URL}/snippet/${snippetId}`,
            imageUrl: `${BACKEND_URL}/api/snippets/${snippetId}/image`
        });

        return response.status(201).json({
            success: true,
            snippetId: mNewEntity.snippetId,
            shareUrl: mNewEntity.shareUrl,
            imageUrl: mNewEntity.imageUrl,
            code: mNewEntity.code,
            language: mNewEntity.language,
            theme: mNewEntity.theme,
            font: mNewEntity.font,
            padding: mNewEntity.padding,
            background: mNewEntity.background,
            shadow: mNewEntity.shadow,
            imageBase64: mNewEntity.imageBase64
        });
    } catch (error) {
        next(error);
    }
};

export const getSnippetById = async (request, response, next) => {
    try {
        const snippet = await SnippetModel.findOne({
            snippetId: request.params.id
        });

        if (!snippet) {
            return response.status(404).json({
                error: "Not Found",
                message: "Snippet no encontrado"
            });
        }

        return response.status(200).json(snippet);
    } catch (error) {
        next(error);
    }
};

export const getSnippetImage = async (request, response, next) => {
    try {
        const snippet = await SnippetModel.findOne(
            { snippetId: request.params.id },
            { imageBase64: 1 }
        );

        if (!snippet) {
            return response.status(404).json({
                error: "Not Found",
                message: "Snippet no encontrado"
            });
        }

        const base64Data = snippet.imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        response.set('Content-Type', 'image/png');
        response.set('Content-Length', imageBuffer.length);
        response.set('Cache-Control', 'public, max-age=31536000'); // Cache 1 año

        return response.send(imageBuffer);
    } catch (error) {
        next(error);
    }
};