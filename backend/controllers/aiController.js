const Document = require("../models/Document");
const AIResult = require("../models/AIResult");
const {
  summarizeContent,
  generateQuiz,
  explainSimply,
  chatWithContent,
} = require("../services/openaiService");

const createDocument = async (userId, content) =>
  Document.create({
    userId,
    content,
  });

const updateAIResult = async (documentId, payload) =>
  AIResult.findOneAndUpdate(
    { documentId },
    { $set: payload },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

const summary = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    const doc = await createDocument(req.user._id, content);
    const result = await summarizeContent(content);
    await updateAIResult(doc._id, { summary: result });

    return res.status(200).json({ documentId: doc._id, summary: result });
  } catch (error) {
    return next(error);
  }
};

const quiz = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    const doc = await createDocument(req.user._id, content);
    const result = await generateQuiz(content);
    await updateAIResult(doc._id, { quiz: result });

    return res.status(200).json({ documentId: doc._id, quiz: result });
  } catch (error) {
    return next(error);
  }
};

const explain = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    const doc = await createDocument(req.user._id, content);
    const result = await explainSimply(content);
    await updateAIResult(doc._id, { explanation: result });

    return res.status(200).json({ documentId: doc._id, explanation: result });
  } catch (error) {
    return next(error);
  }
};

const chat = async (req, res, next) => {
  try {
    const { content, question } = req.body;
    if (!content?.trim() || !question?.trim()) {
      return res.status(400).json({ message: "Content and question are required" });
    }

    const doc = await createDocument(req.user._id, content);
    const answer = await chatWithContent(content, question);

    return res.status(200).json({
      documentId: doc._id,
      answer,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  summary,
  quiz,
  explain,
  chat,
};
