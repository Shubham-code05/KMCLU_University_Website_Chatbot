const mongoose = require("mongoose");
require("dotenv").config();

const UniversityData = require("./models/UniversityData");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");

    await UniversityData.deleteMany({});

    await UniversityData.insertMany([
      {
        question: "admission",
        answer:
          "KMCLU admission forms are available on the official university website.",
      },
      {
        question: "exam",
        answer:
          "KMCLU exam schedule is available in the Notice section of the website.",
      },
      {
        question: "fee",
        answer: "KMCLU fee structure is available in the Fee section.",
      },
      {
        question: "contact",
        answer: "You can contact KMCLU at reg@kmclu.ac.in",
      },
      {
        question: "courses",
        answer:
          "KMCLU offers BA, BCA, B.Tech, MBA, MCA and language courses.",
      },
      {
        question: "hostel",
        answer: "KMCLU provides hostel facilities for boys and girls.",
      },
      {
        question: "library",
        answer:
          "The university has a central library with books, journals and digital resources.",
      },
      {
        question: "scholarship",
        answer:
          "Scholarship details are available in the student welfare section.",
      },
    ]);

    console.log("✅ Data Inserted Successfully");
    process.exit();
  })
  .catch((err) => {
    console.log("❌ Error:", err);
    process.exit();
  });