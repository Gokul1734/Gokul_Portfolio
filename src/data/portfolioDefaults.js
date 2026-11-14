import resume from "../assets/Gokulpriyan-Resume.pdf";
import heroImage from "../assets/backdrop.jpg";
import Arbitrage from "../assets/Arbitrage.png";
import BlockBorrow from "../assets/BlockBorrow.png";
import Eco from "../assets/Eco.png";
import Figma from "../assets/figma.png";
import Android from "../assets/android.png";
import Autocad from "../assets/autocad.png";
import Blender from "../assets/blender.png";
import Expo from "../assets/expo.png";
import Express from "../assets/express.png";
import Firebase from "../assets/firebase.png";
import Logistics from "../assets/Logistics.png";
import Mongo from "../assets/mongo.png";
import MovieRecommendation from "../assets/MovieRecommendation.png";
import Node from "../assets/node.png";
import Pandas from "../assets/pandas.png";
import Parq from "../assets/Parq.png";
import Python from "../assets/python.png";
import ReactIcon from "../assets/react.png";
import Gamer from "../assets/gamer.jpg";

export const DEFAULT_PORTFOLIO = {
  hero: {
    name: "Gokulpriyan Karthikeyan",
    eyebrow: "SOFTWARE DEVELOPER · CHENNAI, INDIA",
    intro:
      "I build responsive, user-focused web and mobile applications, blending thoughtful design with reliable engineering.",
    image: heroImage,
  },
  sectionTitles: {
    skills: "SKILLS",
    projects: "PROJECTS",
    education: "EDUCATION AND EXPERIENCE",
    contact: "CONTACT",
  },
  links: {
    contactEmail: "kgokulpriyan@gmail.com",
    resume,
    certificates:
      "https://drive.google.com/drive/folders/1JZ_5bxCKXfsbHlhnaMqSpUTdOLnyw3Yv?usp=drive_link",
    social: {
      x: "https://x.com/kgokulpriyan1",
      instagram: "https://www.instagram.com/Gokulpriyan_Karthikeyan/",
      github: "https://github.com/Gokul1734",
      linkedin:
        "https://www.linkedin.com/in/gokulpriyan-karthikeyan-078652200/",
    },
  },
  testimonial:
    "I am a Computer Science and Engineering graduate from SRM University with expertise in JavaScript, Tailwind CSS, Firebase, and Python. I specialize in creating responsive, user-centric web and application solutions, blending functionality with aesthetics to deliver impactful results and exceed expectations in web development and data analytics.",
  skills: [
    { name: "MongoDB", image: Mongo },
    { name: "Express", image: Express },
    { name: "React", image: ReactIcon },
    { name: "NodeJs", image: Node },
    { name: "Python", image: Python },
    { name: "Autocad", image: Autocad },
    { name: "Figma", image: Figma },
    { name: "Pandas", image: Pandas },
    { name: "Android", image: Android },
    { name: "Expo", image: Expo },
    { name: "Firebase", image: Firebase },
    { name: "Blender", image: Blender },
  ],
  proficiency: [
    { label: "HTML • CSS", value: 90 },
    { label: "REACT JS", value: 90 },
    { label: "MICROSOFT DATA TOOLS", value: 70 },
    { label: "DATABASE • MYSQL • FIREBASE", value: 80 },
    { label: "MACHINE LEARNING", value: 90 },
    { label: "AI • PROMPT", value: 90 },
    { label: "PYTHON", value: 90 },
    { label: "JAVA • C# • C++", value: 75 },
    { label: "GITHUB", value: 90 },
    { label: "VERCEL", value: 90 },
    { label: "BLENDER", value: 60 },
    { label: "AUTOCAD", value: 50 },
    { label: "REACT NATIVE", value: 75 },
    { label: "FLUTTER", value: 70 },
  ],
  marquee: ["SERVER", "WEBFLOW", "FULLSTACK", "DATABASE"],
  projects: [
    {
      id: "supply-chain-logistics",
      title: "Supply Chain Logistics",
      description: "Supply Chain Management Web Application",
      image: Logistics,
      technologies: ["js", "mongo", "react", "firebase"],
      liveUrl: "https://logistics-ruby.vercel.app/login",
      sourceUrl: "https://github.com/Gokul1734/Logistics",
      showGames: false,
    },
    {
      id: "parq",
      title: "PARQ",
      description: "Online Parking Slot Booking Applicaiton",
      image: Parq,
      technologies: ["native", "firebase", "react", "css"],
      liveUrl: "",
      sourceUrl: "https://github.com/Gokul1734/Parq",
      showGames: false,
    },
    {
      id: "movie-recommendation",
      title: "Movie Recommadation",
      description: "Movie Review Application with Advanced UI",
      image: MovieRecommendation,
      technologies: ["expo", "html", "react", "css"],
      liveUrl: "",
      sourceUrl:
        "https://github.com/Gokul1734/Movie-Review-React-Application",
      showGames: false,
    },
    {
      id: "javascript-games",
      title: "Javascript Games",
      description: "Various Interactive Mini Games",
      image: Gamer,
      technologies: ["js", "html", "css", "tw"],
      liveUrl: "",
      sourceUrl: "https://github.com/stars/Gokul1734/lists/games",
      showGames: true,
    },
    {
      id: "bio-heritage",
      title: "Bio-Heritage",
      description:
        "Blockchain Project providing Eco reward NFT's for Social Services",
      image: Eco,
      technologies: ["blockchain", "firebase", "react", "html"],
      liveUrl:
        "https://bio-heritage-iw348r9ne-adribvs-projects.vercel.app/#/",
      sourceUrl: "https://github.com/Gokul1734/Bio-Heritage-BHT",
      showGames: false,
    },
    {
      id: "arbitrage",
      title: "Arbitrage",
      description: "A peer to peer Lending Blockchain Web Application",
      image: Arbitrage,
      technologies: ["js", "html", "css", "firebase"],
      liveUrl: "https://arbitragedev.netlify.app",
      sourceUrl: "https://github.com/Gokul1734/Arbitrage",
      showGames: false,
    },
    {
      id: "block-borrow",
      title: "Block-Borrow WEB3",
      description: "A peer to peer Lending Blockchain Web Application",
      image: BlockBorrow,
      technologies: ["blockchain", "tw", "react", "firebase"],
      liveUrl: "",
      sourceUrl: "https://github.com/Gokul1734/goFlow",
      showGames: false,
    },
  ],
  education: {
    internship:
      "Since 2025, I’ve interned at Technobite and worked as a freelance app developer, gaining hands-on experience in building scalable applications. Daily Scrum calls improved my agile collaboration and communication skills, while working with professionals sharpened my technical abilities and helped me deliver impactful, user-focused solutions efficiently.",
    university: {
      title: "SRM University",
      cgpa: "9.44",
      highlights: [
        "Developed a strong foundation in Technology",
        "Learned Web Development and Designing",
        "Explored Problem Solving and Data Analytics",
      ],
    },
    school: {
      title: "DAV School",
      twelfth: "88%",
      tenth: "89%",
      highlights: [
        "Understanding Basic Science Concepts",
        "Gained Complex Mathematical Knowledge",
        "Understanding Computer Languages",
      ],
    },
    profile: {
      name: "Gokulpriyan Karthikeyan",
      birthDate: "17/03/2004",
      phone: "7010871355",
      languages: "Tamil, English",
      email: "kgokulpriyan@gmail.com",
      gender: "Male",
      location: "Chennai, India",
    },
  },
};

export const copyPortfolio = (content = DEFAULT_PORTFOLIO) =>
  structuredClone(content);

export const normalizePortfolioForStorage = (content) => {
  const saved = copyPortfolio(content);

  if (saved.hero.image === DEFAULT_PORTFOLIO.hero.image) {
    delete saved.hero.image;
  }
  if (saved.links.resume === DEFAULT_PORTFOLIO.links.resume) {
    delete saved.links.resume;
  }

  saved.skills.forEach((skill) => {
    const defaultSkill = DEFAULT_PORTFOLIO.skills.find(
      (item) => item.name === skill.name
    );
    if (skill.image === defaultSkill?.image) {
      delete skill.image;
    }
  });

  saved.projects.forEach((project) => {
    const defaultProject = DEFAULT_PORTFOLIO.projects.find(
      (item) => item.id === project.id
    );
    if (project.image === defaultProject?.image) {
      delete project.image;
    }
  });

  return saved;
};

export const mergePortfolio = (remote) => {
  if (!remote || typeof remote !== "object" || Array.isArray(remote)) {
    throw new TypeError("Portfolio data must be an object.");
  }

  const base = copyPortfolio();
  return {
    ...base,
    ...remote,
    hero: { ...base.hero, ...remote.hero },
    sectionTitles: { ...base.sectionTitles, ...remote.sectionTitles },
    links: {
      ...base.links,
      ...remote.links,
      social: { ...base.links.social, ...remote.links?.social },
    },
    education: {
      ...base.education,
      ...remote.education,
      university: {
        ...base.education.university,
        ...remote.education?.university,
      },
      school: { ...base.education.school, ...remote.education?.school },
      profile: { ...base.education.profile, ...remote.education?.profile },
    },
    skills: Array.isArray(remote.skills)
      ? remote.skills.map((skill) => {
          const defaultSkill = base.skills.find(
            (item) => item.name === skill.name
          );
          return { ...defaultSkill, ...skill };
        })
      : base.skills,
    proficiency: Array.isArray(remote.proficiency)
      ? remote.proficiency
      : base.proficiency,
    marquee: Array.isArray(remote.marquee) ? remote.marquee : base.marquee,
    projects: Array.isArray(remote.projects)
      ? remote.projects.map((project, index) => {
          const defaultProject =
            base.projects.find((item) => item.id === project.id) ||
            base.projects[index];
          return { ...defaultProject, ...project };
        })
      : base.projects,
  };
};
