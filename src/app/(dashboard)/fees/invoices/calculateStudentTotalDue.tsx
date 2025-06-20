export function calculateStudentTotalDue(
  student: any, // Student | RegistrationData
  categories: { id: number; name: string }[],
  classes: { id: number; name: string }[],
  paidTypes: string[] = [] // <-- add this parameter
): number {
  if (!student) return 0;

  const isApplicant = (student as any).class_applying_for !== undefined;

  const categoryId = student.category_id;
  const classId = isApplicant
    ? student.class_applying_for
    : student.class_id;

  const categoryName = categories.find(c => Number(c.id) === Number(categoryId))?.name?.toUpperCase() || "";
  const className = classes.find(cls => Number(cls.id) === Number(classId))?.name?.trim().toLowerCase() || "";

  const feeTypes = isApplicant
    ? ["registration", "levy", "furniture", "jersey_crest", "textBooks", "exerciseBooks"]
    : ["levy", "furniture", "jersey_crest", "textBooks", "exerciseBooks"];

  let total = 0;
  for (const type of feeTypes) {
    if (paidTypes.includes(type)) continue; // skip already paid types
    let fixedAmount = 0;
    switch (type) {
      case "levy":
        if (categoryName === "SVC" || categoryName === "MOD") fixedAmount = 200;
        else if (categoryName === "CIV") fixedAmount = 220;
        break;
      case "furniture":
        fixedAmount = 100;
        break;
      case "jersey_crest":
        fixedAmount = 120;
        break;
      case "registration":
        fixedAmount = 40;
        break;
      case "textBooks":
        if (className.includes("kg")) fixedAmount = 100;
        else if (className.includes("basic 1") || className.includes("basic 2")) fixedAmount = 120;
        else if (className.includes("basic 3") || className.includes("basic 4")) fixedAmount = 150;
        else if (className.includes("basic 5") || className.includes("basic 6")) fixedAmount = 180;
        else if (className.includes("basic 7") || className.includes("basic 8")) fixedAmount = 200;
        else fixedAmount = 200;
        break;
      case "exerciseBooks":
        if (className.includes("kg")) fixedAmount = 30;
        else if (className.includes("basic 1") || className.includes("basic 2")) fixedAmount = 50;
        else if (className.includes("basic 3") || className.includes("basic 4")) fixedAmount = 60;
        else if (className.includes("basic 5") || className.includes("basic 6")) fixedAmount = 70;
        else if (className.includes("basic 7") || className.includes("basic 8")) fixedAmount = 80;
        else fixedAmount = 50;
        break;
      default:
        fixedAmount = 0;
    }
    total += fixedAmount;
  }
  return Number.isNaN(total) ? 0 : total;
}