const { faker } = require("@faker-js/faker");
const fs = require("fs");

faker.locale = "vi";

// Update genders to use numbers: 1=Male, 2=Female
const genders = [1, 2];

const languagesPool = [
  "Vietnamese",
  "English",
  "Japanese",
  "Korean",
  "French",
  "Chinese",
];

const hobbiesPool = [
  "Photography",
  "Gaming",
  "Cooking",
  "Travel",
  "Yoga",
  "Music",
  "Reading",
  "Camping",
  "Dancing",
  "Gym",
  "Painting",
  "Vlogging",
  "Running",
  "Meditation",
];

const interestsPool = [
  "Technology",
  "Fashion",
  "Music",
  "Art",
  "AI",
  "Business",
  "Psychology",
  "Movies",
  "Food",
  "Nature",
  "Fitness",
  "Cars",
  "Design",
  "Coffee",
];

const loveLanguages = [
  "Words of Affirmation",
  "Quality Time",
  "Acts of Service",
  "Receiving Gifts",
  "Physical Touch",
];

const personalities = [
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
];

const occupations = [
  "Software Engineer",
  "Designer",
  "Marketing Specialist",
  "Photographer",
  "Teacher",
  "Doctor",
  "Content Creator",
  "Architect",
  "Chef",
  "Student",
  "Business Analyst",
  "Fitness Trainer",
];

const bios = [
  "Thích cà phê, âm nhạc và những cuộc trò chuyện sâu sắc ☕",
  "Luôn tìm kiếm năng lượng tích cực mỗi ngày ✨",
  "Yêu du lịch và khám phá những điều mới mẻ 🌍",
  "Có thể hơi hướng nội nhưng rất chân thành.",
  "Tin rằng một mối quan hệ tốt bắt đầu từ sự thấu hiểu.",
  "Thích chill cuối tuần và ăn ngon 🍜",
  "Work hard, love harder ❤️",
  "Đam mê sáng tạo và nghệ thuật 🎨",
];

const districts = [
  "Quận 1",
  "Quận 3",
  "Quận 5",
  "Quận 7",
  "Bình Thạnh",
  "Phú Nhuận",
  "Tân Bình",
  "Thủ Đức",
];

function randomItems(arr, min = 1, max = 3) {
  const count = faker.number.int({ min, max });

  return faker.helpers.shuffle(arr).slice(0, count);
}

function randomLocation() {
  return {
    lat: Number(
      faker.number.float({
        min: 10.7,
        max: 10.85,
        precision: 0.000001,
      }),
    ),
    lng: Number(
      faker.number.float({
        min: 106.6,
        max: 106.75,
        precision: 0.000001,
      }),
    ),
    name: `${faker.helpers.arrayElement(districts)}, TP. Hồ Chí Minh`,
  };
}

function generateUser(index) {
  const gender = faker.helpers.arrayElement(genders);

  const firstName =
    gender === 1
      ? faker.person.firstName("male")
      : faker.person.firstName("female");

  const lastName = faker.person.lastName();

  const username = `${firstName}${lastName}${index}`
    .toLowerCase()
    .replace(/\s/g, "");

  const displayName = `${lastName} ${firstName}`;

  return {
    account: {
      username,
      email: `${username}@example.com`,
      password: "Password123",
      role: "Client",
    },

    profile: {
      displayName,

      dob: faker.date
        .birthdate({
          min: 18,
          max: 32,
          mode: "age",
        })
        .toISOString(),

      gender, // Now a number (1 or 2)
      
      // Add lookingFor: 1=Male, 2=Female, 3=Everyone
      lookingFor: 3, 

      languages: randomItems(languagesPool, 1, 3),

      bio: faker.helpers.arrayElement(bios),

      education: faker.helpers.arrayElement([
        "Đại học Bách Khoa",
        "Đại học Kinh tế",
        "Đại học RMIT",
        "Đại học Kiến trúc",
        "Đại học Văn Lang",
        "Đại học KHXH&NV",
      ]),

      occupation: faker.helpers.arrayElement(occupations),

      drinking: faker.helpers.arrayElement([
        "Never",
        "Socially",
        "Occasionally",
      ]),

      smoking: faker.helpers.arrayElement(["Never", "Occasionally"]),

      socialLevel: faker.helpers.arrayElement([
        "Introvert",
        "Ambivert",
        "Extrovert",
      ]),

      personalityType: faker.helpers.arrayElement(personalities),

      loveLanguage: randomItems(loveLanguages, 1, 2),

      hobbies: randomItems(hobbiesPool, 2, 4),

      interests: randomItems(interestsPool, 2, 4),

      freeTimePrefer: randomItems(
        [
          "Cafe",
          "Movie",
          "Beach",
          "Shopping",
          "Gym",
          "Concert",
          "Library",
          "Camping",
          "Road Trip",
          "Bar",
        ],
        1,
        3,
      ),

      dateStyle: randomItems(
        [
          "Romantic Dinner",
          "Coffee Date",
          "Movie Night",
          "Camping",
          "Road Trip",
          "Fine Dining",
          "Street Food Tour",
          "Museum Visit",
        ],
        1,
        2,
      ),

      location: randomLocation(),

      photos: [
        `https://images.unsplash.com/photo-${gender === 1 ? '1500648767791-00dcc994a43e' : '1494790108377-be9c29b29330'}?auto=format&fit=crop&w=600&q=80&seed=${username}1`,
        `https://images.unsplash.com/photo-${gender === 1 ? '1506794778202-cad84cf45f1d' : '1534528741775-53994a69daeb'}?auto=format&fit=crop&w=600&q=80&seed=${username}2`,
        `https://images.unsplash.com/photo-${gender === 1 ? '1507003211169-0a1dd7228f2d' : '1524504388940-b1c1722653e1'}?auto=format&fit=crop&w=600&q=80&seed=${username}3`,
      ],
    },
  };
}

const users = [];

for (let i = 1; i <= 1000; i++) {
  users.push(generateUser(i));
}

fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

console.log("Generated 1000 users with INT genders (1=Male, 2=Female)");
