export type Article = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  content: string[];
};

export const articles: Record<string, Article> = {
  "ai-agents": {
    slug: "ai-agents",
    category: "AI",
    title: "The next wave of AI is moving from chatbots to intelligent agents",
    excerpt:
      "A look at how AI systems are evolving from answering questions to completing multi-step tasks.",
    author: "TechHunt Editorial",
    date: "September 22, 2026",
    readTime: "5 min read",
    content: [
      "Artificial intelligence is moving beyond simple question-and-answer systems. A growing class of AI applications is designed to perform multiple steps toward a specific goal.",
      "These systems are commonly described as AI agents. Instead of only generating a response, an agent can reason about a task, use software tools, retrieve information and continue working through several steps.",
      "This shift could change how people interact with software. Rather than opening several applications and manually completing each step, users may increasingly describe the outcome they want and allow software to handle parts of the workflow.",
      "The development of reliable agents still presents significant technical challenges. Systems need to handle errors, understand context, protect sensitive information and operate within clearly defined permissions.",
      "For businesses and developers, the coming phase of AI will therefore involve not only better models but also better tools, interfaces and safety mechanisms around those models.",
    ],
  },

  "india-tech": {
    slug: "india-tech",
    category: "India Tech",
    title: "India's technology ecosystem enters a new phase of rapid innovation",
    excerpt:
      "From deep tech to digital infrastructure, India's technology landscape continues to expand.",
    author: "TechHunt Editorial",
    date: "September 22, 2026",
    readTime: "4 min read",
    content: [
      "India's technology ecosystem has expanded significantly across software, digital infrastructure, semiconductor initiatives, artificial intelligence and deep technology.",
      "The country's large digital user base has created an environment where new technology products can be tested and adopted at significant scale.",
      "Alongside software companies, a growing number of startups are working on areas such as robotics, semiconductor technology, climate technology and scientific computing.",
      "Government infrastructure and private investment are also contributing to the development of new technology capabilities across the country.",
      "The next phase of India's technology growth will depend on research, engineering talent, infrastructure and the ability of companies to turn technical ideas into scalable products.",
    ],
  },

  "smart-devices": {
    slug: "smart-devices",
    category: "Gadgets",
    title: "What to expect from the next generation of smart devices",
    excerpt:
      "New hardware trends are pushing devices toward more local AI, better batteries and smarter interfaces.",
    author: "TechHunt Editorial",
    date: "September 22, 2026",
    readTime: "4 min read",
    content: [
      "Smartphones, laptops and other consumer devices are increasingly being designed around on-device intelligence.",
      "Running more AI workloads locally can reduce dependence on cloud services and can also improve response times for certain applications.",
      "Battery efficiency remains an important engineering challenge as processors become more capable and AI workloads become more common.",
      "Hardware manufacturers are also experimenting with new interaction methods, including improved cameras, sensors and context-aware software.",
      "The result could be a generation of devices where AI becomes a background capability rather than a separate application.",
    ],
  },

  "ai-cybersecurity": {
    slug: "ai-cybersecurity",
    category: "Cybersecurity",
    title: "Why security is becoming an AI-era priority for every organization",
    excerpt:
      "The growing use of AI is changing both the threat landscape and the way teams defend systems.",
    author: "TechHunt Editorial",
    date: "September 22, 2026",
    readTime: "4 min read",
    content: [
      "Artificial intelligence is becoming part of everyday software infrastructure, creating new opportunities as well as new security considerations.",
      "Organizations need to consider how AI systems access data, use external tools and interact with internal applications.",
      "Security teams are also exploring AI-assisted approaches for detecting suspicious activity and analyzing large volumes of security information.",
      "At the same time, organizations must protect AI systems from unauthorized access, data leakage and manipulation.",
      "As AI adoption increases, security practices will need to evolve alongside the technology itself.",
    ],
  },

  "deep-tech-startups": {
    slug: "deep-tech-startups",
    category: "Startups",
    title: "Deep-tech startups are tackling problems beyond the smartphone screen",
    excerpt:
      "A new generation of founders is building products around robotics, energy, chips and scientific computing.",
    author: "TechHunt Editorial",
    date: "September 22, 2026",
    readTime: "4 min read",
    content: [
      "Deep-tech startups are increasingly working on technologies that require substantial engineering and scientific expertise.",
      "Areas such as robotics, semiconductor design, advanced materials, energy systems and scientific computing are attracting entrepreneurs and investors.",
      "Unlike many software startups, deep-tech companies often require longer development cycles and specialized infrastructure.",
      "Successful commercialization can nevertheless create products with applications across multiple industries.",
      "The growth of deep-tech companies is also increasing demand for engineers and researchers who can work across scientific and technological disciplines.",
    ],
  },

  "future-of-computing": {
    slug: "future-of-computing",
    category: "Research",
    title: "Researchers are exploring new ways to make computing more efficient",
    excerpt:
      "Energy efficiency is becoming one of the defining challenges for next-generation computing.",
    author: "TechHunt Editorial",
    date: "September 22, 2026",
    readTime: "4 min read",
    content: [
      "Computing systems are becoming increasingly powerful, but that progress also creates challenges related to energy consumption and thermal management.",
      "Researchers are investigating new architectures, materials and algorithms that could improve computational efficiency.",
      "Specialized hardware is another important area of research, particularly for artificial intelligence and scientific workloads.",
      "Improving efficiency will require progress at multiple levels, from semiconductor technology to software optimization.",
      "These developments could shape the design of future data centers, personal computers and specialized computing systems.",
    ],
  },
};