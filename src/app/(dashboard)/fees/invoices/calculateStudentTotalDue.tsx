export function calculateStudentTotalDue(
  student: any, // Student | RegistrationData
  categories: { id: number; name: string }[],
  classes: { id: number; name: string }[],
  paidTypes: string[] = []
): number {
  if (!student) return 0;

  const isApplicant = (student as any).class_applying_for !== undefined;

  const categoryId = student.category_id;
  const classId = isApplicant
    ? student.class_applying_for
    : student.class_id;

    
    // Use the exact mappings from your page.tsx
    const textBooksMap: Record<string, number> = {
  'kg 1 a': 345,
  'kg 1 d': 345,
  'kg 1 c': 345,
  'kg 1 b': 345,
  'kg 2 a': 345,
  'kg 2 b': 345,
  'kg 2 c': 345,
  'kg 2 d': 345,
  'basic 1': 615,
    'basic 2': 590,
    'basic 3': 590,
    'basic 4': 660,
    'basic 5': 650,
    'basic 6': 650,
    'basic 7': 990,
    'basic 8': 415,
    'basic 9': 350,
  };
  
const exerciseBooksMap: Record<string, number> = {
  'kg 1 a': 104,
  'kg 1 b': 104,
  'kg 1 c': 104,
  'kg 1 d': 104,
  'kg 2 a': 104,
  'kg 2 b': 104,
  'kg 2 c': 104,
  'kg 2 d': 104,
  'basic 1': 181,
  'basic 2': 181,
  'basic 3': 181,
  'basic 4': 186,
  'basic 5': 274,
  'basic 6': 274,
  'basic 7': 341,
  'basic 8': 341,
  'basic 9': 341,
};
  // Partial match fallback
  const categoryName = categories.find(c => Number(c.id) === Number(categoryId))?.name || "";
// With this (handles both ID and name):
const classNameRaw =
  classes.find(
    cls =>
      Number(cls.id) === Number(classId) ||
    cls.name.trim().toLowerCase() === String(classId).trim().toLowerCase()
  )?.name || "";
  const normalizedClassName = classNameRaw.trim().toLowerCase().replace(/\s+/g, ' ');
  console.log('classId:', classId, 'classNameRaw:', classNameRaw, 'normalizedClassName:', normalizedClassName);
  // console.log('clasName:', normalizedClassName, 'classes:', classes);
let textBookKey = Object.keys(textBooksMap).find(key => normalizedClassName.startsWith(key));
let exerciseBookKey = Object.keys(exerciseBooksMap).find(key => normalizedClassName.startsWith(key));

// console.log('classId:', classId, 'classes:', classes);

  const feeTypes = isApplicant
    ? ["registration", "levy", "furniture", "jersey", "crest", "textBooks", "exerciseBooks"]
    : ["levy", "furniture", "jersey", "crest", "textBooks", "exerciseBooks"];

  let total = 0;
  for (const type of feeTypes) {
    if (paidTypes.includes(type)) continue;
    let fixedAmount = 0;
    switch (type) {
      case "registration":
        fixedAmount = 40;
        break;
      case "levy":
        if (categoryName === "SVC" || categoryName === "MOD") fixedAmount = 200;
        else if (categoryName === "CIV") fixedAmount = 220;
        break;
      case "furniture":
        fixedAmount = 100;
        break;
      case "jersey":
        fixedAmount = 120; // <-- Set your jersey amount here
        break;
      case "crest":
        fixedAmount = 10; // <-- Crest is always 10
        break;
      case "textBooks": {
        const textBookKey = Object.keys(textBooksMap).find(key => normalizedClassName.startsWith(key));
        fixedAmount = textBookKey ? textBooksMap[textBookKey] : 0;
        break;
      }
      case "exerciseBooks": {
        const exerciseBookKey = Object.keys(exerciseBooksMap).find(key => normalizedClassName.startsWith(key));
        fixedAmount = exerciseBookKey ? exerciseBooksMap[exerciseBookKey] : 0;
        break;
      }
      default:
        fixedAmount = 0;
    }
    total += fixedAmount;
  }
    console.log('classes:', classes.map(c => ({ id: c.id, name: c.name })));
    // console.log('classId:', classId, typeof classId, 'classes ids:', classes.map(c => c.id));
    // console.log('exerciseBookKey:', classNameRaw, 'normalizedClassName:', normalizedClassName);
    // console.log('Unpaid types:', feeTypes.filter(type => !paidTypes.includes(type)), 'Total left:', total);
  return Number.isNaN(total) ? 0 : total;
}