// hashPasswords.js
const bcrypt = require("bcryptjs");

const saltRounds = 10;
const subjectPasswords = {
  Math: "matthew123",
  Physics: "philip123",
  Chemistry: "charlie123",
  Biology: "bob123",
  History: "henry123",
  Geography: "george123",
  Literature: "lily123",
  SAT: "saturday123",
  // Add all your subjects here
};

async function hashAndLog() {
  for (const [subject, plainPassword] of Object.entries(subjectPasswords)) {
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    console.log(`Subject: ${subject}, Hashed Password: ${hashedPassword}`);
  }
}

hashAndLog();
