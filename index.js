require("dotenv").config();
const cors = require("cors");
const express = require("express");
const connectDB = require("./mongodb");
const multer = require("multer");
const Book = require("./module/books.js");
const PORT = process.env.PORT || 8000;

const app = express();
connectDB();

// Add Middelware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

//Create Route
app.get("/api/books", async (req, res) => {
  try {
    const category = req.query.category;

    filter = {};

    if (category) {
      filter.category = category;
    }

    const data = await Book.find(filter);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "An erro occuerd while featching the data" });
  }
});

app.get("/api/books/:slug", async (req, res) => {
  try {
    const reqParam = req.params.slug;

    const data = await Book.find({ slug: reqParam });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "An erro occuerd while featching the data" });
  }
});
//Create the Book
app.post("/api/books", upload.single("thumbnail"), async (req, res) => {
  try {
    console.log(req.body);

    const newBook = new Book({
      title: req.body.title,
      slug: req.body.slug,
      stars: req.body.stars,
      description: req.body.description,
      category: req.body.category,
      thumbnail: req.file.filename,
    });

    await newBook.save();

    res.status(201).json({ message: "Book created successfully" });
  } catch (error) {
    res.status(500).json({ error: "An erro occuerd while Creating the data" });
  }
});

//Update the book

app.put("/api/books", upload.single("thumbnail"), async (req, res) => {
  try {
    const bookId = req.body.bookId;
    console.log("Update :" + bookId);
    const updateBook = {
      title: req.body.title,
      slug: req.body.slug,
      stars: req.body.stars,
      description: req.body.description,
      category: req.body.category,
    };
    if (req.file) {
      updateBook.thumbnail = req.file.filename;
    }

    await Book.findByIdAndUpdate(bookId, updateBook);

    res.status(201).json({ message: "Book updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while updating the book" });
  }
});

app.delete("/api/books/:id", upload.single("thumbnail"), async (req, res) => {
  try {
    const bookId = req.params.id;
    console.log("Delete :" + bookId);

    await Book.deleteOne({ _id: bookId });

    res.status(201).json(`Delete the Book ${req.body.bookId}`);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.get("/", (req, res) => {
  res.json("hello world");
});

app.get("*", (req, res) => {
  res.sendStatus("404");
});

app.listen(PORT, () => {
  console.log(`Server is running on this port: ${PORT}`);
});
