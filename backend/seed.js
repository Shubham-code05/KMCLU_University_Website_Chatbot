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
        answer:
          "KMCLU fee structure is available for all courses such as BCA, B.Tech, MBA, MCA, BBA and BA.",
      },
      {
        question: "fee structure",
        answer:
          "BCA: ₹32,850/year\nB.Tech: ₹83,300/year\nBBA: ₹43,050/year\nMBA: ₹57,400/year\nMCA: ₹81,250/year\nBA: ₹12,050/year\nB.Com: ₹14,050/year",
      },
      {
        question: "all course fee",
        answer:
          "BCA: ₹32,850/year\nB.Tech: ₹83,300/year\nBBA: ₹43,050/year\nMBA Regular: ₹57,400/year\nMBA Self Finance: ₹81,250/year\nMCA: ₹81,250/year\nBA: ₹12,050 - ₹14,850/year\nB.Com: ₹14,050 - ₹30,150/year\nB.Sc Hons: ₹35,050/year\nB.Ed: ₹53,150/year\nB.Pharma: ₹84,250/year",
      },
      {
        question: "contact",
        answer:
          "You can contact KMCLU at reg@kmclu.ac.in",
      },
      {
        question: "contact number",
        answer:
          "KMCLU Contact Number: +91-551-2205577",
      },
      {
        question: "courses",
        answer:
          "KMCLU offers BA, BCA, B.Tech, MBA, MCA, BBA, B.Com and language courses.",
      },
      {
        question: "bca fee",
        answer:
          "KMCLU BCA regular course ki annual fee ₹32,850 hai.",
      },
      {
        question: "btech fee",
        answer:
          "KMCLU B.Tech ki annual fee ₹83,300 hai.",
      },
      {
        question: "mba fee",
        answer:
          "KMCLU MBA Regular ki annual fee ₹57,400 hai aur MBA Self Finance ki annual fee ₹81,250 hai.",
      },
      {
        question: "mca fee",
        answer:
          "KMCLU MCA ki annual fee ₹81,250 hai.",
      },
      {
        question: "bba fee",
        answer:
          "KMCLU BBA ki annual fee ₹43,050 hai.",
      },
      {
        question: "ba fee",
        answer:
          "KMCLU BA ki annual fee ₹12,050 se ₹14,850 ke beech hai.",
      },
      {
        question: "bcom fee",
        answer:
          "KMCLU B.Com Regular ki annual fee ₹14,050 hai aur Self Finance ki ₹30,150 hai.",
      },
      {
        question: "btech admission",
        answer:
          "B.Tech admission is based on eligibility and university process.",
      },
      {
        question: "mba admission",
        answer:
          "MBA admission details are available here.",
      },
      {
        question: "hostel",
        answer:
          "KMCLU provides hostel facilities for boys and girls.",
      },
      {
        question: "hostel fee",
        answer:
          "KMCLU hostel fee can be confirmed from the administration office. Hostel facility is available for both boys and girls.",
      },
      {
        question: "hostel available",
        answer:
          "Yes, KMCLU provides hostel facilities for boys and girls.",
      },
      {
        question: "library",
        answer:
          "The university has a central library with books, journals and digital resources.",
      },
      {
        question: "library timing",
        answer:
          "Library timing can be checked from the university website or administration office.",
      },
      {
        question: "scholarship",
        answer:
          "Scholarship details are available in the student welfare section.",
      },
      {
        question: "result",
        answer:
          "KMCLU results and notices are available in the Notice section of the official website.",
      },
      {
        question: "admit card",
        answer:
          "KMCLU admit card and exam related notices are available in the Notice section.",
      }
    ]);

    console.log("✅ Data Inserted Successfully");
    process.exit();
  })
  .catch((err) => {
    console.log("❌ Error:", err);
    process.exit();
  });