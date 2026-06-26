export type ExamSubject = {
  slug: string;
  title: string;
  shortTitle: string;
  partLabel: string;
  groupTitle: string;
  audience: string;
  focus: string;
  setCount: number;
  questionCount: number;
  isMajor: boolean;
};

export type ExamAffiliation = {
  slug: string;
  label: string;
  name: string;
  description: string;
  image: string;
  color: string;
  subjects: ExamSubject[];
};

export type ExamSet = {
  slug: string;
  affiliationSlug: string;
  subjectSlug: string;
  title: string;
  year: string;
  questions: number;
  durationMinutes: number;
  difficulty: string;
  status: "ยังไม่ทำ" | "ทำต่อ" | "ทำแล้ว";
  bestScore?: string;
  description: string;
};

export type MockQuestion = {
  no: number;
  question: string;
  choices: string[];
  answer: string;
};

export type ExamTrackPackage = {
  slug: string;
  affiliationSlug: string;
  majorSlug: string;
  title: string;
  year: string;
  label: string;
  description: string;
  status: "ยังไม่ทำ" | "ทำต่อ" | "ทำแล้ว";
  bestScore?: string;
};

export type ExamTrackPart = {
  slug: string;
  title: string;
  shortTitle: string;
  partLabel: string;
  questions: number;
  durationMinutes: number;
  difficulty: string;
  description: string;
};

export type PracticeCategory = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  color: string;
};

export type PracticeSet = {
  slug: string;
  categorySlug: string;
  title: string;
  scope: string;
  year: string;
  questions: number;
  durationMinutes: number;
  difficulty: string;
  description: string;
};

const commonSubjects: ExamSubject[] = [
  {
    slug: "part-a-general",
    title: "ภาค ก ความสามารถทั่วไป",
    shortTitle: "ภาค ก",
    partLabel: "ภาค ก",
    groupTitle: "ภาค ก สำหรับทุกเอก",
    audience: "ทุกเอก",
    focus: "ภาษาไทย คณิต เหตุผล การคิดวิเคราะห์ และความรู้รอบตัว",
    setCount: 8,
    questionCount: 640,
    isMajor: false,
  },
  {
    slug: "part-b-profession",
    title: "ภาค ข วิชาชีพครู",
    shortTitle: "วิชาชีพครู",
    partLabel: "ภาค ข",
    groupTitle: "ภาค ข แกนกลางวิชาชีพครู",
    audience: "ทุกเอก",
    focus: "หลักสูตร การสอน จิตวิทยา การวัดผล และจรรยาบรรณวิชาชีพ",
    setCount: 7,
    questionCount: 560,
    isMajor: false,
  },
  {
    slug: "education-law",
    title: "กฎหมายการศึกษาและงานราชการ",
    shortTitle: "กฎหมาย",
    partLabel: "แกนกลาง",
    groupTitle: "กฎหมายและระเบียบที่ใช้ร่วมกัน",
    audience: "ทุกเอก",
    focus: "พ.ร.บ. การศึกษา ระเบียบข้าราชการครู งานราชการ และหน่วยงานที่เกี่ยวข้อง",
    setCount: 6,
    questionCount: 420,
    isMajor: false,
  },
  {
    slug: "part-c-interview",
    title: "ภาค ค สัมภาษณ์และความเหมาะสม",
    shortTitle: "ภาค ค",
    partLabel: "ภาค ค",
    groupTitle: "ภาค ค ประเมินความเหมาะสม",
    audience: "ทุกเอก",
    focus: "สัมภาษณ์ แฟ้มสะสมงาน บุคลิกภาพ วิสัยทัศน์ครู และการสาธิตการสอน",
    setCount: 4,
    questionCount: 120,
    isMajor: false,
  },
];

const majorSubjects: ExamSubject[] = [
  {
    slug: "major-computer",
    title: "ภาค ข วิชาเอกคอมพิวเตอร์",
    shortTitle: "เอกคอม",
    partLabel: "ภาค ข",
    groupTitle: "ภาค ข วิชาเอก",
    audience: "เอกคอมพิวเตอร์",
    focus: "ระบบคอมพิวเตอร์ เครือข่าย ฐานข้อมูล การเขียนโปรแกรม และเทคโนโลยีการศึกษา",
    setCount: 5,
    questionCount: 400,
    isMajor: true,
  },
  {
    slug: "major-math",
    title: "ภาค ข วิชาเอกคณิตศาสตร์",
    shortTitle: "เอกคณิต",
    partLabel: "ภาค ข",
    groupTitle: "ภาค ข วิชาเอก",
    audience: "เอกคณิตศาสตร์",
    focus: "จำนวนและพีชคณิต เรขาคณิต สถิติ ความน่าจะเป็น และการแก้โจทย์ประยุกต์",
    setCount: 5,
    questionCount: 400,
    isMajor: true,
  },
  {
    slug: "major-english",
    title: "ภาค ข วิชาเอกภาษาอังกฤษ",
    shortTitle: "เอกอังกฤษ",
    partLabel: "ภาค ข",
    groupTitle: "ภาค ข วิชาเอก",
    audience: "เอกภาษาอังกฤษ",
    focus: "grammar, vocabulary, reading, classroom English และการสอนภาษาอังกฤษ",
    setCount: 5,
    questionCount: 400,
    isMajor: true,
  },
  {
    slug: "major-early-childhood",
    title: "ภาค ข วิชาเอกปฐมวัย",
    shortTitle: "เอกปฐมวัย",
    partLabel: "ภาค ข",
    groupTitle: "ภาค ข วิชาเอก",
    audience: "เอกปฐมวัย",
    focus: "พัฒนาการเด็กปฐมวัย การจัดประสบการณ์ การประเมินเด็กเล็ก และสื่อการเรียนรู้",
    setCount: 4,
    questionCount: 320,
    isMajor: true,
  },
];

function getSubjectsForAffiliation(affiliationLabel: string): ExamSubject[] {
  const affiliationFocus: ExamSubject = {
    slug: "affiliation-policy",
    title: `นโยบายและบริบท ${affiliationLabel}`,
    shortTitle: `บริบท ${affiliationLabel}`,
    partLabel: "เฉพาะสนาม",
    groupTitle: "เนื้อหาเฉพาะสังกัด",
    audience: "ทุกเอก",
    focus: `ภารกิจ โครงสร้างงาน นโยบาย และบริบทข้อสอบเฉพาะของ ${affiliationLabel}`,
    setCount: 4,
    questionCount: 240,
    isMajor: false,
  };

  return [...commonSubjects, affiliationFocus, ...majorSubjects];
}

export const examAffiliations: ExamAffiliation[] = [
  {
    slug: "obec",
    label: "สพฐ.",
    name: "สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน",
    description: "สนามยอดนิยมของครูผู้ช่วยสายสามัญ แยกชัดทั้ง ภาค ก ภาค ข วิชาชีพครู วิชาเอก และภาค ค",
    image: "/images/teacher-card-general.png",
    color: "bg-[#0b66c3]",
    subjects: getSubjectsForAffiliation("สพฐ."),
  },
  {
    slug: "ovec",
    label: "สอศ.",
    name: "สำนักงานคณะกรรมการการอาชีวศึกษา",
    description: "สนามครูอาชีวะที่แยกแกนกลาง วิชาชีพครู วิชาเอก และบริบทงานอาชีวศึกษาให้เลือกฝึกตามเป้าหมาย",
    image: "/images/teacher-card-ovec.png",
    color: "bg-[#e94b7b]",
    subjects: getSubjectsForAffiliation("สอศ."),
  },
  {
    slug: "dole",
    label: "สกร.",
    name: "กรมส่งเสริมการเรียนรู้",
    description: "สนามที่เกี่ยวกับการเรียนรู้ตลอดชีวิต งานชุมชน และการจัดการศึกษานอกระบบ",
    image: "/images/teacher-card-law.png",
    color: "bg-[#00a86b]",
    subjects: getSubjectsForAffiliation("สกร."),
  },
  {
    slug: "dla",
    label: "อปท.",
    name: "องค์กรปกครองส่วนท้องถิ่น",
    description: "สนามที่ควรเก็บระเบียบท้องถิ่น งานราชการ และบริบทการจัดการศึกษาในพื้นที่",
    image: "/images/teacher-card-cutout.png",
    color: "bg-[#f6b21a]",
    subjects: getSubjectsForAffiliation("อปท."),
  },
  {
    slug: "bma",
    label: "กทม.",
    name: "กรุงเทพมหานคร",
    description: "สนามท้องถิ่นเมืองใหญ่ที่ควรอ่านทั้งแกนกลางครูผู้ช่วย วิชาเอก และบริบทงานการศึกษาของกรุงเทพมหานคร",
    image: "/images/teacher-card-general.png",
    color: "bg-[#7c3aed]",
    subjects: getSubjectsForAffiliation("กทม."),
  },
];

export const examSets: ExamSet[] = examAffiliations.flatMap((affiliation) =>
  affiliation.subjects.flatMap((subject) => [
    {
      slug: `${subject.slug}-2568-set-1`,
      affiliationSlug: affiliation.slug,
      subjectSlug: subject.slug,
      title: `${subject.title} ${affiliation.label} ปี 2568 ชุดที่ 1`,
      year: "2568",
      questions: subject.isMajor ? 80 : subject.slug === "part-c-interview" ? 30 : 60,
      durationMinutes: subject.isMajor ? 90 : subject.slug === "part-c-interview" ? 40 : 75,
      difficulty: "กลาง",
      status: "ยังไม่ทำ",
      description: `${subject.audience} | ชุดฝึก ${subject.title} สำหรับสนาม ${affiliation.label} อิงแนวข้อสอบล่าสุด`,
    },
    {
      slug: `${subject.slug}-2567-set-1`,
      affiliationSlug: affiliation.slug,
      subjectSlug: subject.slug,
      title: `${subject.title} ${affiliation.label} ปี 2567 ชุดที่ 1`,
      year: "2567",
      questions: subject.isMajor ? 80 : subject.slug === "education-law" ? 70 : 60,
      durationMinutes: subject.isMajor ? 90 : subject.slug === "education-law" ? 75 : 70,
      difficulty: "กลาง",
      status: "ทำแล้ว",
      bestScore: subject.isMajor ? "64/80" : "48/60",
      description: `${subject.audience} | ชุดย้อนหลังสำหรับดูแนวซ้ำและประเด็นที่มักออกในสนาม ${affiliation.label}`,
    },
    {
      slug: `${subject.slug}-mock-exam`,
      affiliationSlug: affiliation.slug,
      subjectSlug: subject.slug,
      title: `${subject.title} ${affiliation.label} จำลองสนามจริง`,
      year: "จำลองสนาม",
      questions: subject.isMajor ? 100 : 80,
      durationMinutes: 120,
      difficulty: "เข้มข้น",
      status: "ทำต่อ",
      bestScore: "กำลังทำ",
      description: `${subject.audience} | ชุดเต็มเวลาเพื่อซ้อมจังหวะทำข้อสอบและบริหารเวลา`,
    },
  ]),
);

export const examTrackPackages: ExamTrackPackage[] = examAffiliations.flatMap((affiliation) =>
  affiliation.subjects
    .filter((subject) => subject.isMajor)
    .flatMap((major) => [
      {
        slug: "2568-set-1",
        affiliationSlug: affiliation.slug,
        majorSlug: major.slug,
        title: `${affiliation.label} ${major.audience} ปี 2568 ชุดที่ 1`,
        year: "2568",
        label: "ชุดที่ 1",
        description: `รวมชุดฝึกสำหรับผู้สอบ ${major.audience} สนาม ${affiliation.label} แยกให้เลือกทำ ภาค ก ภาค ข และภาค ค`,
        status: "ยังไม่ทำ",
      },
      {
        slug: "2567-set-1",
        affiliationSlug: affiliation.slug,
        majorSlug: major.slug,
        title: `${affiliation.label} ${major.audience} ปี 2567 ชุดที่ 1`,
        year: "2567",
        label: "ชุดที่ 1",
        description: `ชุดย้อนหลังของ ${major.audience} สำหรับเทียบแนวข้อสอบและดูประเด็นที่ออกซ้ำ`,
        status: "ทำแล้ว",
        bestScore: "214/300",
      },
      {
        slug: "full-mock-1",
        affiliationSlug: affiliation.slug,
        majorSlug: major.slug,
        title: `${affiliation.label} ${major.audience} จำลองสนามเต็มชุด`,
        year: "จำลองสนาม",
        label: "เต็มชุด",
        description: `ซ้อมเหมือนวันสอบจริงสำหรับ ${major.audience} ครบทุกภาคในชุดเดียว`,
        status: "ทำต่อ",
        bestScore: "กำลังทำ",
      },
    ]),
);

export const practiceCategories: PracticeCategory[] = [
  {
    slug: "part-a",
    title: "ภาค ก รวมทุกสังกัด",
    shortTitle: "ภาค ก",
    description: "ฝึกความสามารถทั่วไป ภาษาไทย คณิต เหตุผล และความรู้รอบตัวจากหลายแนวสนาม",
    color: "bg-[#0b66c3]",
  },
  {
    slug: "teaching-profession",
    title: "วิชาชีพครู รวมทุกสังกัด",
    shortTitle: "วิชาชีพครู",
    description: "ฝึกหลักสูตร การสอน จิตวิทยา การวัดผล และจรรยาบรรณวิชาชีพครู",
    color: "bg-[#00a86b]",
  },
  {
    slug: "education-law",
    title: "กฎหมายการศึกษา",
    shortTitle: "กฎหมาย",
    description: "รวมข้อสอบกฎหมายและระเบียบที่ใช้ได้หลายสนาม พร้อมชุดสั้นและชุดจับเวลา",
    color: "bg-[#f6b21a]",
  },
  {
    slug: "reasoning",
    title: "คณิตและเหตุผล",
    shortTitle: "เหตุผล",
    description: "เน้นโจทย์คำนวณ อนุกรม ตาราง เงื่อนไข และการวิเคราะห์เชิงเหตุผล",
    color: "bg-[#e94b7b]",
  },
];

export const practiceSets: PracticeSet[] = practiceCategories.flatMap((category) => [
  {
    slug: `${category.slug}-foundation-1`,
    categorySlug: category.slug,
    title: `${category.shortTitle} ชุดพื้นฐาน 1`,
    scope: "ทุกสังกัด",
    year: "พื้นฐาน",
    questions: 30,
    durationMinutes: 30,
    difficulty: "ง่าย",
    description: `ชุดเริ่มต้นสำหรับเก็บพื้นฐาน ${category.title} เหมาะกับการวอร์มก่อนทำชุดยาว`,
  },
  {
    slug: `${category.slug}-mixed-2568`,
    categorySlug: category.slug,
    title: `${category.shortTitle} รวมแนวปี 2568`,
    scope: "สพฐ. / สอศ. / สกร.",
    year: "2568",
    questions: 60,
    durationMinutes: 75,
    difficulty: "กลาง",
    description: `รวมแนวข้อสอบ ${category.title} จากหลายสนาม เพื่อดูประเด็นที่ออกซ้ำ`,
  },
  {
    slug: `${category.slug}-speed-30`,
    categorySlug: category.slug,
    title: `${category.shortTitle} จับเวลา 30 ข้อ`,
    scope: "ทุกสังกัด",
    year: "จับเวลา",
    questions: 30,
    durationMinutes: 25,
    difficulty: "กลาง",
    description: "เหมาะสำหรับฝึกความเร็วและตัดสินใจในเวลาจำกัด",
  },
  {
    slug: `${category.slug}-hard-drill`,
    categorySlug: category.slug,
    title: `${category.shortTitle} ตะลุยโจทย์ยาก`,
    scope: "ทุกสังกัด",
    year: "เข้มข้น",
    questions: 50,
    durationMinutes: 60,
    difficulty: "ยาก",
    description: "รวมโจทย์ที่ต้องใช้ความเข้าใจและการวิเคราะห์มากกว่าชุดพื้นฐาน",
  },
]);

export function getExamTrackParts(major: ExamSubject): ExamTrackPart[] {
  return [
    {
      slug: "part-a-general",
      title: "ภาค ก ความสามารถทั่วไป",
      shortTitle: "ภาค ก",
      partLabel: "ทุกเอกต้องทำ",
      questions: 60,
      durationMinutes: 75,
      difficulty: "กลาง",
      description: "ภาษาไทย คณิต เหตุผล การคิดวิเคราะห์ และความรู้รอบตัว",
    },
    {
      slug: "part-b-profession",
      title: "ภาค ข วิชาชีพครู",
      shortTitle: "วิชาชีพครู",
      partLabel: "ทุกเอกต้องทำ",
      questions: 60,
      durationMinutes: 70,
      difficulty: "กลาง",
      description: "หลักสูตร การสอน จิตวิทยา การวัดผล และจรรยาบรรณวิชาชีพครู",
    },
    {
      slug: major.slug,
      title: major.title,
      shortTitle: major.shortTitle,
      partLabel: major.audience,
      questions: 80,
      durationMinutes: 90,
      difficulty: "เข้มข้น",
      description: major.focus,
    },
    {
      slug: "part-c-interview",
      title: "ภาค ค สัมภาษณ์และความเหมาะสม",
      shortTitle: "ภาค ค",
      partLabel: "ทุกเอกต้องทำ",
      questions: 30,
      durationMinutes: 40,
      difficulty: "ฝึกตอบ",
      description: "สัมภาษณ์ แฟ้มสะสมงาน บุคลิกภาพ วิสัยทัศน์ครู และการสาธิตการสอน",
    },
  ];
}

export const mockQuestions: MockQuestion[] = [
  {
    no: 1,
    question: "ข้อใดเป็นหลักสำคัญของการจัดการเรียนรู้ที่ยึดผู้เรียนเป็นสำคัญ",
    choices: [
      "จัดเนื้อหาให้มากที่สุดในเวลาที่มี",
      "เปิดโอกาสให้ผู้เรียนมีส่วนร่วมและสะท้อนการเรียนรู้",
      "วัดผลเฉพาะปลายภาคเรียน",
      "ใช้การบรรยายเป็นวิธีหลักทุกบทเรียน",
    ],
    answer: "เปิดโอกาสให้ผู้เรียนมีส่วนร่วมและสะท้อนการเรียนรู้",
  },
  {
    no: 2,
    question: "ถ้าผู้เรียนมีพื้นฐานต่างกันมาก ครูควรเริ่มออกแบบการสอนจากสิ่งใด",
    choices: [
      "เลือกแบบฝึกหัดที่ยากที่สุด",
      "วิเคราะห์ผู้เรียนและกำหนดเป้าหมายรายกลุ่ม",
      "ใช้ข้อสอบชุดเดียวกันทุกครั้ง",
      "ลดเวลาเรียนเพื่อให้จบบทเร็วขึ้น",
    ],
    answer: "วิเคราะห์ผู้เรียนและกำหนดเป้าหมายรายกลุ่ม",
  },
  {
    no: 3,
    question: "การประเมินเพื่อพัฒนาผู้เรียนควรใช้ข้อมูลในลักษณะใด",
    choices: [
      "ใช้คะแนนครั้งเดียวตัดสินผลทั้งหมด",
      "ใช้ข้อมูลระหว่างเรียนเพื่อปรับการสอนและให้ feedback",
      "ใช้เฉพาะข้อสอบปรนัย",
      "ใช้ผลสอบของเพื่อนเป็นเกณฑ์หลัก",
    ],
    answer: "ใช้ข้อมูลระหว่างเรียนเพื่อปรับการสอนและให้ feedback",
  },
];

export function getExamAffiliation(slug: string): ExamAffiliation | undefined {
  return examAffiliations.find((affiliation) => affiliation.slug === slug);
}

export function getExamSubject(affiliationSlug: string, subjectSlug: string): ExamSubject | undefined {
  return getExamAffiliation(affiliationSlug)?.subjects.find((subject) => subject.slug === subjectSlug);
}

export function getExamSubjectGroups(subjects: ExamSubject[]): Array<[string, ExamSubject[]]> {
  const groups = new Map<string, ExamSubject[]>();

  subjects.forEach((subject) => {
    groups.set(subject.groupTitle, [...(groups.get(subject.groupTitle) ?? []), subject]);
  });

  return Array.from(groups.entries());
}

export function getExamSets(affiliationSlug: string, subjectSlug?: string): ExamSet[] {
  return examSets.filter(
    (set) => set.affiliationSlug === affiliationSlug && (!subjectSlug || set.subjectSlug === subjectSlug),
  );
}

export function getExamSet(affiliationSlug: string, subjectSlug: string, setSlug: string): ExamSet | undefined {
  return examSets.find(
    (set) => set.affiliationSlug === affiliationSlug && set.subjectSlug === subjectSlug && set.slug === setSlug,
  );
}

export function getExamMajors(affiliationSlug: string): ExamSubject[] {
  return getExamAffiliation(affiliationSlug)?.subjects.filter((subject) => subject.isMajor) ?? [];
}

export function getExamMajor(affiliationSlug: string, majorSlug: string): ExamSubject | undefined {
  return getExamMajors(affiliationSlug).find((major) => major.slug === majorSlug);
}

export function getExamTrackPackages(affiliationSlug: string, majorSlug: string): ExamTrackPackage[] {
  return examTrackPackages.filter(
    (item) => item.affiliationSlug === affiliationSlug && item.majorSlug === majorSlug,
  );
}

export function getExamTrackPackage(
  affiliationSlug: string,
  majorSlug: string,
  packageSlug: string,
): ExamTrackPackage | undefined {
  return examTrackPackages.find(
    (item) => item.affiliationSlug === affiliationSlug && item.majorSlug === majorSlug && item.slug === packageSlug,
  );
}

export function getExamTrackPart(major: ExamSubject, partSlug: string): ExamTrackPart | undefined {
  return getExamTrackParts(major).find((part) => part.slug === partSlug);
}

export function getPracticeCategory(slug: string): PracticeCategory | undefined {
  return practiceCategories.find((category) => category.slug === slug);
}

export function getPracticeSets(categorySlug: string): PracticeSet[] {
  return practiceSets.filter((set) => set.categorySlug === categorySlug);
}

export function getPracticeSet(categorySlug: string, setSlug: string): PracticeSet | undefined {
  return practiceSets.find((set) => set.categorySlug === categorySlug && set.slug === setSlug);
}

export function getExamTotals() {
  return {
    affiliations: examAffiliations.length,
    sets: examSets.length,
    questions: examSets.reduce((sum, set) => sum + set.questions, 0),
  };
}
