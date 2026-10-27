export interface ProjectImage {
  src: string;
  alt: string;
  /** Portrait images are shown narrower so a row of them fits. */
  orientation: "portrait" | "landscape";
}

export interface ProjectSection {
  heading: string;
  body: string;
  /** Optional short list rendered under the body (e.g. metrics RowTech measures). */
  list?: string[];
}

export interface Project {
  slug: string;
  number: string;
  title: string;
  /** Shown in small type after the title, e.g. "Haptic Belt". */
  subtitle?: string;
  category: string;
  years: string;
  role: string;
  /** Short status chip shown in the project list. */
  status: string;
  /** One-sentence description shown in the project list. */
  summary: string;
  tags: string[];
  href?: string;
  images: ProjectImage[];
  specs: { label: string; value: string }[];
  sections: ProjectSection[];
}

export const projects: Project[] = [
  {
    slug: "hapbe",
    number: "01",
    title: "HapBe",
    subtitle: "Haptic Belt",
    category: "Assistive technology",
    years: "2024–present",
    role: "Inventor and lead engineer",
    status: "Paused at prototype 7",
    summary:
      "An alternative solution to give individuals with complete hearing loss a sense of direction through haptic (vibration) feedback.",
    tags: ["ESP32-S3", "MEMS mics", "I2S", "Arduino", "3D printing"],
    href: "https://hapbe.net",
    images: [
      {
        src: "/projects/hapbe-1.webp",
        alt: "CAD render of the HapBe 5 module: a purple lid stamped HB5 above its grey base",
        orientation: "landscape",
      },
    ],
    specs: [
      { label: "Sensing / input", value: "5 MEMS microphones located around the user's waist" },
      { label: "Compute", value: "ESP32-S3" },
      { label: "Interfaces", value: "I2S" },
      {
        label: "Output / display",
        value:
          "No display, only a small battery indicator on the top of the device facing the user. A web app is accessible by logging into the device from the user's phone.",
      },
      {
        label: "Power",
        value:
          "2000 mAh Li-ion battery. Charges via a magnetic connector similar to older MacBook generations.",
      },
      { label: "Fabrication", value: "~200 prototypes printed at home on my Bambu Lab P1S" },
      { label: "Software", value: "Arduino" },
      {
        label: "Constraints",
        value:
          "The cost to research, create, and test prototypes. A micro-grant from John Carroll University helped, but it was not enough to develop the project a substantial amount.",
      },
      {
        label: "Status",
        value:
          "Prototype 7 is paused while I wait for more capital. I put away a portion of my lunch money and gas money every week to afford the parts to build and test prototypes.",
      },
    ],
    sections: [
      {
        heading: "The problem",
        body:
          "I came up with the idea in 2024 after an interaction with a deaf person inside of a Walmart near my house, and realized that current solutions to total hearing loss, such as cochlear implants, were extremely expensive, laborious, and not applicable to all individuals.",
      },
      {
        heading: "How it works",
        body:
          "5 MEMS microphones located around the user's waist listen to the noise levels around the user at all times. When a microphone reads a sudden rise in decibel level, such as a call for help, a baby crying, or another situation where the user needs to understand where the sound is coming from, a vibration motor positioned behind that microphone alerts the user to the direction of the sound, allowing them to turn and respond quickly.",
      },
      {
        heading: "Design decisions",
        body:
          "The biggest decisions were the form factor and the type of microphone. I went through a couple of form factors, such as a necklace and a hat, but ended up choosing a belt because of its versatility, size, and position on the user. The microphone choice was significantly harder: I went through 3 different types before settling on digital MEMS microphones because of their digital output that was easy to read, their small size, and the durability of the module.",
      },
      {
        heading: "What went wrong",
        body:
          "My biggest failure was HapBe 3, where I spent about 200 dollars and ~20 hours on a prototype that would not turn on. That failure caused me to almost give up on the project because of how much I lost, but I kept pushing through with the goal of giving under-privileged individuals the solution they deserve.",
      },
      {
        heading: "What I learned",
        body:
          "Being my first real electrical engineering project, I learned quickly that the skills required to make a custom product were not in my wheelhouse. Despite this, the project taught me how to research the market and competition, overcome financial struggles and doubt from others, and pivot when a design is not the best that it can be.",
      },
      {
        heading: "What's next",
        body:
          "The plan is to continue with it once I get into college. I have halted almost all work on it to focus on school, crew, and other less intensive projects that are easier to balance with my schedule.",
      },
    ],
  },
  {
    slug: "rowtech",
    number: "02",
    title: "RowTech",
    category: "Data analytics for crew teams and athletes",
    years: "2026–present",
    role: "Inventor and lead engineer",
    status: "Prototype built · 4 pre-orders",
    summary:
      "A first-of-its-kind force-measuring system for under-privileged crew teams that gives them data currently accessible to only the wealthiest of teams.",
    tags: ["ESP32-S3", "Load cell / HX711", "ESP-NOW", "MPU-6050", "Custom PCB"],
    href: "https://rowtech.app",
    images: [
      {
        src: "/projects/rowtech-1.webp",
        alt: "RowTech hub with its 3.5 inch display mounted on a rigger inside a boathouse",
        orientation: "portrait",
      },
      {
        src: "/projects/rowtech-2.webp",
        alt: "A seat node clamped to the backstay of a rigger on a racked eight",
        orientation: "portrait",
      },
      {
        src: "/projects/rowtech-3.webp",
        alt: "Looking down the boat: hub display and seat node wired along the riggers",
        orientation: "portrait",
      },
    ],
    specs: [
      { label: "Sensing / input", value: "A load cell sits in the rigger of the boat and measures the force from the oar" },
      { label: "Compute", value: "Adafruit Feather ESP32-S3" },
      {
        label: "Interfaces",
        value:
          "SPI (ESP32 to the ILI9488 display), I2C (MPU-6050 IMUs), the HX711's two-wire clock-and-data protocol, and ESP-NOW between the seat nodes and the hub",
      },
      {
        label: "Output / display",
        value: "3.5 inch TFT display; users can also wirelessly access their data and upload it to the cloud",
      },
      { label: "Power", value: "3000 mAh rechargeable Li-ion battery" },
      { label: "Fabrication", value: "~10 prototypes 3D printed on my Bambu Lab P1S" },
      { label: "Software", value: "Arduino / C" },
      { label: "Constraints", value: "Budget and testing" },
      { label: "Status", value: "Prototype is fully built, waiting on a day to test on the water" },
    ],
    sections: [
      {
        heading: "The problem",
        body:
          "Current data analysis systems for crew teams cost upwards of $11,000 for one eight-man boat. My team, Saint Edward High School, has very limited resources and cannot afford them. Frustrated with the cost, I researched the companies and found their patents and designs. What I found shocked me: an eight-man boat costs at most $3,000 for the companies to build, a profit margin of ~72%. That caused me to begin building my own solution at a tenth of the price of current systems.",
      },
      {
        heading: "How it works",
        body:
          "A load cell inside the rigger measures the force coming from the oar. The reading feeds into an amplifier which gives the microcontroller a readable output. From that one force reading the system can measure:",
        list: [
          "Force and force graphs",
          "Difference in force across all rowers",
          "Drive time and recovery time",
          "Drive / recovery ratio",
          "Catch and finish timing",
          "Acceleration through the drive",
          "Impulse in the drive",
        ],
      },
      {
        heading: "Design decisions",
        body:
          "The biggest design decision was the location of the force sensor. Originally the idea was to put it on the pin that connects the oarlock to the boat. I quickly found that a force sensor inside a bolt is the most expensive design I could have come up with. After lots of force diagrams, I settled on putting the sensor inside the adjustable bolt on the backstay of the rigger. This worked significantly better and cut costs to just over one hundred dollars a seat.",
      },
      {
        heading: "What went wrong",
        body:
          "The biggest failure was the design of the load cell. I originally wanted to put it inside the oarlock, which would give the most direct force reading. While researching competitors I found a patent for that exact design. Knowing the complications of violating patent law, I had to pivot.",
      },
      {
        heading: "What I learned",
        body:
          "How to create custom PCBs in CAD. This was crucial for my future projects, as it lets me create exactly what I need for each project instead of relying on pre-made parts.",
      },
      {
        heading: "What's next",
        body:
          "I currently have 4 pre-orders for the equipment, with much more to come. We are developing the product into its version one form, and will start the seed funding round shortly after.",
      },
    ],
  },
  {
    slug: "bikecomputer",
    number: "03",
    title: "BikeComputer",
    category: "Athletic technology",
    years: "2026",
    role: "Creator",
    status: "Finished",
    summary:
      "A low-cost bike computer I built myself instead of paying $300+ for an off-the-shelf model.",
    tags: ["Raspberry Pi Zero 2 W", "GPS", "Linux", "Onshape"],
    images: [
      {
        src: "/projects/bikecomputer-1.webp",
        alt: "The 3D-printed BikeComputer standing on a kitchen counter, screen off",
        orientation: "portrait",
      },
      {
        src: "/projects/bikecomputer-2.webp",
        alt: "BikeComputer powered on, searching for GPS satellites",
        orientation: "portrait",
      },
      {
        src: "/projects/bikecomputer-3.webp",
        alt: "Side view of the BikeComputer showing its handlebar mount",
        orientation: "portrait",
      },
    ],
    specs: [
      { label: "Role", value: "Planned, designed, and created the product" },
      { label: "Sensing / input", value: "GPS" },
      { label: "Compute", value: "Raspberry Pi Zero 2 W" },
      { label: "Interfaces", value: "SPI" },
      { label: "Output / display", value: "3.5 inch TFT color display" },
      { label: "Power", value: "Portable battery attached to the back of the bike" },
      { label: "Fabrication", value: "3D modeled in Onshape, coded in Linux" },
      { label: "Software", value: "Raspberry Pi OS Lite" },
      { label: "Constraints", value: "Money, time, and resources" },
      { label: "Status", value: "Completed. It is now a permanent addition to my bike." },
    ],
    sections: [
      {
        heading: "The problem",
        body:
          "I like to bike, but I don't have the money for a bike computer. I wanted to track my speed, distance, and heart rate, and most importantly, be able to leave my phone at the house and still have music. That is only possible with an expensive bike computer like a Garmin, so one weekend I set out to build my own.",
      },
      {
        heading: "How it works",
        body:
          "The onboard GPS connects to ~6–8 satellites overhead. Once a connection is established, the satellites transmit location and speed. The onboard computer reads this data and creates a bitmap, a digital map of the surrounding area, places the user on it according to the satellite data, and orients it to the direction of travel. This happens roughly ten times per second, giving instant feedback on the ride, all shown on the 3.5 inch TFT display.",
      },
    ],
  },
  {
    slug: "rc-jetboat",
    number: "04",
    title: "RC Jetboat",
    category: "Marine / embedded systems",
    years: "2026–present",
    role: "Designer and builder",
    status: "In progress",
    summary:
      "A radio-controlled jet-drive boat whose lights, pumps, and fans are all controlled and monitored from a phone.",
    tags: ["ESP32-S2", "Wi-Fi dashboard", "GPS", "Arduino / C++"],
    images: [
      {
        src: "/projects/jetboat-1.webp",
        alt: "The white jetboat running across the lake at sunset",
        orientation: "landscape",
      },
      {
        src: "/projects/jetboat-2.webp",
        alt: "The jetboat sitting in shallow water at the shoreline",
        orientation: "portrait",
      },
    ],
    specs: [
      { label: "Role", value: "Designing and building the boat and its onboard electronics" },
      {
        label: "Sensing / input",
        value: "GPS (speed), 2 temperature sensors (ESC and battery), battery voltage",
      },
      { label: "Compute", value: "Adafruit Feather ESP32-S2" },
      { label: "Interfaces", value: "Wi-Fi (web dashboard)" },
      {
        label: "Output / display",
        value:
          "8 RGB underwater LEDs, 6 fans and 2 water pumps (each individually controllable), 10 high-powered lights on two channels (8 + 2). A web dashboard on the boat's own network for control and for GPS speed, battery voltage, and temperatures.",
      },
      {
        label: "Power",
        value: "Two separate batteries: one for the motor and ESC, one for the electronics",
      },
      { label: "Software", value: "Arduino / C++" },
      { label: "Constraints", value: "Keeping the cost of the electronics low" },
      { label: "Status", value: "In progress. Started September 2026." },
    ],
    sections: [
      {
        heading: "The problem",
        body:
          "A normal RC boat tells the driver nothing once it leaves the shore. I wanted to know how fast the boat was going, how much battery was left, and how hot the ESC and battery were getting, and I wanted to control every pump, fan, and light on board individually. I also wanted to do all of it from my phone while keeping the cost of the electronics low.",
      },
      {
        heading: "How it works",
        body:
          "A GPS module measures the boat's speed, and two temperature sensors watch the ESC and the battery. The Feather ESP32-S2 reads those sensors along with the battery voltage and serves a web dashboard, so a phone connected to the boat can see speed, voltage, and temperatures live. From the same page I can switch each of the 6 fans and 2 water pumps individually, set the 8 RGB underwater LEDs, and turn the two channels of high-powered lights on and off. The drive motor and ESC run from their own battery, separate from the electronics.",
      },
      {
        heading: "Design decisions",
        body:
          "For speed measurement I went with GPS, which needs no sensor in the water. I run the electronics on a separate battery from the motor and ESC instead of sharing one pack. This keeps the microcontroller's supply steady when the motor draws heavy current, at the cost of carrying a second battery. I originally planned an onboard camera and dropped it, which fit the goal of keeping the electronics cheap.",
      },
    ],
  },
  {
    slug: "trading-cluster",
    number: "05",
    title: "Automated Trading Platform",
    category: "Distributed computing",
    years: "2026–present",
    role: "Builder and operator",
    status: "Running",
    summary:
      "A rack of 10–15 old office computers that I turned into one cluster for running automated trading models.",
    tags: ["Debian", "Headless cluster", "Exchange APIs", "Cross-exchange arbitrage"],
    images: [
      {
        src: "/projects/cluster-1.webp",
        alt: "Monitoring dashboard for the cluster showing node-09 and a 3D map of the nodes",
        orientation: "landscape",
      },
      {
        src: "/projects/cluster-2.webp",
        alt: "Monitoring dashboard for the cluster showing node-12 and live log output",
        orientation: "landscape",
      },
    ],
    specs: [
      { label: "Role", value: "Set up the rack and the system that runs on it" },
      { label: "Sensing / input", value: "Live market data from the APIs of two event-contract exchanges" },
      {
        label: "Compute",
        value: "10–15 old workstation computers (DDR3 memory, older Intel processors)",
      },
      { label: "Output / display", value: "No monitors; every machine runs without a desktop" },
      {
        label: "Software",
        value: "Debian without a desktop on every machine. Some workers boot from 16 GB flash drives.",
      },
      { label: "Constraints", value: "Old hardware, and small storage on the flash-drive workers" },
      {
        label: "Status",
        value:
          "Running. It currently handles automated trading and cross-exchange arbitrage only. I want to build on it so other workloads can be deployed to the same machines.",
      },
    ],
    sections: [
      {
        heading: "The problem",
        body:
          "I had 10–15 old workstation computers with DDR3 memory and older Intel processors. None of them is powerful on its own, but together they add up to a useful amount of computing. I wanted to put them to work as one system instead of letting them sit.",
      },
      {
        heading: "How it works",
        body:
          "Each computer runs Debian with no desktop, so all of its memory and processor go to the work. Some of the machines boot from a 16 GB flash drive. The machines pull live prices from two exchanges through their APIs, run trading models against them, and look for cases where the same contract is priced differently on the two exchanges.",
      },
      {
        heading: "Design decisions",
        body:
          "I run Debian without a desktop on every machine. On hardware this old, a graphical desktop would use memory and processor time that the work needs, and the tradeoff is that everything has to be managed from the command line. Some workers run from 16 GB flash drives instead of internal drives, which gets a machine running at almost no cost but leaves very little storage on it.",
      },
      {
        heading: "What's next",
        body:
          "The system only runs trading right now. The next step is making it general enough that I can deploy other projects onto the rack. The first of those is the worker fleet for Emmett's Property Services below.",
      },
    ],
  },
  {
    slug: "lecturly",
    number: "06",
    title: "Lecturly",
    category: "Education software",
    years: "2025",
    role: "Founder and solo developer",
    status: "Live",
    summary: "An AI teaching assistant for K–12 teachers and homeschool parents.",
    tags: ["Next.js", "Supabase", "Google Gemini", "Stripe", "MailerLite"],
    href: "https://lecturly.app",
    images: [
      {
        src: "/projects/lecturly-1.webp",
        alt: "Lecturly landing page: 'You became a teacher to inspire. Not to spend Sunday writing lesson plans.'",
        orientation: "landscape",
      },
      {
        src: "/projects/lecturly-2.webp",
        alt: "Lecturly's five tools: lesson plans, slide decks, quizzes, rubrics, and parent emails",
        orientation: "landscape",
      },
      {
        src: "/projects/lecturly-3.webp",
        alt: "A generated lesson plan on fractions shown inside the Lecturly app",
        orientation: "landscape",
      },
    ],
    specs: [
      { label: "Role", value: "Founder and solo developer: product, code, pricing, and marketing" },
      { label: "Sensing / input", value: "A teacher's or parent's request in the web app" },
      { label: "Compute", value: "Hosted on Vercel; Google Gemini for generation" },
      {
        label: "Interfaces",
        value: "Supabase (database and accounts), Stripe (payments), MailerLite (email automations)",
      },
      { label: "Output / display", value: "Generated teaching material, shown in the web app" },
      { label: "Software", value: "Next.js 14, Supabase, Google Gemini, Tailwind CSS, shadcn/ui" },
      {
        label: "Constraints",
        value: "One developer, competing with established products like MagicSchool AI and Brisk Teaching",
      },
      {
        label: "Status",
        value:
          "Live at lecturly.app with a Free tier (15 generations per week), an unlimited Pro plan at $9.99/month, and a quote-based Enterprise tier",
      },
    ],
    sections: [
      {
        heading: "The problem",
        body:
          "Preparing lessons takes teachers and homeschool parents hours outside of the time they spend teaching. Lecturly is my attempt to give both groups an affordable AI assistant for that work, with a free tier and a low-cost unlimited plan.",
      },
      {
        heading: "How it works",
        body:
          "A teacher or homeschool parent signs in to the web app, which is built in Next.js and hosted on Vercel. Their request is sent to Google Gemini, which generates the material. Accounts are stored in Supabase, and paid plans run through Stripe. Email sequences in MailerLite welcome new signups, follow up with users who have been inactive for 14 days, and prompt users who are near the free limit to upgrade.",
      },
      {
        heading: "Design decisions",
        body:
          "The biggest decision was pricing. I restructured the plans into a Free tier capped at 15 generations per week, an unlimited Pro plan at $9.99/month, and a quote-based Enterprise tier that replaced the old Max tier. Before making the change, I benchmarked Lecturly against MagicSchool AI and Brisk Teaching.",
      },
      {
        heading: "What's next",
        body:
          "Feature work on school single sign-on, district pricing, an AI model selector, differentiation tools, and a homeschool mode. For outreach, I built a directory of K–8 school staff in Northeast Ohio.",
      },
    ],
  },
  {
    slug: "emmetts",
    number: "07",
    title: "Emmett's Property Services",
    category: "Small-business operations software",
    years: "2026–present",
    role: "Designer and developer",
    status: "In development",
    summary:
      "A marketing site and back-office system for a lawn care crew in Northeast Ohio: quotes, scheduling, a crew app, and AI-drafted ads and quotes that the owner approves with one tap.",
    tags: ["Next.js", "Supabase", "Stripe", "Claude API", "Debian worker fleet"],
    href: "https://github.com/notrelaxedd/emmetts-property-services",
    images: [],
    specs: [
      { label: "Role", value: "Designed and built the public site and the operations system behind it" },
      {
        label: "Sensing / input",
        value:
          "A public quote form (services, photos, preferred days) and QR-code flyers that credit each lead to the worker who handed it out",
      },
      {
        label: "Compute",
        value:
          "Next.js on Vercel and Supabase for the site and database; a fleet of workers on the Debian rack above handle ads, quotes, scheduling, and follow-ups",
      },
      {
        label: "Interfaces",
        value: "Stripe Checkout for paid quotes, the Anthropic API for drafts, and National Weather Service data for rain holds and snow plans",
      },
      {
        label: "Output / display",
        value:
          "An owner console with an approval inbox, live pricing, and drag-to-move scheduling, plus an installable crew app for today's jobs, hours, and pay",
      },
      {
        label: "Software",
        value: "Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Supabase (row-level security, task queue), Stripe, Vitest and Playwright",
      },
      {
        label: "Constraints",
        value: "One developer; every customer-facing message has to be right the first time",
      },
      { label: "Status", value: "In development, deploying continuously from the main branch" },
    ],
    sections: [
      {
        heading: "The problem",
        body:
          "A small lawn care crew runs on phone calls, texts, and memory. Quotes get lost, nobody knows who is working which job, and the owner is the bottleneck for everything. I wanted the business to run from one place without handing control of it to software.",
      },
      {
        heading: "How it works",
        body:
          "A lead comes in through the quote form. Workers claim tasks from a queue in Supabase: one geocodes the address, estimates hours, and prices the job; one drafts weekly ads with Claude; one runs the scheduler and offers jobs to the crew; one sends reminders, review requests, and weather holds. Nothing reaches a customer until the owner approves it from the inbox. A paid quote becomes a job, and the scheduler places it.",
      },
      {
        heading: "Design decisions",
        body:
          "Every AI-written or customer-facing action lands in the approval inbox first, and autopilot is off by default. Crew members never see prices or customer contact details, enforced in the database with row-level security rather than in the app. The workers talk only to Supabase, so if a machine on the rack dies, queued work waits for it instead of being lost.",
      },
    ],
  },
];
