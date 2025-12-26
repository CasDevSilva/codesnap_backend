import { SnippetModel } from "../models/Snippet.js";
import { v4 as uuidv4 } from 'uuid';

export const generateSnippet = async (request, response) => {
    try {
        let mObjSnippet = request.body;
        mObjSnippet.snippetId = uuidv4();
        mObjSnippet.shareUrl = `http://localhost:5173/snippet/${mObjSnippet.snippetId}`;
        mObjSnippet.imageUrl = `http://localhost:3000/api/snippets/${mObjSnippet.snippetId}/image`;

        let mNewEntity = await SnippetModel.create(mObjSnippet);

        if (!mNewEntity) {
            return response.status(400).json({
                error: "Failed to insert",
                message: "Failed to insert"
            });
        }

        return response.status(201).json({
            ...mNewEntity._doc,
            success: true
        });
    } catch (error) {
        return response.status(500).json({ error: error.message });
    }
};

export const getSnippetById = async (request, response) => {
    try {
        let mObjEntityFinded = await SnippetModel.findOne({
            snippetId: request.params.id
        });

        if (!mObjEntityFinded) {
            return response.status(404).json({
                error: "Not row finded",
                message: "Not rows finded"
            });
        }

        return response.status(200).json(mObjEntityFinded);
    } catch (error) {
        return response.status(500).json({ error: error.message });
    }
};

export const getSnippetImage = async (request, response) => {
    try {
        const snippet = await SnippetModel.findOne(
            { snippetId: request.params.id },
            { imageBase64: 1 }
        );

        if (!snippet) {
            return response.status(404).json({
                error: "Not found",
                message: "Snippet not found"
            });
        }

        const base64Data = snippet.imageBase64.replace(/^data:image\/\w+;base64,/, '');

        const imageBuffer = Buffer.from(base64Data, 'base64');

        response.set('Content-Type', 'image/png');
        response.set('Content-Length', imageBuffer.length);

        return response.send(imageBuffer);
    } catch (error) {
        return response.status(500).json({ error: error.message });
    }
};