import source from "@/data/catalogue.json";

export type Lesson = {
  id: string;
  number: number;
  moduleId: number;
  position: number;
  title: string;
};
export type CourseModule = {
  id: number;
  title: string;
  emoji: string;
  optional: boolean;
  lessons: Lesson[];
};
export const modules: CourseModule[] = source;
export const lessons = modules.flatMap((module) => module.lessons);
export const findLesson = (id: string) =>
  lessons.find((lesson) => lesson.id === id);
export const pad = (number: number) => String(number).padStart(2, "0");
export const mandatoryLessons = lessons.filter(
  (lesson) => lesson.moduleId !== 2,
);

export function prerequisite(lesson: Lesson): string | null {
  if (lesson.number === 1) return null;
  // Le module 02 ne fait jamais partie des prérequis du module 03.
  return lesson.number === 13 ? "l006" : lessons[lesson.number - 2].id;
}

export function nextLesson(lesson: Lesson): Lesson | undefined {
  return lesson.number === 6 ? lessons[12] : lessons[lesson.number];
}
