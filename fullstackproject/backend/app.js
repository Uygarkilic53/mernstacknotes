require("dotenv").config();

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI);

const User = require("./models/user.model");
const Note = require("./models/note.model");

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 8000;

const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");
const bcrypt = require("bcrypt");

app.use(
  cors({
    origin: "http://localhost:5173", // Adjust this to your frontend URL
    credentials: true, // Allow credentials
  })
);

app.use(express.json());

app.get("/", (req, res, next) => {
  res.json({ data: "Hello" });
});

// Create account
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName) {
    return res.status(400).json({ error: "Full name is required" });
  }
  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }
  if (!password) {
    return res.status(400).json({ error: "password is required" });
  }

  const isUser = await User.findOne({ email: email });

  if (isUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    fullName,
    email,
    password: hashedPassword,
  });

  (await user.save())
    ? console.log("User created successfully")
    : console.log("Error in creating user");

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return res.json({
    error: false,
    user,
    accessToken,
    message: "User created successfully",
  });
});

// Login User
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });
  if (!password)
    return res.status(400).json({ message: "Password is required" });

  const userInfo = await User.findOne({ email: email });
  if (!userInfo) return res.status(400).json({ message: "User not found" });

  const passwordMatch = await bcrypt.compare(password, userInfo.password);
  if (!passwordMatch) {
    return res
      .status(400)
      .json({ error: true, message: "Invalid credentials" });
  }

  const accessToken = jwt.sign(
    { id: userInfo.id, email: userInfo.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({
    error: false,
    email,
    accessToken,
    message: "Login successful",
  });
});

//Get User
app.get("/get-user", authenticateToken, async (req, res) => {
  const user = req.user;

  const isUser = await User.findOne({ _id: user.id });

  if (!isUser) {
    return res.sendStatus(401);
  }

  return res.json({
    user: isUser,
    message: "User fetched successfully",
  });
});

// Add Note
app.post("/add-note", authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;
  const user = req.user; // directly assign the decoded user

  if (!title) {
    return res.status(400).json({ error: true, message: "Title is required" });
  }
  if (!content) {
    return res
      .status(400)
      .json({ error: true, message: "Content is required" });
  }

  try {
    const note = new Note({
      title,
      content,
      tags,
      userId: user.id,
    });

    await note.save();
    return res.json({
      error: false,
      message: "Note added successfully",
      note,
    });
  } catch (error) {
    console.error("Error adding note:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
});

//Edit Note
app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body;
  const user = req.user;

  if (!title && !content && !tags) {
    return res
      .status(400)
      .json({ error: true, message: "No fields to update" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user.id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned !== undefined) note.isPinned = isPinned;

    await note.save();

    return res.json({
      error: false,
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    console.error("Error updating note:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
});

//Get Notes
app.get("/get-all-notes", authenticateToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1; // default to page 1
  const limit = parseInt(req.query.limit) || 9; // default to 9 notes per page
  const skip = (page - 1) * limit;
  const user = req.user;

  try {
    const notes = await Note.find({ userId: user.id })
      .sort({ isPinned: -1, createdOn: -1 }) // pinned first, then newest
      .skip(skip)
      .limit(limit);

    const totalCount = await Note.countDocuments({ userId: user.id });

    return res.json({
      error: false,
      notes,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      message: "Notes fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
});

//Delete Note
app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const user = req.user;

  try {
    const note = await Note.findOneAndDelete({ _id: noteId, userId: user.id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }
    return res.json({
      error: false,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
});

//Update isPinned status
app.put("/update-pin-status/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { isPinned } = req.body;
  const user = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user.id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    if (isPinned !== undefined) note.isPinned = isPinned;

    await note.save();

    return res.json({
      error: false,
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    console.error("Error updating note:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
});

app.get("/search-notes", authenticateToken, async (req, res) => {
  const user = req.user;
  const { query = "", page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(page);
  const pageSize = parseInt(limit);

  const filter = {
    userId: user.id,
    ...(query.trim() !== "" && {
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
        { tags: { $regex: new RegExp(query, "i") } },
      ],
    }),
  };

  try {
    const totalNotes = await Note.countDocuments(filter);
    const notes = await Note.find(filter)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 }); // optional: sort by newest

    return res.json({
      error: false,
      notes,
      totalNotes,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalNotes / pageSize),
    });
  } catch (error) {
    console.error("Search error:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
});

app.listen(PORT)
  ? console.log(`Server is running on port ${PORT}`)
  : console.log("Error in starting server");

module.exports = app;
