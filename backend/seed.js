const mongoose = require("mongoose");
require("dotenv").config();

const UniversityData = require("./models/UniversityData");

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");

    await UniversityData.deleteMany({});

    await UniversityData.insertMany([
      {
        question: "admission process",
        answer:
          "KMCLU admission process me online registration, entrance exam (agar required ho) aur counseling shamil hota hai.",
      },
      {
        question: "btech admission",
        answer:
          "B.Tech admission eligibility aur university process ke basis par hota hai. Registration ke baad counseling hoti hai.",
      },
      {
        question: "mba admission",
        answer:
          "MBA admission ke liye graduation required hai. Admission process me registration aur counseling hoti hai.",
      },
      {
        question: "fee structure",
        answer:
          "KMCLU me courses ke according fee hoti hai. B.Tech, BCA, MBA, MCA, BBA jaise courses available hain.",
      },
      {
        question: "bca fee",
        answer:
          "KMCLU BCA ki annual fee approx ₹32,850 hai.",
      },
      {
        question: "btech fee",
        answer:
          "KMCLU B.Tech ki annual fee approx ₹83,300 hai.",
      },
      {
        question: "mba fee",
        answer:
          "KMCLU MBA Regular ki fee approx ₹57,400 aur Self Finance ki ₹81,250 hai.",
      },
      {
        question: "mca fee",
        answer:
          "KMCLU MCA ki annual fee approx ₹81,250 hai.",
      },
      {
        question: "bba fee",
        answer:
          "KMCLU BBA ki annual fee approx ₹43,050 hai.",
      },
      {
        question: "ba fee",
        answer:
          "KMCLU BA ki annual fee approx ₹12,050 se ₹14,850 ke beech hai.",
      },
      {
        question: "bcom fee",
        answer:
          "KMCLU B.Com Regular ₹14,050 aur Self Finance ₹30,150 ke aas paas hai.",
      },
      {
        question: "hostel facility",
        answer:
          "KMCLU me boys aur girls ke liye separate hostel available hai jisme mess, Wi-Fi, gym aur CCTV security hai.",
      },
      {
        question: "hostel fee",
        answer:
          "Hostel fee approx ₹14050 per year (new students) aur ₹13050 renewal ke liye hai.",
      },
      {
        question: "library",
        answer:
          "KMCLU me central library hai jisme books, journals aur digital resources available hain.",
      },
      {
        question: "canteen",
        answer:
          "University me hygienic aur affordable canteen facility available hai.",
      },
      {
        question: "bank",
        answer:
          "KMCLU campus me ICICI Bank available hai jo students ko banking services provide karta hai.",
      },
      {
        question: "student facility center",
        answer:
          "Student Facility Center ek central hub hai jahan academic aur personal support services milti hain.",
      },
      {
        question: "health centre",
        answer:
          "University me health centre hai jo medical aur emergency services provide karta hai.",
      },
      {
        question: "contact",
        answer:
          "KMCLU helpline number: +91-7007076127 aur email: reg@kmclu.ac.in",
      },
      {
        question: "courses",
        answer:
          "KMCLU me BA, BCA, B.Tech, MBA, MCA, BBA, B.Com aur language courses available hain.",
      },
      {
        question: "scholarship",
        answer:
          "Scholarship university aur government schemes ke through milti hai.",
      },
      {
        question: "result",
        answer:
          "KMCLU ke results aur notices university ke official portal par publish hote hain.",
      },
      {
        question: "admit card",
        answer:
          "Admit card aur exam related updates university ke notice section me milte hain.",
      }
    ]);

    console.log("✅ Data Inserted Successfully");
    process.exit();
  })
  .catch((err) => {
    console.log("❌ Error:", err.message);
    process.exit();
  });