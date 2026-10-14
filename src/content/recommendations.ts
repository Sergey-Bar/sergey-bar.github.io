/** Transcribed from the four LinkedIn screenshots supplied by Sergey.
 * Roles are the labels shown in those screenshots, not independently verified current titles.
 * For truncated recommendations, only complete visible sentences are included.
 */
export type Recommendation = {
  name: string;
  role: string;
  date: string;
  relationship: string;
  quote: string;
  excerpt?: boolean;
};

export const recommendations: readonly Recommendation[] = [
  {
    name: "Noam Tal",
    role: "ALM & DevOps Consultant | Automation & Systems Integration at Self Employed",
    date: "September 7, 2024",
    relationship: "Managed Sergey directly",
    quote: "Since we're being closed, I am pleased to write this recommendation for Sergey, who has been an integral part of our QA team. He consistently demonstrates a strong work ethic and a genuine passion for ensuring product quality. Throughout the years since I hired Sergey, he has developed the ability to prioritize what truly matters while letting minor issues take a back seat.\nIn addition, Sergey takes ownership of his work. He proactively identifies areas for process improvements and suggests practical solutions. His commitment to continuous learning ensures that he stays up to date with industry trends and best practices.",
  },
  {
    name: "Oded Levitte",
    role: "Senior Project Manager | AI & Video Analytics | QA-Grounded Delivery | Author, The Next Recognition | PMP · ISTQB · AWS",
    date: "August 29, 2024",
    relationship: "Worked on the same team",
    quote: "I've had the pleasure of working with Sergey in his capacity as QA engineer and later as QA Technical Lead. He is extremely professional, curious, and open minded. During our work together Sergey came up with several innovative ideas to be implemented in the VMS and the cameras. Sergey will be a valuable team member and leader anywhere.",
  },
  {
    name: "Ayelet Yitzhak",
    role: "Backend Engineer",
    date: "September 10, 2024",
    relationship: "Worked on the same team",
    quote: "I had the privilege of working with Sergey in his role as a QA Engineer.\nSergey is a fast learner with strong analytical skills. He mastered our complex system and its full functionality in a remarkably short time. He thoroughly investigated any task to ensure no detail was missed and consistently came up with innovative ideas to improve our product.\nI am confident that his professional expertise, dedication and creativity would make him an invaluable asset to any organization.",
  },
  {
    name: "Avia Yohai",
    role: "C# Software engineer",
    date: "September 11, 2024",
    relationship: "Worked on the same team",
    quote: "Sergey arrived to our QA team at Flir almost 3 years ago.\nSome of its most prominent character traits-\nFirst, inspiring quickness (also helped him finding bugs - as sometimes the computer couldn't keep up :))\nAnd in addition - constantly thinks outside the box, offers lots of ideas and points for improvement.\nI wish you the best of luck!",
  },
  {
    name: "Pavel Kagansky",
    role: "Senior Software Engineer at Nayax",
    date: "August 31, 2024",
    relationship: "Worked on the same team",
    quote: "I have worked with Sergey and I highly recommend him, he is one of the few great QA engineers I’ve known.\nHe has an ability to find various bugs in our products, both critical ones and the ones affecting quality of life of the product users.\nHe understands the product extremely well and knows how it can be used by our customers.",
    excerpt: true,
  },
  {
    name: "Mayan Segev",
    role: "Senior QA Engineer at FLIR Systems",
    date: "August 31, 2024",
    relationship: "Worked on the same team",
    quote: "I worked with Sergey in QA Team at Teledyne / FLIR.\nSergey is a skilled QA Engineer, fast-learner, initiative and has high ability to solve problems.\nI recommend Sergey to anyone looking for a QA Engineer to join his team.",
  },
  {
    name: "Roey Alon",
    role: "Senior Software QA Engineer | Customer Success Engineer | End-to-End Production Investigations | Root Cause Analysis | Broadcast, Embedded & Networking Systems",
    date: "August 30, 2024",
    relationship: "Worked on different teams",
    quote: "I’ve had the pleasure of working with Sergey, although we were on different teams, I can confidently say that he is an exceptional software QA engineer.\nHe consistently demonstrates a deep understanding of both the technical and functional fundamentals.\nIn addition to his technical expertise, he is a team player who is always willing to go the extra mile to help others.",
    excerpt: true,
  },
  {
    name: "Yossi Kondo",
    role: "Founder & Head of Practice @ Kondo & Co CPA | Tax Advisory, Business Tax Planning",
    date: "August 28, 2024",
    relationship: "Worked at different companies; commanding officer in the IDF reserves",
    quote: "As Sergey's commanding officer in the IDF reserves, I've had the privilege of seeing his exceptional qualities firsthand. Sergey has consistently demonstrated outstanding leadership, dedication, and problem-solving abilities under pressure. His strong work ethic and teamwork skills have made him an invaluable member of my unit.\nI highly recommend Sergey for any role he pursues—any organization would be lucky to have him.",
  },
  {
    name: "Yair Schef",
    role: "R&D Team Leader",
    date: "August 28, 2024",
    relationship: "Worked on the same team",
    quote: "Working with Sergey has been a pleasure. He is a quick learner and an efficient implementer. Sergey consistently maintains a positive attitude and brings a high level of enthusiasm to every project. His dedication and proactive approach make him an invaluable team member.",
  },
  {
    name: "Yaron Bagrish",
    role: "Head of Engineering | Leading Innovation & GenAI Initiatives | Transforming Technology",
    date: "August 27, 2024",
    relationship: "Worked on the same team",
    quote: "I had the privilege of working with Sergey at FLIR and having him in my organization.\nSergey is a talented individual who blends knowledge and energy to successfully navigate challenges.\nHe is always eager to learn, listen, and adapt.\nI would be delighted to work with him again in the future.",
  },
  {
    name: "Shay Bar",
    role: "QA Engineer at The5ers",
    date: "August 27, 2024",
    relationship: "Worked on the same team",
    quote: "Sergey is a highly experienced QA engineer with vast technical knowledge and passion to explore and solve issues.\nAlways seeing the big picture and willing to help.\nAn asset for any team.\nI would highly recommend him!",
  },
  {
    name: "Tomer Tunitsky",
    role: "Senior Product Manager at Taboola",
    date: "August 27, 2024",
    relationship: "Worked on the same team",
    quote: "I've worked closely with Sergey for 1.5 years as a QA Engineer. Sergey has a deep understanding of the product and ensures high-quality releases. He's a dedicated and detail-oriented team player, always willing to help with a positive attitude. I highly recommend Sergey for any QA role.",
  },
  {
    name: "Nir Amar",
    role: "Senior QA engineer",
    date: "August 26, 2024",
    relationship: "Worked on the same team",
    quote: "I was working with Sergey for almost 2 years at the same QA team at Teledyne-FLIR, and I really impressed by his strong technical abilities and his commitment and high work standards. In addition Sergey have a great personality that is easy to connect with which helps to make a strong team with a great atmosphere.",
  },
  {
    name: "Omer Fefer",
    role: "Technical Account Manager",
    date: "August 26, 2024",
    relationship: "Worked on the same team",
    quote: "I am pleased to recommend Sergey for the position of Quality Assurance Specialist. Sergey has been an invaluable member of our team at FLIR for the last few years, consistently demonstrating exceptional QA skills and a keen eye for detail.\n\nSergey excels in identifying and resolving issues efficiently, and their proficiency with various testing tools has greatly contributed to our project’s success.",
    excerpt: true,
  },
];
