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
          "KMCLU admission forms are available on the official university website. 🔗 Admission Link: https://www.kmclu.ac.in/admission/",
      },
      {
        question: "exam",
        answer:
          "KMCLU exam schedule is available in the Notice section of the website. 🔗 Notice Link: https://www.kmclu.ac.in/notice/",
      },
      {
        question: "fee",
        answer:
          "KMCLU fee structure is available in the Fee section. 🔗 Fee Link: https://www.kmclu.ac.in/",
      },
      {
        question: "contact",
        answer:
          "You can contact KMCLU at reg@kmclu.ac.in 🔗 Contact Link: https://www.kmclu.ac.in/contact-us/",
      },
      {
        question: "contact number",
        answer:
          "KMCLU Contact Number: +91-551-2205577 📞",
      },
      {
        question: "courses",
        answer:
          "KMCLU offers BA, BCA, B.Tech, MBA, MCA and language courses. 🔗 Courses Link: https://www.kmclu.ac.in/courses/",
      },
      {
        question: "bca fee",
        answer:
          "BCA fee details are available on the KMCLU courses page. 🔗 Courses Link: https://www.kmclu.ac.in/courses/",
      },
      {
        question: "mba fee",
        answer:
          "MBA fee details are available from the KMCLU courses page. 🔗 Courses Link: https://www.kmclu.ac.in/courses/",
      },
      {
        question: "mca fee",
        answer:
          "MCA fee details are available on the KMCLU courses page. 🔗 Courses Link: https://www.kmclu.ac.in/courses/",
      },
      {
        question: "btech admission",
        answer:
          "B.Tech admission is based on eligibility and university process. 🔗 Admission Link: https://www.kmclu.ac.in/admission/",
      },
      {
        question: "mba admission",
        answer:
          "MBA admission details are available here. 🔗 Admission Link: https://www.kmclu.ac.in/admission/",
      },
      {
        question: "hostel",
        answer:
          "KMCLU provides hostel facilities for boys and girls. 🔗 University Link: https://www.kmclu.ac.in/",
      },
      {
        question: "hostel fee",
        answer:
          "KMCLU provides hostel facilities for boys and girls. Hostel fee can be confirmed from the administration office. 🔗 University Link: https://www.kmclu.ac.in/",
      },
      {
        question: "hostel available",
        answer:
          "Yes, KMCLU provides hostel facilities for boys and girls. 🔗 University Link: https://www.kmclu.ac.in/",
      },
      {
        question: "library",
        answer:
          "The university has a central library with books, journals and digital resources. 🔗 University Link: https://www.kmclu.ac.in/",
      },
      {
        question: "library timing",
        answer:
          "Library timing can be checked from the university website. 🔗 University Link: https://www.kmclu.ac.in/",
      },
      {
        question: "scholarship",
        answer:
          "Scholarship details are available in the student welfare section. 🔗 University Link: https://www.kmclu.ac.in/",
      },
      {
        question: "result",
        answer:
          "KMCLU results and notices are available in the Notice section of the official website. 🔗 Notice Link: https://www.kmclu.ac.in/notice/",
      },
      {
        question: "admit card",
        answer:
          "KMCLU admit card and exam related notices are available in the Notice section. 🔗 Notice Link: https://www.kmclu.ac.in/notice/",
      }
    ]);

    console.log("✅ Data Inserted Successfully");
    process.exit();
  })
  .catch((err) => {
    console.log("❌ Error:", err);
    process.exit();
  });